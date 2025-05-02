'use client';
import { useState } from 'react';
import TemplateViewer from '@/components/TemplateViewer';
import { Button } from '@/components/ui/button';

export default function GeneratePage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const callApi = async (route: string) => {
    setLoading(true);
    const res = await fetch(`/api/${route}`, { method: 'POST', body: JSON.stringify({ disputeId: params.id }) });
    const data = await res.json();
    setTemplate(data.template);
    setConfidence(data.confidence ?? 0.8);
    setLoading(false);
  };

  if (!template) {
    return <Button onClick={() => callApi('generateTemplate')} disabled={loading}>{loading ? 'Генерується…' : 'Згенерувати шаблон'}</Button>;
  }

  return (
    <TemplateViewer
      template={template}
      confidence={confidence}
      onExplain={() => callApi('explainTemplate')}
      onRetry={() => callApi('generateTemplate')}
    />
  );
}
