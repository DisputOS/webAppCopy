import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, ArrowLeft, PlusCircle, FileText, FileUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * Detail page for a single dispute with action buttons (evidence / template / pdf)
 * Route: /cases/[id]
 */
export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  // session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // dispute
  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();
  if (error || !dispute) notFound();

  // evidence count
  const { count: evidenceCount } = await supabase
    .from('evidence')
    .select('*', { count: 'exact', head: true })
    .eq('dispute_id', params.id)
    .eq('user_id', session.user.id);

  // pdf ready?
  const pdfReady = Boolean(dispute.pdf_url);

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {/* back */}
      <Link
        href="/cases"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Повернутись до списку
      </Link>

      {/* dispute card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6 animate-fadeInUp">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {dispute.problem_type || 'Без категорії'}
          </h1>
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              statusColor[dispute.status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {dispute.status || 'невідомо'}
          </span>
        </div>

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

        <div>
          <p className="font-medium text-gray-500 mb-1">Опис</p>
          <p className="whitespace-pre-line text-gray-800 leading-relaxed">
            {dispute.description}
          </p>
        </div>

        {dispute.status === 'won' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            <BadgeCheck className="w-5 h-5" /> Вітаємо! Ваш спір вирішено на вашу користь.
          </div>
        )}
      </div>

      {/* action panel */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="space-y-1 text-sm text-gray-600">
          {evidenceCount === 0 ? (
            <p>Для подальших дій додайте хоча б один доказ.</p>
          ) : (
            <p>Доказів додано: <strong>{evidenceCount}</strong></p>
          )}
          {!pdfReady && evidenceCount > 0 && (
            <p className="text-xs text-gray-400">PDF буде доступний після генерації.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Add evidence */}
          <Link
            href={`/cases/${params.id}/evidence`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            <FileUp className="w-4 h-4" /> Додати доказ
          </Link>

          {/* Generate template (disabled if no evidence) */}
          <Link
            href={evidenceCount > 0 ? `/cases/${params.id}/generate` : '#'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md shadow transition ${
              evidenceCount > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Згенерувати шаблон
          </Link>

          {/* Review PDF (disabled until ready) */}
          <Link
            href={pdfReady ? `/cases/${params.id}/review?pdf=${encodeURIComponent(dispute.pdf_url)}` : '#'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md shadow transition ${
              pdfReady
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4" /> Переглянути PDF
          </Link>
        </div>
      </div>
    </main>
  );
}
