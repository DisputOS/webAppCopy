'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export default function SettingsPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { theme, setTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [retentionOptIn, setRetentionOptIn] = useState(false);
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('auto');
  const [plan, setPlan] = useState('free');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!session?.user?.email) {
      setPasswordError('User email not found.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordError('Failed to update password.');
    } else {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen p-6 space-y-6 bg-white text-black dark:bg-gray-900 dark:text-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-3xl font-bold">My Settings</h1>

          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <Label htmlFor="username" className="block mb-1">Username</Label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-2"
                placeholder="yourname"
              />
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
                className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-2"
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
                className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-2"
              >
                <option value="strict">Strict Evidence</option>
                <option value="soft">Soft Legal</option>
                <option value="auto">Auto / Context-Based</option>
              </select>
            </div>

            <div>
              <Label htmlFor="theme" className="block mb-1">Appearance</Label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-2"
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-600 dark:text-gray-400">
                Plan: <span className="text-black dark:text-white font-semibold">{plan}</span>
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Plan controls PDF watermarking and escalation options.</p>
            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : saved ? 'Save Settings ✅' : 'Save Settings'}
            </Button>
          </section>

          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Change Password</h2>

            <div>
              <Label htmlFor="current-password" className="block mb-1">Current Password</Label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-2"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <Label htmlFor="new-password" className="block mb-1">New Password</Label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-2"
                placeholder="Enter new password"
              />
            </div>

            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-500 text-sm">Password updated successfully</p>}

            <Button
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword}
            >
              Change Password
            </Button>
          </section>

          <p className="text-xs text-gray-500 text-center dark:text-gray-400">
            Your preferences power Legal UX, AI logic and fraud control.
          </p>
        </div>
      </main>
    </>
  );
}