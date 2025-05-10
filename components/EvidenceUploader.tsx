// -----------------------------------------------------------------------------
// file: src/components/EvidenceUploader.tsx  (replaced)
// Adds evidence‑type selector *and* resolves dispute_code → id so the FK constraint
// is never violated.
// -----------------------------------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  /**
   * Can be either the dispute row's UUID (primary key) **or** the user‑facing
   * dispute_code (e.g. "DP-20250510-SUBS-8F2K"). We’ll resolve it.
   */
  caseId: string;
}

type EvidenceType =
  | "digital_good"     // electronic receipt, PDF
  | "bank_statement"   // bank or card statement
  | "chat_screenshot"  // messenger / email screenshot
  | "other";

export default function EvidenceUploader({ caseId }: Props) {
  const supabase = useSupabaseClient();
  const router   = useRouter();

  // ---------------------------------------------------------
  // Local state
  // ---------------------------------------------------------
  const [files,          setFiles]          = useState<FileList | null>(null);
  const [description,    setDescription]    = useState("");
  const [evidenceType,   setEvidenceType]   = useState<EvidenceType>("digital_good");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [uid,            setUid]            = useState<string | null>(null);
  const [disputeId,      setDisputeId]      = useState<string | null>(null);

  // ---------------------------------------------------------
  // Fetch current user
  // ---------------------------------------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user?.id) setError("Unable to retrieve user.");
      else setUid(data.user.id);
    });
  }, [supabase]);

  // ---------------------------------------------------------
  // Resolve caseId → dispute.id (UUID) once on mount
  // ---------------------------------------------------------
  useEffect(() => {
    const resolveDispute = async () => {
      // 1️⃣ Try direct UUID match
      let { data, error } = await supabase
        .from("disputes")
        .select("id")
        .eq("id", caseId)
        .maybeSingle();

      if (!data || error) {
        // 2️⃣ Fallback: treat caseId as dispute_code
        const res = await supabase
          .from("disputes")
          .select("id")
          .eq("dispute_code", caseId)
          .maybeSingle();
        data  = res.data;
        error = res.error;
      }

      if (error || !data?.id) {
        setError("Dispute not found – please create a dispute first.");
      } else {
        setDisputeId(data.id);
      }
    };

    resolveDispute();
  }, [caseId, supabase]);

  // ---------------------------------------------------------
  // Upload handler
  // ---------------------------------------------------------
  const handleUpload = async () => {
    if (!files?.length) return setError("Please select at least one file.");
    if (!uid)          return setError("You must be logged in.");
    if (!disputeId)    return setError("Dispute not resolved.");

    setError(null);
    setLoading(true);

    try {
      const BUCKET = "proofbundle";
      const TABLE  = "proof_bundle";
      const urls: string[] = [];

      // ➊ Upload each file
      for (const file of Array.from(files)) {
        const filePath = `${disputeId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, file, { upsert: false });
        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }

      // ➋ Insert proof_bundle row
      const { error: insertErr } = await supabase.from(TABLE).insert([
        {
          user_id:          uid,
          dispute_id:       disputeId,           // ✅ FK now valid
          receipt_url:      urls[0] ?? null,
          evidence_source:  "user_upload",
          dispute_type:     evidenceType,        // chosen by user
          screenshot_urls:  urls.slice(1),
          user_description: description,
          policy_snapshot:  null,
        },
      ]);

      if (insertErr) throw insertErr;

      router.push(`/cases/${caseId}/generate`);
    } catch (err: any) {
      console.error("Insert error:", err.message);
      setError(err.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-700">
      {/* Evidence type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Evidence type
        </label>
        <select
          value={evidenceType}
          onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
          className="w-full border border-gray-700 bg-gray-800 text-sm text-white rounded-lg p-2"
        >
          <option value="digital_good">Electronic receipt / PDF</option>
          <option value="bank_statement">Bank statement</option>
          <option value="chat_screenshot">Chat screenshot</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* File input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload files
        </label>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => setFiles(e.target.files)}
          className="w-full border border-gray-700 bg-gray-800 text-sm text-white rounded-lg px-4 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 hover:file:bg-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg p-3 text-sm"
          rows={4}
          placeholder="Describe your evidence..."
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <Button
        onClick={handleUpload}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-gray-500 text-white bg-transparent hover:bg-gray-800"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />} Upload & Continue
      </Button>
    </div>
  );
}
