'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [form, setForm] = useState({
    username: '',
    country_code: '',
    language_code: '',
    timezone: '',
    ai_response_tone_preference: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session) return;
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) setForm(data);
    };
    fetchUser();
  }, [session]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!session) return;
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({
        username: form.username,
        country_code: form.country_code,
        language_code: form.language_code,
        timezone: form.timezone,
        ai_response_tone_preference: form.ai_response_tone_preference,
      })
      .eq('id', session.user.id);
    setLoading(false);
    setMessage(error ? 'Failed to save.' : 'Settings saved.');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Username</label>
          <Input value={form.username} onChange={(e) => handleChange('username', e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">Country Code</label>
          <Input value={form.country_code} onChange={(e) => handleChange('country_code', e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">Language Code</label>
          <Input value={form.language_code} onChange={(e) => handleChange('language_code', e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">Timezone</label>
          <Input value={form.timezone} onChange={(e) => handleChange('timezone', e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">AI Tone Preference</label>
          <Input value={form.ai_response_tone_preference} onChange={(e) => handleChange('ai_response_tone_preference', e.target.value)} />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save Settings'}
        </Button>
        {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">💳 Payment Method (via Stripe)</h2>
        <p className="text-sm text-gray-400 mb-2">
          You can add or update your payment method securely via Stripe.
        </p>
        <Button variant="outline" onClick={() => alert('TODO: Stripe integration logic.')}>Update Payment Method</Button>
      </div>
    </main>
  );
}
