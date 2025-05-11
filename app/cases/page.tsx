// -----------------------------------------------------------------------------
// file: src/app/cases/page.tsx
// Responsive disputes list + full-screen spinner while navigating
// -----------------------------------------------------------------------------
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Loader2, PlusCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';

const NewDisputeModal = dynamic(
  () => import('@/components/NewDisputeModal'),
  { ssr: false },
);

interface DisputeWithProof extends Record<string, any> {
  hasProof: boolean;
}

export default function CasesPage() {
  const supabase = useSupabaseClient();
  const session  = useSession();
  const router   = useRouter();

  const [disputes, setDisputes] = useState<DisputeWithProof[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);

  /* ────────────────────────────── NEW: route transition hook ── */
  const [isPending, startTransition] = useTransition();

  /* ─────────────────────────────────────────── fetch disputes ── */
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

    setDisputes(withProof);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  /* ─────────────────────────── UI ────────────────────────────── */
  if (!session) {
    return (
      <>
        <Header />
        <main className="pt-[calc(56px+env(safe-area-inset-top))]
                         h-[100svh] flex flex-col bg-gradient-to-b
                         from-gray-900 via-gray-950 to-black text-white">
          <p className="text-center mt-8 text-gray-400">
            Please log in to view your disputes.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* full-height flex column */}
      <main className="flex flex-col">

        {/* ── sticky title bar ───────────────────────────────────── */}
        <div className="sticky top-0 z-20 flex items-center justify-between
                        backdrop-blur to-black/90 px-6 py-4">
          <h1 className="text-3xl font-bold">My Disputes</h1>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer
                       border border-gray-800 rounded-xl hover:border-blue-600
                       transition"
            type="button"
          >
            <PlusCircle className="w-5 h-5" />
            New Dispute
          </button>
        </div>

        {/* ── scrollable list ───────────────────────────────────── */}
        <section className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <p>You have no disputes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    startTransition(() => router.push(`/cases/${d.id}`));
                  }}
                  className="cursor-pointer border border-gray-800 rounded-xl
                             p-5 bg-gray-900 hover:border-blue-600 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold break-all">
                        {d.problem_type || 'Untitled'}
                      </h2>

                      {!d.hasProof && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertTriangle className="w-4 h-4" />
                          No proof uploaded
                        </div>
                      )}
                    </div>

                    {d.created_at &&
                      Date.now() - new Date(d.created_at).getTime() < 86_400_000 && (
                        <span className="text-xs text-green-500 border
                                         border-green-500 rounded px-2 py-0.5 ml-2">
                          NEW
                        </span>
                      )}
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {d.description}
                  </p>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      Amount:&nbsp;
                      <strong>
                        {d.purchase_amount ?? '—'} {d.currency ?? ''}
                      </strong>
                    </span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {showModal && (
          <NewDisputeModal
            onClose={() => {
              setShowModal(false);
              fetchData(); // refresh list after creation
            }}
          />
        )}
      </main>

      {/* ── full-screen overlay spinner while route is pending ─── */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/60 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      )}
    </>
  );
}
