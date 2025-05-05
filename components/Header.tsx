'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={clsx(
          'flex items-center gap-2 text-sm transition px-2 py-1 rounded',
          isActive ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white'
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 p-4 mb-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/cases" className="text-xl font-bold text-white tracking-tight">
          Disput<span className="text-blue-500">.ai</span>
        </Link>

        {session && (
          <nav className="flex items-center gap-4">
            <NavLink href="/profile" icon={User} label="Profile" />
            <NavLink href="/settings" icon={Settings} label="Settings" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 px-2 py-1 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
