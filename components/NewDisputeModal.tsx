'use client';

import { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { CheckCircle, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const steps = [
  'Amount & Currency',
  'Platform',
  'Purchase Date',
  'Problem Type',
  'Description',
  'Confirm'
];

export default function NewDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    purchase_amount: '',
    currency: '',
    platform_name: '',
    purchase_date: '',
    problem_type: '',
    description: ''
  });

  const handleChange = (field: keyof typeof form, value: string) => {
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

  const next = () => validateStep() && setStep((s) => Math.min(s + 1, steps.length - 1));
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
    if (!error) {
      onClose();
      location.reload(); // Refresh case list
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">New Dispute</h2>

        {/* Progress */}
        <div className="flex gap-3 justify-center mb-6">
          {steps.map((_, i) => (
            <span key={i}>
              {i <= step ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
            </span>
          ))}
        </div>

        {/* Step UI */}
        <section className="space-y-6">
          {step === 0 && (
            <div className="space-y-3">
              <Input
                placeholder="Amount (e.g., 300)"
                value={form.purchase_amount}
                onChange={(e) => handleChange('purchase_amount', e.target.value)}
              />
              <Input
                placeholder="Currency (e.g., EUR)"
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              />
            </div>
          )}

          {step === 1 && (
            <Input
              placeholder="Platform (e.g., Amazon)"
              value={form.platform_name}
              onChange={(e) => handleChange('platform_name', e.target.value)}
            />
          )}

          {step === 2 && (
            <Input
              type="date"
              value={form.purchase_date}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
            />
          )}

          {step === 3 && (
            <Input
              placeholder="Problem (e.g., item not delivered)"
              value={form.problem_type}
              onChange={(e) => handleChange('problem_type', e.target.value)}
            />
          )}

          {step === 4 && (
            <textarea
              placeholder="Describe the issue in detail (min 20 characters)..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm min-h-[120px]"
            />
          )}

          {step === 5 && (
            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              I confirm the information is accurate.
            </label>
          )}

          {/* Controls */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} disabled={!validateStep()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !validateStep()}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
