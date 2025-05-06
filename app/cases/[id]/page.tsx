import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, ArrowLeft, PlusCircle, FileText, FileUp, FileCheck2, FileSignature } from 'lucide-react';
import { DisputeActionsMenu } from '@/components/DisputeActionsMenu';

export const dynamic = 'force-dynamic';

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  if (error || !dispute) notFound();

  const { data: proofs, count: rawCount } = await supabase
    .from('proof_bundle')
    .select('*', { count: 'exact' })
    .eq('dispute_id', params.id)
    .eq('user_id', user.id);

  const proofCount: number = rawCount ?? 0;
  const pdfReady = Boolean(dispute.pdf_url);

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  const steps: Array<'Proof' | 'Template' | 'PDF'> = ['Proof', 'Template', 'PDF'];
  const currentStep = pdfReady ? 3 : proofCount > 0 ? 2 : 1;

  const StepIcon = ({ step }: { step: 'Proof' | 'Template' | 'PDF' }) => {
    const icons = {
      Proof: <FileCheck2 className="w-4 h-4" />,
      Template: <FileSignature className="w-4 h-4" />,
      PDF: <FileText className="w-4 h-4" />,
    };
    return icons[step];
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 space-y-6">
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to all cases
      </Link>

      <div className="w-full mb-6">
        <div className="relative w-full bg-gray-800 rounded-full h-2.5">
          <div
            className="absolute top-0 left-0 bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center w-1/3">
              <div
                className={`w-2.5 h-2.5 rounded-full mb-1 ${
                  currentStep - 1 === index
                    ? 'bg-white ring-2 ring-indigo-500'
                    : currentStep > index
                    ? 'bg-indigo-500'
                    : 'bg-gray-600'
                }`}
              />
              <span className={currentStep - 1 === index ? 'text-white font-medium' : ''}>{step}</span>
            </div>
          ))}
        </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6 ">
          <div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold">
      {dispute.problem_type || 'Untitled Dispute'}
    </h1>
    <span
      className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
        statusColor[dispute.status] || 'bg-gray-700 text-gray-300'
      }`}
    >
      {dispute.status || 'unknown'}
    </span>
  </div>
  <DisputeActionsMenu disputeId={dispute.id} isArchived={dispute.archived} />
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
        </div>

        {proofCount > 0 && (
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-semibold mb-4 text-white">Uploaded Proofs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {proofs?.map((proof) => (
                proof.receipt_url && (
                  <div key={proof.proof_id} className="rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={proof.receipt_url}
                      alt="Uploaded proof"
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-2 text-xs text-gray-400 truncate">
                      {proof.receipt_url.split('/').pop()}
                    </div>
                  </div>
                )
              ))}
            </div>
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
      </div>
    </main>
  );
}
