'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Loader2, PlusCircle, AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface DisputeWithProof extends Record<string, any> {
  hasProof: boolean;
}

export default function CasesPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [disputes, setDisputes] = useState<DisputeWithProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: base } = await supabase
        .from('disputes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      const withProof = await Promise.all(
        (base ?? []).map(async (d) => {
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

  const handleCreateDispute = async () => {
    if (!session?.user) return;
    if (!description || !amount) return;

    setSaving(true);

    const { error } = await supabase.from('disputes').insert({
      user_id: session.user.id,
      description,
      purchase_amount: parseFloat(amount),
      currency,
      created_at: new Date().toISOString(),
    });

    setSaving(false);
    if (!error) {
      setShowModal(false);
      setDescription('');
      setAmount('');
      setCurrency('EUR');
      location.reload(); // quick fix to refresh list
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-950 text-white font-mono p-6">
        <Header />
        <p className="text-center mt-8 text-gray-400">Please log in to view your disputes.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono p-6">
      <Header />
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">My Disputes</h1>
        <button
          onClick={() => setShowModal(true)}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((d) => (
            <div
              key={d.id}
              onClick={() => router.push(`/cases/${d.id}`)}
              className="cursor-pointer border border-gray-800 rounded-xl p-5 bg-gray-900 hover:border-blue-600 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{d.problem_type || 'Untitled'}</h2>
                  {!d.hasProof && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      No proof uploaded
                    </div>
                  )}
                </div>
                {d.created_at &&
                  Date.now() - new Date(d.created_at).getTime() < 1000 * 60 * 60 * 24 && (
                    <span className="text-xs text-green-500 border border-green-500 rounded px-2 py-0.5 ml-2">
                      NEW
                    </span>
                  )}
              </div>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">{d.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Amount: <strong>{d.purchase_amount ?? '—'} {d.currency ?? ''}</strong>
                </span>
                <span>{new Date(d.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">New Dispute</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateDispute();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-1">Problem Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  placeholder="Describe the issue..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <div className="w-2/3">
                  <label className="block text-sm mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    placeholder="€"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 text-right">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm"
                >
                  {saving ? 'Saving...' : 'Create Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
