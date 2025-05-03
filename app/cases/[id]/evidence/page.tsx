'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EvidenceUploader from '@/components/EvidenceUploader';

export default function EvidencePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h2 className="text-2xl font-semibold text-white">Upload Evidence</h2>

      <EvidenceUploader caseId={params.id} />
    </main>
  );
}
