'use client';

import { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { CheckCircle, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const QUESTION_FLOW_BY_TYPE: Record<string, string[]> = {
  subscription_auto_renewal: [
    'amount_currency',
    'platform',
    'purchase_date',
    'service_usage',
    'description',
    'confirm'
  ],
  item_not_delivered: [
    'amount_currency',
    'platform',
    'purchase_date',
    'tracking_info',
    'description',
    'confirm'
  ],
  other: [
    'amount_currency',
    'platform',
    'purchase_date',
    'problem_type',
    'description',
    'confirm'
  ]
};

export default function NewDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<any>({
    purchase_amount: '',
    currency: '',
    platform_name: '',
    purchase_date: '',
    problem_type: '',
    description: '',
    service_usage: '',
    tracking_info: ''
  });

  const flowSteps = QUESTION_FLOW_BY_TYPE[form.problem_type] || QUESTION_FLOW_BY_TYPE['other'];
  const currentStep = flowSteps[step];

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 'amount_currency':
        return !!form.purchase_amount && parseFloat(form.purchase_amount) > 0 && !!form.currency;
      case 'platform':
        return !!form.platform_name;
      case 'purchase_date':
        return !!form.purchase_date && new Date(form.purchase_date) <= new Date();
      case 'problem_type':
        return !!form.problem_type;
      case 'service_usage':
        return form.service_usage === 'yes' || form.service_usage === 'no';
      case 'tracking_info':
        return true;
      case 'description':
        return form.description.trim().length >= 20;
      case 'confirm':
        return agree;
      default:
        return true;
    }
  };

  const next = () => validateStep() && setStep((s) => Math.min(s + 1, flowSteps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!session) return;
    setLoading(true);

    const fullDisputePayload = {
      user_id: session.user.id,
      platform_name: form.platform_name,
      purchase_amount: parseFloat(form.purchase_amount || '0'),
      currency: form.currency,
      purchase_date: form.purchase_date ? new Date(form.purchase_date).toISOString() : null,
      problem_type: form.problem_type,
      description: form.description,
      user_plan: 'free',
      status: 'draft',
      user_confirmed_input: true,
      training_permission: false,
      archived: false,
      gpt_response: null,
      fraud_flags: null,
      ai_confidence_score: null,
      risk_score: null,
      proof_clarity_score: null,
      success_flow_triggered: false,
      user_confirmed_nda: false,
      ai_act_risk_level: null,
      dispute_health: null,
      pii_filtered: false,
      data_deleted: false,
      gdpr_erased_at: null,
      ai_override_executed: false,
      case_health: null
    };

    try {
      const res = await fetch('/functions/v1/submit_dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullDisputePayload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');

      router.push(`/cases/${result.id}`);
    } catch (err: any) {
      console.error('❌ Edge Function error:', err.message);
      alert('Insert failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'amount_currency':
        return (
          <>
            <Input placeholder="Amount (e.g. 20)" value={form.purchase_amount} onChange={(e) => handleChange('purchase_amount', e.target.value)} />
            <Input placeholder="Currency (e.g. EUR)" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} />
          </>
        );
      case 'platform':
        return (
          <Input placeholder="Platform (e.g. Notion)" value={form.platform_name} onChange={(e) => handleChange('platform_name', e.target.value)} />
        );
      case 'purchase_date':
        return (
          <Input type="date" value={form.purchase_date} onChange={(e) => handleChange('purchase_date', e.target.value)} />
        );
      case 'problem_type':
        return (
          <select
            value={form.problem_type}
            onChange={(e) => handleChange('problem_type', e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded p-2"
          >
            <option value="">Select problem type</option>
            <option value="subscription_auto_renewal">Subscription auto-renewal</option>
            <option value="item_not_delivered">Item not delivered</option>
            <option value="other">Other</option>
          </select>
        );
      case 'service_usage':
        return (
          <select
            value={form.service_usage}
            onChange={(e) => handleChange('service_usage', e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded p-2"
          >
            <option value="">Did you use the service?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        );
      case 'tracking_info':
        return (
          <Input placeholder="Tracking number (optional)" value={form.tracking_info} onChange={(e) => handleChange('tracking_info', e.target.value)} />
        );
      case 'description':
        return (
          <textarea
            className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm min-h-[120px]"
            placeholder="Describe the issue in detail (min 20 characters)..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        );
      case 'confirm':
        return (
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I confirm the information is accurate.
          </label>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">New Dispute</h2>

        <div className="flex gap-3 justify-center mb-6">
          {flowSteps.map((_, i) => (
            <span key={i}>
              {i <= step ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
            </span>
          ))}
        </div>

        <section className="space-y-6">
          {renderStep()}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step < flowSteps.length - 1 ? (
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
