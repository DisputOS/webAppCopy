'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Loader2 } from 'lucide-react';

export default function Callback() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const exchange = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.hash);

      if (!error) {
        router.replace('/cases');
      } else {
        console.error('Token exchange error:', error.message);
        router.replace('/login');
      }
    };

    exchange();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-4">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-400" />
        <p className="text-sm text-gray-300">Confirming your session…</p>
      </div>
    </main>
  );
}
