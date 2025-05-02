'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function EvidenceUploader({ caseId }: { caseId: string }) {
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    await supabase.from('disputes').update({ evidence_text: evidence, status: 'evidence_provided' }).eq('id', caseId);
    window.location.href = `/cases/${caseId}/generate`;
  };

  return (
    <div className="space-y-4">
      <textarea value={evidence} onChange={e => setEvidence(e.target.value)} className="border p-2 rounded w-full" rows={6} placeholder="Опиши докази..." />
      <Button onClick={handleNext} disabled={loading}>Далі</Button>
    </div>
  );
}
