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

  const [files, setFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError('Оберіть хоча б один файл');
      return;
    }
    if (!session) {
      setError('Потрібно увійти');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. загружаем файлы у bucket `proof_bundle`
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const filePath = `${caseId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('proof.bundle')
          .upload(filePath, file, { upsert: false });
        if (uploadErr) throw uploadErr;

        const {
          data: { publicUrl },
        } = supabase.storage.from('proof_bundle').getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      // 2. вставляем строку в таблицу `proof_bundle`
      const { error: insertErr } = await supabase.from('proof_bundle').insert([
        {
          user_id: session.user.id,
          dispute_id: caseId,
          receipt_url: urls[0] || null, // первое загруженное как «чек» (пример)
          evidence_source: 'user_upload',
          dispute_type: 'digital_good',
          screenshot_urls: urls.slice(1), // остальные как скрины
          user_description: description,
          policy_snapshot: null, // заполни, если надо
        },
      ]);

      if (insertErr) throw insertErr;

      // 3. переход на шаг генерации
      router.push(`/cases/${caseId}/generate`);
    } catch (err: any) {
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

      <Button onClick={handleUpload} disabled={loading} className="flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Завантажити та продовжити
      </Button>
    </div>
  );
}
