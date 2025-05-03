'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Props {
  caseId: string;
}

export default function EvidenceUploader({ caseId }: Props) {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [files, setFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const getUid = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.id) {
        setError('Unable to retrieve user.');
      } else {
        setUid(data.user.id);
      }
    };
    getUid();
  }, [supabase]);

  const handleUpload = async () => {
    if (!files?.length) return setError('Please select at least one file.');
    if (!uid) return setError('You must be logged in.');

    setError(null);
    setLoading(true);

    try {
      const urls: string[] = [];
      const BUCKET = 'proofbundle';
      const TABLE = 'proof_bundle';

      for (const file of Array.from(files)) {
        const filePath = `${caseId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, file, { upsert: false });
        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }

      const { error: insertErr } = await supabase.from(TABLE).insert([
        {
          user_id: uid,
          dispute_id: caseId,
          receipt_url: urls[0] ?? null,
          evidence_source: 'user_upload',
          dispute_type: 'digital_good',
          screenshot_urls: urls.slice(1),
          user_description: description,
          policy_snapshot: null,
        },
      ]);

      if (insertErr) throw insertErr;

      router.push(`/cases/${caseId}/generate`);
    } catch (err: any) {
      console.error('Insert error:', err.message);
      setError(err.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-gray-900 via-gray-950 to-black p-6 rounded-xl border border-gray-700 shadow-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Files</label>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => setFiles(e.target.files)}
          className="w-full border border-gray-700 bg-gray-800 text-sm text-white rounded-lg px-4 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-700 hover:file:bg-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg p-3 text-sm"
          rows={4}
          placeholder="Describe your evidence..."
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />} Upload & Continue
      </Button>
    </div>
  );
}
