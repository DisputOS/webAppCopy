// app/auth/callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Loader2 } from 'lucide-react';

export default function Callback() {
  const supabase = useSupabaseClient();
  const router   = useRouter();
  const params   = useSearchParams();

  useEffect(() => {
    const exchange = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(params);
      // ^ v0.5+ auth-helpers parses access_token / refresh_token из URL
      if (!error) router.replace('/cases');
      else router.replace('/login'); // fallback
    };
    exchange();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
    </main>
  );
}
