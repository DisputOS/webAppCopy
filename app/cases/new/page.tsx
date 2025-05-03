'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  'Amount & Currency',
  'Platform',
  'Purchase Date',
  'Problem Type',
  'Problem Description',
  'Confirmation'
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
    <main className="max-w-xl mx-auto p-6 text-white font-mono">
      <h1 className="text-2xl font-bold text-white mb-4">New Dispute</h1>

      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <span key={i}>
            {i <= step ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500" />
            )}
          </span>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 animate-fadeIn">
        <h2 className="text-lg font-semibold">Step {step + 1} / {steps.length}: {steps[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <Input placeholder="Amount (e.g., 300)" value={form.purchase_amount} onChange={(e) => handleChange('purchase_amount', e.target.value)} />
            <Input placeholder="Currency (e.g., EUR)" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} />
          </div>
        )}

        {step === 1 && (
          <Input placeholder="Platform (e.g., Kaufland)" value={form.platform_name} onChange={(e) => handleChange('platform_name', e.target.value)} />
        )}

        {step === 2 && (
          <Input type="date" value={form.purchase_date} onChange={(e) => handleChange('purchase_date', e.target.value)} />
        )}

        {step === 3 && (
          <Input placeholder="Problem type (e.g., item not delivered)" value={form.problem_type} onChange={(e) => handleChange('problem_type', e.target.value)} />
        )}

        {step === 4 && (
          <textarea
            placeholder="Describe the issue (at least 20 characters)..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full border border-gray-700 rounded p-3 text-sm min-h-[100px] bg-gray-950 text-white"
          />
        )}

        {step === 5 && (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="text-sm">I confirm the information is accurate</span>
            </label>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={back} disabled={step === 0}>Back</Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} disabled={!validateStep()}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !validateStep()}>
              {loading ? 'Saving...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
