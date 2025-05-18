// -----------------------------------------------------------------------------
// file: src/app/cases/page.tsx
// Responsive disputes list + GPT-Powered Chat Dispute Modal
// -----------------------------------------------------------------------------
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Loader2, PlusCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ChatDisputeModal from '@/components/ChatDisputeModal';
import Link from 'next/link';

interface DisputeWithProof extends Record<string, any> {
  hasProof: boolean;
}

export default function CasesPage() {
  const supabase = useSupabaseClient();
  const session  = useSession();
  const router   = useRouter();

  const [disputes, setDisputes] = useState<DisputeWithProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);

  /* ─────────────────────────── route transition hook ──────────────────── */
  const [isPending, startTransition] = useTransition();

  /* ─────────────────────────── fetch disputes ─────────────────────────── */
  const fetchData = async () => {
    if (!session?.user) return;
    setLoading(true);

    const { data: base } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    const withProof = await Promise.all(
      (base ?? []).map(async (d) => {
        const { count } = await supabase
          .from('proof_bundle')
          .select('*', { count: 'exact', head: true })
          .eq('dispute_id', d.id)
          .eq('user_id',  session.user.id);

        return { ...d, hasProof: (count ?? 0) > 0 };
      }),
    );
    localStorage.setItem('cachedDisputes', JSON.stringify(withProof));
    setDisputes(withProof);
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
  
    // 1. Load cached data
    const cached = localStorage.getItem('cachedDisputes');
    if (cached) {
      const parsed = JSON.parse(cached);
      setDisputes(parsed);
      setLoading(false);
    }
  
    // 2. Refetch if older than 5 minutes
    const lastFetch = localStorage.getItem('disputesLastFetch');
    const now = Date.now();
    const shouldRefetch = !lastFetch || now - Number(lastFetch) > 1000 * 60 * 5;
  
    if (shouldRefetch) {
      fetchData();
      localStorage.setItem('disputesLastFetch', now.toString());
    }
  }, [session]);
  
  if (!session) {
    return (
      <>
        <Header />
        <main className="pt-[calc(56px+env(safe-area-inset-top))] h-[100svh] flex flex-col bg-gradient-to-b from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-900 dark:text-white">
          <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
            Please log in to view your disputes.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex flex-col bg-white dark:bg-gray-900">
        {/* ── sticky title bar ───────────────────────────────────── */}
        <div className="sticky top-0 z-20 flex items-center justify-between backdrop-blur bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Disputes</h1>

          <Link
            href="/alternativeflow"
            className="flex items-center gap-2 px-4 py-2 cursor-pointer border border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-600 transition text-gray-900 dark:text-white"
          >
            <PlusCircle className="w-5 h-5" />
            New Dispute
          </Link>
        </div>

        {/* ── scrollable list ───────────────────────────────────── */}
        <section className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-gray-900">
              <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">You have no disputes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    startTransition(() => router.push(`/cases/${d.id}`));
                  }}
                  className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900 hover:border-blue-600 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold break-all text-gray-900 dark:text-white">
                        {d.dispute_name || 'Untitled'}
                      </h2>
                      {!d.hasProof && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          No proof uploaded
                        </div>
                      )}
                    </div>

                    {d.created_at &&
                      Date.now() - new Date(d.created_at).getTime() < 86_400_000 && (
                        <span className="text-xs text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded px-2 py-0.5 ml-2">
                          NEW
                        </span>
                      )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {d.description}
                  </p>

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Amount:&nbsp;
                      <strong className="text-gray-900 dark:text-white">
                        {d.purchase_amount ?? '—'} {d.currency ?? ''}
                      </strong>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── GPT-powered Chat Modal ───────────────────────────────────── */}
        {showChatModal && (
          <ChatDisputeModal
            onClose={() => {
              setShowChatModal(false);
              fetchData();
            }}
          />
        )}
      </main>

      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      )}
    </>
  );
}
  