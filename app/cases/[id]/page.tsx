import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, ArrowLeft, PlusCircle, FileText, FileUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();
  if (error || !dispute) notFound();

  const { count: rawCount } = await supabase
    .from('proof_bundle')
    .select('*', { count: 'exact', head: true })
    .eq('dispute_id', params.id)
    .eq('user_id', session.user.id);

  const proofCount: number = rawCount ?? 0;
  const pdfReady = Boolean(dispute.pdf_url);

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono p-6 space-y-8">
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to all cases
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold">
            {dispute.problem_type || 'Untitled Dispute'}
          </h1>
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              statusColor[dispute.status] || 'bg-gray-700 text-gray-300'
            }`}
          >
            {dispute.status || 'unknown'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <p className="font-medium text-gray-500">Platform</p>
            <p>{dispute.platform_name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Purchase Date</p>
            <p>{new Date(dispute.purchase_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Amount</p>
            <p>
              {dispute.purchase_amount ?? '—'} {dispute.currency ?? ''}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Created At</p>
            <p>{new Date(dispute.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <p className="font-medium text-gray-500 mb-1">Description</p>
          <p className="whitespace-pre-line text-gray-100 leading-relaxed">
            {dispute.description}
          </p>
        </div>

        {dispute.status === 'won' && (
          <div className="flex items-center gap-2 text-green-500 bg-green-950 border border-green-800 rounded-lg p-3">
            <BadgeCheck className="w-5 h-5" /> Congratulations! Your dispute was resolved in your favor.
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
        <div className="space-y-1 text-sm text-gray-400">
          {proofCount === 0 ? (
            <p>Please upload at least one proof to proceed.</p>
          ) : (
            <p>Proof files uploaded: <strong>{proofCount}</strong></p>
          )}
          {!pdfReady && proofCount > 0 && (
            <p className="text-xs text-gray-500">PDF will be available after generation.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/cases/${params.id}/evidence`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <FileUp className="w-4 h-4" /> Add Proof
          </Link>

          <Link
            href={proofCount > 0 ? `/cases/${params.id}/generate` : '#'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition ${
              proofCount > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Generate Template
          </Link>

          <Link
            href={pdfReady ? `/cases/${params.id}/review?pdf=${encodeURIComponent(dispute.pdf_url)}` : '#'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition ${
              pdfReady
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4" /> View PDF
          </Link>
        </div>

                <form
        action="/api/disputes/delete"
        method="POST"
        onSubmit={() => confirm('Are you sure you want to delete this dispute? This action cannot be undone.')}
        >
        <input type="hidden" name="dispute_id" value={dispute.id} />
        <button
            type="submit"
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
            Delete Dispute
        </button>
        </form>

      </div>
    </main>
  );
}
