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

  // Fetch & subscribe to unread notifications
  useEffect(() => {
    if (!session) return;
    supabase
      .from("user_notifications")
      .select("id, title, body, created_at, read_at")
      .eq("user_id", session.user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setNotifications(data as NotificationRow[]);
      });

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
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe().catch(() => {});
    };
  }, [supabase, session]);

  // Mark helpers
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

  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      if (!err?.message?.includes("session missing")) {
        console.error("Logout error:", err.message);
      }
    } finally {
      router.replace("/login");
    }
  };

  // Reusable link
  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string; }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 text-sm transition px-4 py-2 rounded",
          isActive
            ? "text-white bg-blue-600 dark:bg-blue-500"
            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="w-full p-5 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 z-50 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/cases"
          className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          Disput<span className="text-blue-500">.ai</span>
        </Link>

        {/* Mobile Bell */}
        {session && (
          <div className="sm:hidden relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              type="button"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 animate-fade-in-down backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Notifications</span>
                  {notifications.length > 0 && (
                    <Button size="xs" variant="ghost" onClick={markAllRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    No unread messages
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs mt-1 line-clamp-2 text-gray-600 dark:text-gray-400">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop nav */}
        {session && (
          <nav className="hidden sm:flex items-center gap-4 ml-auto">
            <NavLink href="/cases" icon={Folder} label="Cases" />
            <NavLink href="/profile" icon={User} label="Profile" />
            <NavLink href="/settings" icon={Settings} label="Settings" />

            {/* Desktop Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                type="button"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 backdrop-blur-sm">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <Button size="xs" variant="ghost" onClick={markAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                      No unread messages
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-xs mt-1 line-clamp-2 text-gray-600 dark:text-gray-400">{n.body}</p>
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
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </div>

      {/* Mobile bottom nav */}
      {session && (
        <nav className="phonemenu w-full sm:hidden fixed bottom-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md shadow-2xl z-50">
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
                  'group flex flex-col items-center text-sm transition-transform duration-200 py-2',
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <div
                  className={clsx(
                    'p-2 rounded-full transition-colors duration-300',
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 shadow-lg'
                      : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                  )}
                >
                  <Icon className={clsx(
                    'w-7 h-7 transition-colors duration-300',
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                  )} />
                </div>
                <span className="mt-1">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
