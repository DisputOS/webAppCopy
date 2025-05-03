'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  'Сума та валюта',
  'Платформа',
  'Дата покупки',
  'Тип проблеми',
  'Опис проблеми',
  'Підтвердження'
];

export default function NewDisputePage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    purchase_amount: '',
    currency: '',
    platform_name: '',
    purchase_date: '',
    problem_type: '',
    description: ''
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        return !!form.purchase_amount && parseFloat(form.purchase_amount) > 0 && !!form.currency;
      case 1:
        return !!form.platform_name;
      case 2:
        return !!form.purchase_date && new Date(form.purchase_date) <= new Date();
      case 3:
        return !!form.problem_type;
      case 4:
        return form.description.trim().length >= 20;
      case 5:
        return agree;
      default:
        return true;
    }
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!session) return;
    setLoading(true);

    const { error } = await supabase.from('disputes').insert([
      {
        user_id: session.user.id,
        purchase_amount: parseFloat(form.purchase_amount),
        currency: form.currency,
        platform_name: form.platform_name,
        purchase_date: form.purchase_date,
        problem_type: form.problem_type,
        description: form.description,
        status: 'draft'
      }
    ]);

    setLoading(false);
    if (!error) router.push('/cases');
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Новий спір</h1>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <span key={i}>
            {i <= step ? (
              <CheckCircle className="w-5 h-5 text-blue-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-6 animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-700">Крок {step + 1} / {steps.length}: {steps[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <Input placeholder="Сума (наприклад, 300)" value={form.purchase_amount} onChange={(e) => handleChange('purchase_amount', e.target.value)} />
            <Input placeholder="Валюта (наприклад, євро)" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} />
          </div>
        )}

        {step === 1 && (
          <Input placeholder="Платформа (наприклад, Kaufland)" value={form.platform_name} onChange={(e) => handleChange('platform_name', e.target.value)} />
        )}

        {step === 2 && (
          <Input type="date" value={form.purchase_date} onChange={(e) => handleChange('purchase_date', e.target.value)} />
        )}

        {step === 3 && (
          <Input placeholder="Тип проблеми (наприклад, товар не прийшов)" value={form.problem_type} onChange={(e) => handleChange('problem_type', e.target.value)} />
        )}

        {step === 4 && (
          <textarea
            placeholder="Опис ситуації (мінімум 20 символів)..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full border rounded p-3 text-sm min-h-[100px]"
          />
        )}

        {step === 5 && (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="text-sm text-gray-700">Я підтверджую достовірність інформації</span>
            </label>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={back} disabled={step === 0}>Назад</Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} disabled={!validateStep()}>Далі</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !validateStep()}>
              {loading ? 'Збереження...' : 'Завершити'}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
