// UNACTIVE FILE!

'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TemplateViewer from '@/components/TemplateViewer';
import { Button } from '@/components/ui/button';

export default function GeneratePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async (route: 'generateTemplate' | 'explainTemplate') => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/${route}`, {
        method: 'POST',
        body: JSON.stringify({ disputeId: params.id }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setTemplate(data.template ?? null);
      setConfidence(data.confidence ?? 0.8);
    } catch (err: any) {
      setError(err.message || 'Помилка запиту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <h2 className="text-2xl font-semibold text-blue-700">Генерація шаблону</h2>

      {error && (
        <p className="text-red-600 text-sm border border-red-200 rounded p-3">{error}</p>
      )}

      {!template ? (
        <Button onClick={() => callApi('generateTemplate')} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Генерується…' : 'Згенерувати шаблон'}
        </Button>
      ) : (
        <TemplateViewer
          template={template}
          confidence={confidence}
          onExplain={() => callApi('explainTemplate')}
          onRetry={() => callApi('generateTemplate')}
        />
      )}
    </main>
  );
}
