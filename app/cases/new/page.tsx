import CaseForm from '@/components/CaseForm';

export default function NewCasePage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Новий диспут</h2>
      <CaseForm />
    </main>
  );
}
