'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CasesPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

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
    return <p className="text-center mt-8">Потрібно увійти, щоб переглянути ваші спори.</p>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Мої спори</h1>
        <button
          onClick={() => router.push('/cases/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Додати спір
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p>У вас ще немає спорів.</p>
          <button
            onClick={() => router.push('/cases/new')}
            className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Створити перший спір
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              onClick={() => router.push(`/cases/${dispute.id}`)}
              className="cursor-pointer border rounded-xl p-5 bg-white shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {dispute.problem_type || 'Без категорії'}
                </h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {dispute.status || 'Не вказано'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{dispute.description}</p>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>
                  Сума: <strong>{dispute.purchase_amount ?? '—'} {dispute.currency ?? ''}</strong>
                </span>
                <span>
                  Дата: {new Date(dispute.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
