'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export default function SettingsPage() {
  const session = useSession();
  const supabase = useSupabaseClient();

  const [username, setUsername] = useState('');
  const [retentionOptIn, setRetentionOptIn] = useState(false);
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('auto');
  const [plan, setPlan] = useState('free');

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username, retention_opt_in, language_code, ai_response_tone_preference, plan')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUsername(data.username || '');
        setRetentionOptIn(data.retention_opt_in);
        setLanguage(data.language_code || 'en');
        setTone(data.ai_response_tone_preference || 'auto');
        setPlan(data.plan || 'free');
      } else {
        console.error('Failed to load settings:', error);
      }
    };

    fetchSettings();
  }, [session]);

  const handleSave = async () => {
    if (!session?.user) return;

    setLoading(true);

    const { error } = await supabase
      .from('users')
      .update({
        username,
        retention_opt_in: retentionOptIn,
        language_code: language,
        ai_response_tone_preference: tone,
      })
      .eq('id', session.user.id);

    setSaved(!error);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 font-mono">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold">My Settings</h1>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <Label htmlFor="username" className="block mb-1">Username</Label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              placeholder="yourname"
            />
            <p className="text-xs text-gray-500 mt-1">Used for display and refund documents.</p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="retention">Keep my uploaded data after case is closed</Label>
            <Switch id="retention" checked={retentionOptIn} onChange={setRetentionOptIn} />
          </div>

          <div>
            <Label htmlFor="language" className="block mb-1">Interface Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              <option value="en">English</option>
              <option value="uk">Українська</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <Label htmlFor="tone" className="block mb-1">AI Tone Preference</Label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              <option value="strict">Strict Evidence</option>
              <option value="soft">Soft Legal</option>
              <option value="auto">Auto / Context-Based</option>
            </select>
          </div>

          <div>
            <Label className="text-gray-400">
              Plan: <span className="text-white font-semibold">{plan}</span>
            </Label>
            <p className="text-xs text-gray-500">Plan controls PDF watermarking and escalation options.</p>
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : saved ? 'Save Settings ✅' : 'Save Settings'}
          </Button>
        </section>

        <p className="text-xs text-gray-500 text-center">
          Your preferences power Legal UX, AI logic and fraud control.
        </p>
      </div>
    </main>
  );
}
