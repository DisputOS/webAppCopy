// -----------------------------------------------------------------------------
// file: src/components/EvidenceUploader.tsx
// Adds a dropdown so the user can select what *type* of evidence they are
// uploading. The selected value is stored in the `dispute_type` column of the
// `proof_bundle` table.
// -----------------------------------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  caseId: string;
}

export default function EvidenceUploader({ caseId }: Props) {
  const supabase = useSupabaseClient();
  const router   = useRouter();

  const [files,       setFiles]       = useState<FileList | null>(null);
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("");            // NEW 👈
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [uid,         setUid]         = useState<string | null>(null);

  // -----------------------------------------------------------
  //  Get current user's ID once on mount
  // -----------------------------------------------------------
  useEffect(() => {
    const getUid = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.id) {
        setError("Unable to retrieve user.");
      } else {
        setUid(data.user.id);
      }
    };
    getUid();
  }, [supabase]);

  // -----------------------------------------------------------
  //  Upload handler
  // -----------------------------------------------------------
  const handleUpload = async () => {
    if (!files?.length) return setError("Please select at least one file.");
    if (!evidenceType)  return setError("Please choose the evidence type."); // NEW
    if (!uid)          return setError("You must be logged in.");

    setError(null);
    setLoading(true);

    try {
      const urls: string[] = [];
      const BUCKET = "proofbundle";
      const TABLE  = "proof_bundle";

      // 1. Upload every selected file to storage --------------------------
      for (const file of Array.from(files)) {
        const filePath = `${caseId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, file, { upsert: false });
        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }

      // 2. Insert record into proof_bundle -------------------------------
      const { error: insertErr } = await supabase.from(TABLE).insert([
        {
          user_id:          uid,
          dispute_id:       caseId,
          receipt_url:      urls[0] ?? null,
          evidence_source:  "user_upload",
          dispute_type:     evidenceType,  // NEW – dynamic value
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

  // -----------------------------------------------------------
  //  Render UI
  // -----------------------------------------------------------
  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-700">
      {/* File picker ---------------------------------------------------- */}
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

      {/* Evidence type selector ----------------------------------------- */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Evidence type
        </label>
        <select
          value={evidenceType}
          onChange={(e) => setEvidenceType(e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg p-2 text-sm"
        >
          <option value="">Select evidence type</option>
          <option value="receipt">Receipt / Invoice</option>
          <option value="bank_statement">Bank statement</option>
          <option value="chat_screenshot">Chat screenshot</option>
          <option value="tracking_doc">Tracking / shipping doc</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Free‑text description ------------------------------------------ */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg p-3 text-sm"
          rows={4}
          placeholder="Describe your evidence…"
        />
      </div>

      {/* Error banner ---------------------------------------------------- */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Upload button --------------------------------------------------- */}
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
