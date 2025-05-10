"use client";
import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/hooks/useNotifications";
import clsx from "clsx";

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, loading, markAllRead, markOneRead } = useNotifications();

  return (
    <div className="relative">
      {/* bell icon */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative text-gray-300 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* pop-over */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Notifications</span>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No notifications yet.</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {items.map(n => (
                <li
                  key={n.id}
                  className={clsx(
                    "p-3 rounded-md text-sm cursor-default",
                    n.read_at ? "bg-gray-800/60 text-gray-300" : "bg-gray-800 text-white"
                  )}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs mt-1">{n.body}</p>
                    </div>
                    {!n.read_at && (
                      <button onClick={() => markOneRead(n.id)}>
                        <Check className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
