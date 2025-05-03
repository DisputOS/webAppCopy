'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    country_code: '',
    language_code: '',
    timezone: '',
    ai_response_tone_preference: '',
  });

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username, country_code, language_code, timezone, ai_response_tone_preference')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    await supabase.from('users').update(profile).eq('id', session?.user.id);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <Input
          placeholder="Username"
          value={profile.username}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
        />
        <Input
          placeholder="Country Code (e.g. DE, US)"
          value={profile.country_code}
          onChange={(e) => setProfile({ ...profile, country_code: e.target.value })}
        />
        <Input
          placeholder="Language Code (e.g. en, uk, de)"
          value={profile.language_code}
          onChange={(e) => setProfile({ ...profile, language_code: e.target.value })}
        />
        <Input
          placeholder="Timezone (e.g. Europe/Berlin)"
          value={profile.timezone}
          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
        />
        <Input
          placeholder="AI Tone (soft, strict, neutral, auto)"
          value={profile.ai_response_tone_preference}
          onChange={(e) => setProfile({ ...profile, ai_response_tone_preference: e.target.value })}
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving…' : 'Save Changes'}
      </Button>
    </main>
  );
}
