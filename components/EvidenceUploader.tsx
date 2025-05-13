
// -----------------------------------------------------------------------------
// file: src/components/EvidenceUploader.tsx   (client component)
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

  const [files, fileDispatch] = useState<FileList | null>(null);
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [uid, setUid]           = useState<string | null>(null);

  useEffect(() => {
    async function getUid() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) setError("Unable to retrieve user.");
      else setUid(data.user.id);
    }
    getUid();
  }, [supabase]);

  const handleUpload = async () => {
    if (!files?.length) return setError("Please select at least one file.");
    if (!evidenceType)  return setError("Please choose the evidence type.");
    if (!uid) return setError("You must be logged in.");

    setError(null);
    setLoading(true);
    try {
      const urls: string[] = [];
      const BUCKET = "proofbundle";
      const TABLE  = "proof_bundle";
      for (const file of Array.from(files)) {
        const filePath = `${caseId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(filePath, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        urls.push(urlData.publicUrl);
      }
      const { error: insertErr } = await supabase.from(TABLE).insert([{
        user_id:        uid,
        dispute_id:     caseId,
        receipt_url:    urls[0],
        evidence_source:"user_upload",
        dispute_type:   evidenceType,
        screenshot_urls:urls.slice(1),
        user_description:description,
        policy_snapshot: null,
      }]);
      if (insertErr) throw insertErr;
      router.push(`/cases/${caseId}/generate`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-700">
      {/* File picker */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Upload files</label>
        <input type="file" multiple accept="image/*,application/pdf" onChange={e => fileDispatch(e.target.files)} className="file-input" />
      </div>
      {/* Evidence type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Evidence type</label>
        <select value={evidenceType} onChange={e => setEvidenceType(e.target.value)} className="select-input">
          <option value="">Select evidence type</option>
          <option value="receipt">Receipt / Invoice</option>
          <option value="bank_statement">Bank statement</option>
          <option value="chat_screenshot">Chat screenshot</option>
          <option value="tracking_doc">Tracking / shipping doc</option>
          <option value="other">Other</option>
        </select>
      </div>
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="textarea-input" placeholder="Describe your evidence…" />
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <Button onClick={handleUpload} disabled={loading} className="w-full flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload & Continue'}
      </Button>
    </div>
  );
}
