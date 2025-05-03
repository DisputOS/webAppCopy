'use client';

import { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Props {
  caseId: string;
}

export default function EvidenceUploader({ caseId }: Props) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  // ─────────────────────────── state
  const [files, setFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────── config
  const BUCKET = 'proof.bundle';       // ← точное имя бакета в Storage
  const TABLE  = 'proof_bundle';       // ← точное имя таблицы в Postgres

  const handleUpload = async () => {
    // basic checks
    if (!files?.length) return setError('Оберіть хоча б один файл');
    if (!session)      return setError('Потрібно увійти');

    setError(null);
    setLoading(true);

    try {
      /* 1. Upload every selected file to Storage bucket */
      const urls: string[] = [];

      for (const file of Array.from(files)) {
        const filePath = `${caseId}/${Date.now()}-${file.name}`;

        const { error: uploadErr } = await supabase
          .storage
          .from(BUCKET)
          .upload(filePath, file, { upsert: false });

        if (uploadErr) throw uploadErr;

        // get public URL of the uploaded object
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      /* 2. Insert a row into proof_bundle table */
      const { error: insertErr } = await supabase
        .from(TABLE)
        .insert([
          {
            user_id:       session.user.id,
            dispute_id:    caseId,
            receipt_url:   urls[0] ?? null,
            evidence_source: 'user_upload',
            dispute_type:  'digital_good',
            screenshot_urls: urls.slice(1),
            user_description: description,
            policy_snapshot: null,
          },
        ]);

      if (insertErr) throw insertErr;

      /* 3. Redirect to template‑generation step */
      router.push(`/cases/${caseId}/generate`);
    } catch (err: any) {
      console.error(err);                      // ← увидите полный текст ошибки
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
        Завантажити та продовжити
      </Button>
    </div>
  );
}
