'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { MoreVertical, Undo2, Trash2 } from 'lucide-react';

export default function ArchivedDisputesModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchived = async () => {
      if (!session?.user) return;

      setLoading(true);
      const { data } = await supabase
        .from('disputes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('archived', true)
        .order('created_at', { ascending: false });

      setDisputes(data || []);
      setLoading(false);
    };

    fetchArchived();
  }, [session]);

  const handleRestore = async (id: string) => {
    await supabase
      .from('disputes')
      .update({ archived: false })
      .eq('id', id)
      .eq('user_id', session?.user.id);
    setDisputes((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to permanently delete this dispute?');
    if (!confirmed) return;

    await fetch('/api/disputes/delete', {
      method: 'POST',
      body: new URLSearchParams({ dispute_id: id }),
    });

    setDisputes((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl shadow-lg border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-white">Archived Disputes</h2>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : disputes.length === 0 ? (
          <p className="text-gray-500 text-sm">You have no archived disputes.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {disputes.map((d) => (
              <li
                key={d.id}
                className="bg-gray-800 rounded p-4 flex justify-between items-start relative"
              >
                <div>
                  <h3 className="text-white font-semibold text-base">
                    {d.problem_type || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-1">{d.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(d.created_at).toLocaleDateString()} — {d.purchase_amount ?? '—'} {d.currency ?? ''}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((prev) => (prev === d.id ? null : d.id))}
                    className="p-2 rounded-full hover:bg-gray-700 text-gray-400"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {menuOpen === d.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded shadow z-50">
                      <button
                        onClick={() => handleRestore(d.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:text-yellow-300 w-full"
                      >
                        <Undo2 className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-400 w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
