'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Loader2, PlusCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DisputeWithProof extends Record<string, any> {
  hasProof: boolean;
}

export default function CasesPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [disputes, setDisputes] = useState<DisputeWithProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: base, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error || !base) {
        setLoading(false);
        return;
      }

      const withProof: DisputeWithProof[] = await Promise.all(
        base.map(async (d) => {
          const { count } = await supabase
            .from('proof_bundle')
            .select('*', { count: 'exact', head: true })
            .eq('dispute_id', d.id)
            .eq('user_id', session.user.id);
          return { ...d, hasProof: (count ?? 0) > 0 };
        })
      );

      setDisputes(withProof);
      setLoading(false);
    };

    fetchData();
  }, [session]);

  if (!session) {
    return (
      <p className="text-center mt-8 text-gray-400">
        Please log in to view your disputes.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono p-6 w-full">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">My Disputes</h1>
        <button
          onClick={() => router.push('/cases/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
        >
          <PlusCircle className="w-5 h-5" />
          New Dispute
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p>You have no disputes yet.</p>
          <button
            onClick={() => router.push('/cases/new')}
            className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            Create your first dispute
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((d, index) => {
            const isNew = index === 0;
            return (
              <div
                key={d.id}
                onClick={() => router.push(`/cases/${d.id}`)}
                className="cursor-pointer border border-gray-800 rounded-xl p-5 bg-gray-900 hover:border-blue-600 transition relative"
              >
                {isNew && (
                  <span className="absolute top-2 right-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> New
                  </span>
                )}
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold">
                    {d.problem_type || 'Untitled'}
                  </h2>
                  {!d.hasProof && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {d.description}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Amount: <strong>{d.purchase_amount ?? '—'} {d.currency ?? ''}</strong>
                  </span>
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                {!d.hasProof && (
                  <p className="mt-3 text-xs text-red-500 font-medium">
                    Upload proof to continue
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
