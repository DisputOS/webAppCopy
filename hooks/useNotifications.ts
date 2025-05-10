"use client";
import { useEffect, useState, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export function useNotifications() {
  const supabase = useSupabaseClient();
  const session  = useSession();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch latest notifications once
  const fetchInitial = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error) setItems(data as NotificationRow[]);
    setLoading(false);
  }, [supabase, session]);

  // live INSERT listener
  useEffect(() => {
    if (!session) return;
    fetchInitial();

    const channel = supabase
      .channel("user_notifications_panel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        payload => {
          setItems(prev => [payload.new as NotificationRow, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [supabase, session, fetchInitial]);

  const unreadCount = items.filter(i => !i.read_at).length;

  const markAllRead = async () => {
    if (!session || unreadCount === 0) return;
    const now = new Date().toISOString();
    setItems(prev => prev.map(i => ({ ...i, read_at: i.read_at || now })));
    await supabase
      .from("user_notifications")
      .update({ read_at: now })
      .eq("user_id", session.user.id)
      .is("read_at", null);
  };

  const markOneRead = async (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read_at: new Date().toISOString() } : i));
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  };

  return { items, unreadCount, loading, markAllRead, markOneRead };
}
