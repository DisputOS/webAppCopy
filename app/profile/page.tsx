'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('public_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const updatePlan = async (plan: string) => {
    if (!session) return;

    const { error } = await supabase
      .from('public_users')
      .update({ plan })
      .eq('id', session.user.id);

    if (!error) {
      toast.success(`✅ Plan upgraded to ${plan}`);
      setProfile({ ...profile, plan });
    }
  };

  if (!session) {
    return <div className="p-6 text-gray-300">Please log in to view your profile.</div>;
  }

  if (loading || !profile) {
    return (
      <div className="p-6 text-gray-300 flex items-center gap-2">
        <Loader2 className="animate-spin w-5 h-5" /> Loading profile…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="text-sm text-gray-400">
          <p><strong>Name:</strong> {profile.full_name ?? 'Not set'}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Current Plan:</strong> <span className="text-blue-400">{profile.plan ?? 'Free'}</span></p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Upgrade Plan</h2>
          <div className="space-y-3">
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <p className="font-medium">Pro Plan</p>
              <p className="text-sm text-gray-400">Unlock advanced dispute analysis and priority support.</p>
              <Button onClick={() => updatePlan('Pro')} className="mt-2">Choose Pro</Button>
            </div>
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <p className="font-medium">Premium Plan</p>
              <p className="text-sm text-gray-400">Everything in Pro plus automated legal filing.</p>
              <Button onClick={() => updatePlan('Premium')} className="mt-2">Choose Premium</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
