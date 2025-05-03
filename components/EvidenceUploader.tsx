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
        setError('Не вдалося отримати користувача');
      } else {
        setUid(data.user.id);
      }
    };
    getUid();
  }, [supabase]);

  const handleUpload = async () => {
    if (!files?.length) return setError('Оберіть хоча б один файл');
    if (!uid) return setError('Потрібно увійти');

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
          user_id: uid, // ✅ гарантія, що foreign key не буде порушено
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
      setError(err.message ?? 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={(e) => setFiles(e.target.files)}
        className="block w-full border rounded p-2"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full"
        rows={4}
        placeholder="Опиши докази…"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Завантажити та продовжити
      </Button>
    </div>
  );
}
