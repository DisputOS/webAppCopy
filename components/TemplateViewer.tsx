// -----------------------------------------------------------------------------
// UNACTIVE file
// -----------------------------------------------------------------------------
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TemplateViewer({ template, confidence, onExplain, onRetry }: { template: string, confidence: number, onExplain: () => void, onRetry: () => void }) {
  return (
    <div>
      <p className="whitespace-pre-line border p-4 rounded-md">{template}</p>
      <div className="mt-4 flex gap-2">
        <Button onClick={onExplain}>Пояснити</Button>
        <Button onClick={onRetry} className="bg-gray-600">Інший варіант</Button>
      </div>
      <div className="mt-2 text-sm text-gray-600">Впевненість AI: {(confidence * 100).toFixed(0)}%</div>
    </div>
  );
}
