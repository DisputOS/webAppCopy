'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Loader2 } from 'lucide-react';

export default function CasesPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchDisputes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setDisputes(data || []);
      }

      setLoading(false);
    };

    fetchDisputes();
  }, [session]);

  if (!session) {
    return <p className="text-center mt-8">Потрібно увійти, щоб переглянути ваші кейси.</p>;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Ваші спори</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
        </div>
      ) : disputes.length === 0 ? (
        <p className="text-gray-500">Ще немає спорів. Почніть новий!</p>
      ) : (
        <div className="grid gap-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-800">{dispute.problem_type}</h2>
              <p className="text-sm text-gray-500 mb-2">{dispute.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                <span>Статус: <strong>{dispute.status || 'невідомо'}</strong></span>
                <span>Сума: {dispute.purchase_amount ?? '—'} {dispute.currency ?? ''}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Створено: {new Date(dispute.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
