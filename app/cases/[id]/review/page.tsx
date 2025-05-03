'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const search = useSearchParams();
  const pdfUrl = search.get('pdf');

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <h2 className="text-2xl font-semibold text-blue-700">Ваш PDF</h2>

      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Завантажити PDF
        </a>
      ) : (
        <p className="text-gray-600">Створення PDF…</p>
      )}
    </main>
  );
}
