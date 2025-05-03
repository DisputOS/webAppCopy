'use client';

import { useRouter } from 'next/navigation';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 p-4 mb-6 flex items-center justify-between">
      <Link href="/cases">
        <h1 className="text-xl font-bold text-white">Disput<span className="text-blue-500">.ai</span></h1>
      </Link>

      {session && (
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <User className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Profile</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
