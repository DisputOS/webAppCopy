'use client';
import { useSearchParams } from 'next/navigation';

export default function ReviewPage() {
  const search = useSearchParams();
  const pdfUrl = search.get('pdf');
  return (
    <main className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Ваш PDF</h2>
      {pdfUrl ? (
        <a href={pdfUrl} className="text-blue-600 underline">Завантажити PDF</a>
      ) : 'Створення PDF...'}
    </main>
  );
}
