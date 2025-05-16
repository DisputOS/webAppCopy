// -----------------------------------------------------------------------------
// file: src/components/Header.tsx
// Responsive header with notification bell in both desktop & mobile
// -----------------------------------------------------------------------------


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
import { Button } from "@/components/ui/button";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface NotificationRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function Header() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  // ---------------------------------------------------------------------------
  // Fetch & subscribe to unread notifications
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!session) return;

    // Initial fetch
    supabase
      .from("user_notifications")
      .select("id, title, body, created_at, read_at")
      .eq("user_id", session.user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setNotifications(data as NotificationRow[]);
      });

    // Real‑time inserts
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
      channel.unsubscribe().catch(() => {});
    };
  }, [supabase, session]);

  // Mark helpers --------------------------------------------------------------
  const markRead = async (id: string) => {
    setNotifications((n) => n.filter((m) => m.id !== id));
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  };

  const markAllRead = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    if (ids.length) {
      await supabase
        .from("user_notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", ids);
    }
  };

  // Logout --------------------------------------------------------------------
 // Logout --------------------------------------------------------------------
const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (err: any) {
    // Ignore “Auth session missing!” & log the rest
    if (!err?.message?.includes("session missing")) {
      console.error("Logout error:", err.message);
    }
  } finally {
    router.replace("/login");        // always navigate away
  }
};


  // Reusable link -------------------------------------------------------------
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
          "flex items-center gap-3 text-sm transition px-4 py-2 rounded",
          isActive ? "text-white bg-gray-800" : "text-gray-300 hover:text-white",
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  };

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------
  return (
    <header className="w-full border-gray-800 px-6 p-4 z-50 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/cases"
          className="text-xl font-bold text-white tracking-tight sm:ml-0"
        >
          Disput<span className="text-blue-500">.ai</span>
        </Link>

        {/* ─── Stand-alone bell (mobile only) ───────────────────── */}
        {session && (
          <div className="sm:hidden relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-gray-300 hover:text-white"
              type="button"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Mobile dropdown (anchors to the bell) */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 backdrop-blur px-6 py-4 border border-gray-700 rounded-xl shadow-lg z-50 animate-fade-in-down">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                  <span className="text-sm font-medium text-white">Notifications</span>
                  {notifications.length > 0 && (
                    <Button size="xs" variant="ghost" onClick={markAllRead}>
                      Mark all read
                    </Button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-sm text-gray-400">
                    No unread messages
                  </p>
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
        )}

        {/* Desktop navigation */}
        {session && (
          <nav className="hidden sm:flex items-center gap-4 ml-auto">
            <NavLink href="/cases" icon={Folder} label="Cases" />
            <NavLink href="/profile" icon={User} label="Profile" />
            <NavLink href="/settings" icon={Settings} label="Settings" />

            {/* Notification bell (desktop) */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-gray-300 hover:text-white p-2"
                type="button"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Desktop dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 backdrop-blur px-6 py-4 border border-gray-700 rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                    <span className="text-sm font-medium text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <Button size="xs" variant="ghost" onClick={markAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-sm text-gray-400">
                      No unread messages
                    </p>
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
              type="button"
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 px-2 py-1 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </div>

{session && (
  <nav
    className="
      phonemenu
      sm:hidden
      fixed bottom-0
      bg-opacity-90 backdrop-blur-md
      shadow-2xl
      z-50
    "
  >
    {[
      { href: '/cases',    Icon: Folder,   label: 'Cases'    },
      { href: '/profile',  Icon: User,     label: 'Profile'  },
      { href: '/settings', Icon: Settings, label: 'Settings' },
    ].map(({ href, Icon, label }) => {
      const isActive = pathname === href;
      return (
        <Link
          key={href}
          href={href}
          className={clsx(
            'group flex flex-col items-center text-sm transition-transform duration-200',
            isActive
              ? 'text-white scale-110'
              : 'text-gray-200 hover:scale-105'
          )}
        >
          <div
            className={clsx(
              'p-2 rounded-full transition-colors duration-300',
              isActive
                ? 'bg-white bg-opacity-25 shadow-lg'
                : 'group-hover:bg-white/20'
            )}
          >
            <Icon className={clsx(
              'w-7 h-7 transition-colors duration-300',
              isActive
                ? 'text-white'
                : 'text-gray-200 group-hover:text-white'
            )} />
          </div>
          <span className="mt-1">{label}</span>
          {/* sliding underline */}
          <span
            className={clsx(
              'block h-0.5 w-full mt-1 rounded-full bg-white transition-all duration-300',
              isActive ? 'scale-x-100' : 'scale-x-0'
            )}
            style={{ transformOrigin: 'left' }}
          />
        </Link>
      );
    })}
  </nav>
)}
    </header>
  );
}