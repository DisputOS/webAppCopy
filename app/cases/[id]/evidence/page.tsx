import EvidenceUploader from '@/components/EvidenceUploader';

export default function EvidencePage({ params }: { params: { id: string } }) {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Додати докази</h2>
      <EvidenceUploader caseId={params.id} />
    </main>
  );
}
