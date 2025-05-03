'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function UserProfilePage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [session]);

  if (!session) {
    return <p className="text-center text-gray-400 mt-12">Please log in to view your profile.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto font-mono">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Image
            src={profile?.avatar_url || '/default-avatar.png'}
            alt="Profile Avatar"
            width={64}
            height={64}
            className="rounded-full border border-gray-700"
          />
          <div>
            <p className="text-lg font-semibold">{profile?.full_name || 'No name set'}</p>
            <p className="text-sm text-gray-400">{session.user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Current Plan:</p>
          <p className="text-base font-medium">{profile?.plan || 'Free'}</p>
          <Button
            onClick={() => router.push('/pricing')}
            className="mt-2 bg-blue-600 hover:bg-blue-500 text-white"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>
    </main>
  );
}
