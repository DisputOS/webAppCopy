'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EvidenceUploader from '@/components/EvidenceUploader';

export default function EvidencePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <h2 className="text-2xl font-semibold text-blue-700">Додати докази</h2>

      {/* EvidenceUploader handles its own Supabase upload & progress */}
      <EvidenceUploader caseId={params.id} />
    </main>
  );
}
