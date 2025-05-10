// -----------------------------------------------------------------------------
// file: src/components/Header.tsx   (re‑written)
// Adds a bell icon with unread badge. Clicking it toggles a dropdown that shows
// the latest unread notifications pulled from – and synced with – Supabase
// (table `user_notifications`). You can replace the entire old Header with this
// one‑stop version.
// -----------------------------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  useSupabaseClient,
  useSession,
} from "@supabase/auth-helpers-react";
import {
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Folder,
  Bell,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button"; // if you already have this helper

// -----------------------------------------------------------------------------
// Small helper type
// -----------------------------------------------------------------------------
interface NotificationRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export default function Header() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  // -----------------------------------------
  //   Fetch & subscribe to notifications
  // -----------------------------------------
  useEffect(() => {
    if (!session) return;

    // 1) initial fetch (only unread)
    supabase
      .from("user_notifications")
      .select("id, title, body, created_at, read_at")
      .eq("user_id", session.user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setNotifications(data as NotificationRow[]);
      });

    // 2) realtime
    const channel = supabase
      .channel("user_notifications_header")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          setNotifications((n) => [payload.new as NotificationRow, ...n]);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, session]);

  // mark single message as read locally + server
  async function markRead(id: string) {
    setNotifications((n) => n.filter((m) => m.id !== id));
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  }

  // mark all
  async function markAllRead() {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    if (ids.length)
      await supabase
        .from("user_notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", ids);
  }

  // -----------------------------------------
  //   Logout
  // -----------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // -----------------------------------------
  //   Internal NavLink component
  // -----------------------------------------
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
        onClick={() => setMenuOpen(false)}
        className={clsx(
          "flex items-center gap-3 text-sm transition px-4 py-2 rounded",
          isActive ? "text-white bg-gray-800" : "text-gray-300 hover:text-white",
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  };

  // -----------------------------------------
  //   Render
  // -----------------------------------------
  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 p-4 z-50 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-white"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link
          href="/cases"
          className="text-xl font-bold text-white tracking-tight ml-auto sm:ml-0"
        >
          Disput<span className="text-blue-500">.ai</span>
        </Link>

        {/* Desktop nav */}
        {session && (
          <nav className="hidden sm:flex items-center gap-4">
            <NavLink href="/cases" icon={Folder} label="Cases" />
            <NavLink href="/profile" icon={User} label="Profile" />
            <NavLink href="/settings" icon={Settings} label="Settings" />

            {/* Bell icon with badge */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-lg z-50 animate-fade-in-down">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                    <span className="text-sm font-medium text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <Button size="xs" variant="ghost" onClick={markAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-sm text-gray-400">No unread messages</p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-800">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className="px-4 py-3 hover:bg-gray-800 cursor-pointer"
                        >
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
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

      {/* Mobile nav */}
      {menuOpen && session && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-gray-900 border-t border-gray-800 shadow-md animate-fade-in-down">
          <div className="flex flex-col py-2">
            <NavLink href="/cases" icon={Folder} label="Cases" />
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
