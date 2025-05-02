'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function CaseForm() {
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('disputes').insert({
      problem_type: problemType,
      description,
      status: 'draft'
    }).select().single();
    if (!error) {
      window.location.href = `/cases/${data.id}/evidence`;
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <select value={problemType} onChange={e => setProblemType(e.target.value)} className="border p-2 rounded w-full">
        <option value="">Обери тип проблеми</option>
        <option value="late_delivery">Запізнення доставки</option>
        <option value="faulty_goods">Неякісний товар</option>
      </select>
      <textarea value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded w-full" rows={5} placeholder="Опиши проблему..." />
      <Button onClick={handleSubmit} disabled={loading || !problemType || !description}>
        {loading ? 'Зберігаю...' : 'Далі'}
      </Button>
    </div>
  );
}
