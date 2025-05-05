'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { User, Settings, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
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
        onClick={() => setMenuOpen(false)} // auto close on mobile
        className={clsx(
          'flex items-center gap-3 text-sm transition px-4 py-2 rounded',
          isActive ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white'
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 p-4 z-50 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-white"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Right: Logo */}
        <Link
          href="/cases"
          className="text-xl font-bold text-white tracking-tight ml-auto sm:ml-0"
        >
          Disput<span className="text-blue-500">.ai</span>
        </Link>

        {/* Desktop Nav */}
        {session && (
          <nav className="hidden sm:flex items-center gap-4">
            <NavLink href="/profile" icon={User} label="Profile" />
            <NavLink href="/settings" icon={Settings} label="Settings" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 px-2 py-1 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </div>

      {/* Mobile Slide-out Nav */}
      {menuOpen && session && (
        <div
          className="sm:hidden absolute top-full left-0 w-full bg-gray-900 border-t border-gray-800 shadow-md animate-fade-in-down"
        >
          <div className="flex flex-col py-2">
            <NavLink href="/profile" icon={User} label="Profile" />
            <NavLink href="/settings" icon={Settings} label="Settings" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm text-red-500 hover:text-red-400 px-4 py-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
