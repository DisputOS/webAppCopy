import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic'; // always fetch fresh data

/**
 * Detail page for a single dispute
 * Route: /cases/[id]
 */
export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  // Ensure the user is logged‑in
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch dispute by id & ensure ownership
  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (error || !dispute) {
    notFound();
  }

  // Helper for status colors
  const statusColor = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700'
  } as Record<string, string>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* Back */}
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Повернутись до списку
      </Link>

      <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {dispute.problem_type || 'Без категорії'}
          </h1>
          <span className={`px-3 py-1 text-xs rounded-full ${statusColor[dispute.status] || 'bg-gray-100 text-gray-600'}`}>
            {dispute.status || 'невідомо'}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium text-gray-500">Платформа</p>
            <p>{dispute.platform_name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Дата покупки</p>
            <p>{new Date(dispute.purchase_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Сума</p>
            <p>
              {dispute.purchase_amount ?? '—'} {dispute.currency ?? ''}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Створено</p>
            <p>{new Date(dispute.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="font-medium text-gray-500 mb-1">Опис</p>
          <p className="whitespace-pre-line text-gray-800 leading-relaxed">
            {dispute.description}
          </p>
        </div>

        {/* Confirmation if won */}
        {dispute.status === 'won' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            <BadgeCheck className="w-5 h-5" /> Вітаємо! Ваш спір вирішено на вашу користь.
          </div>
        )}
      </div>
    </main>
  );
}
