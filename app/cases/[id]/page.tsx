// Dispute detail page with 3‑item carousel + touch swipe
// Next 13 app dir – server component
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  FileText,
  FileUp,
} from 'lucide-react';
import { DisputeActionsMenu } from '@/components/DisputeActionsMenu';
import dynamicFn from 'next/dynamic';          // alias to avoid name clash

/* ────────────────────────────────────────────────────────── *
 *  Types                                                     *
 * ────────────────────────────────────────────────────────── */

interface Proof {
  proof_id: string;
  dispute_id: string;
  user_id: string;
  receipt_url: string | null;
  tracking_id: string | null;
  carrier: string | null;
  screenshot_urls: string[] | null;           // Supabase text[] → string[]
  evidence_source: string | null;
  policy_snapshot: unknown | null;            // jsonb
  user_description: string | null;
  dispute_type: string | null;
  created_at: string;
}

/* ────────────────────────────────────────────────────────── *
 *  Client‑only carousel (lazy‑loaded)                        *
 * ────────────────────────────────────────────────────────── */

const ProofCarousel = dynamicFn(() => import('@/components/ProofCarousel'), {
  ssr: false,
});

export const dynamic = 'force-dynamic';

/* ────────────────────────────────────────────────────────── *
 *  Page component                                            *
 * ────────────────────────────────────────────────────────── */

export default async function DisputeDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  /* ─── Dispute row ──────────────────────────── */
  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !dispute) notFound();

  /* ─── Proof bundle rows ────────────────────── */
  const { data: proofs = [], count } = await supabase
    .from<Proof>('proof_bundle')         // row type here
    .select('*', { count: 'exact' });    // keep columns as string

  const proofCount = count ?? proofs.length;
  const pdfReady   = Boolean(dispute.pdf_url);

  /* ─── Status → badge colour map ───────────── */
  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open:  'bg-blue-100 text-blue-700',
    won:   'bg-green-100 text-green-700',
    lost:  'bg-red-100 text-red-700',
  };

  /* ─── Progress bar state ───────────────────── */
  const steps: Array<'Proof' | 'Template' | 'PDF'> = ['Proof', 'Template', 'PDF'];
  const currentStep = pdfReady ? 3 : proofCount > 0 ? 2 : 1;

  /* ──────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/cases"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all cases
      </Link>

      {/* Progress bar */}
      <ProgressBar steps={steps} current={currentStep} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ───────── Left column – dispute info */}
        <DisputeCard dispute={dispute} statusColor={statusColor} />

        {/* ───────── Right column – proofs */}
        {proofCount > 0 ? (
          <ProofCarousel proofs={proofs} />
        ) : (
          <div className="flex-1 flex items-center justify-center border border-gray-800 rounded-xl">
            <p className="text-gray-500 py-24">No proofs yet</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <FooterActions
        pdfReady={pdfReady}
        proofCount={proofCount}
        disputeId={params.id}
        pdfUrl={dispute.pdf_url ?? ''}
      />
    </main>
  );
}

/* ────────────────────────────────────────────────────────── *
 *  Sub‑components (server side)                              *
 * ────────────────────────────────────────────────────────── */

function ProgressBar({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="w-full mb-6">
      <div className="relative w-full bg-gray-800 rounded-full h-2.5">
        <div
          className="absolute top-0 left-0 bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${(current / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {steps.map((step, idx) => (
          <div key={step} className="flex flex-col items-center w-1/3">
            <div
              className={`w-2.5 h-2.5 rounded-full mb-1 ${
                current - 1 === idx
                  ? 'bg-white ring-2 ring-indigo-500'
                  : current > idx
                  ? 'bg-indigo-500'
                  : 'bg-gray-600'
              }`}
            />
            <span className={current - 1 === idx ? 'text-white font-medium' : ''}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisputeCard({
  dispute,
  statusColor,
}: {
  dispute: any;
  statusColor: Record<string, string>;
}) {
  return (
    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{dispute.problem_type || 'Untitled Dispute'}</h1>
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
        <Detail label="Platform"       value={dispute.platform_name} />
        <Detail label="Purchase Date"  value={new Date(dispute.purchase_date).toLocaleDateString()} />
        <Detail label="Amount"         value={`${dispute.purchase_amount ?? '—'} ${dispute.currency ?? ''}`} />
        <Detail label="Created At"     value={new Date(dispute.created_at).toLocaleDateString()} />
      </div>

      <div>
        <p className="font-medium text-gray-500 mb-1">Description</p>
        <p className="whitespace-pre-line text-gray-100 leading-relaxed">
          {dispute.description}
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium text-gray-500">{label}</p>
      <p>{value}</p>
    </div>
  );
}

/* ─── Footer actions ───────────────────────────────────────── */

function FooterActions({
  pdfReady,
  proofCount,
  disputeId,
  pdfUrl,
}: {
  pdfReady: boolean;
  proofCount: number;
  disputeId: string;
  pdfUrl: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
      <div className="space-y-1 text-sm text-gray-400">
        {proofCount === 0 ? (
          <p>Please upload at least one proof to proceed.</p>
        ) : (
          <p>
            Proof files uploaded:&nbsp;<strong>{proofCount}</strong>
          </p>
        )}
        {!pdfReady && proofCount > 0 && (
          <p className="text-xs text-gray-500">PDF will be available after generation.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionLink href={`/cases/${disputeId}/evidence`}                     variant="blue">
          <FileUp className="w-4 h-4" /> Add Proof
        </ActionLink>
        <ActionLink
          href={proofCount > 0 ? `/cases/${disputeId}/generate` : '#'}
          variant={proofCount > 0 ? 'indigo' : 'disabled'}
        >
          <PlusCircle className="w-4 h-4" /> Generate Template
        </ActionLink>
        <ActionLink
          href={pdfReady ? `/cases/${disputeId}/review?pdf=${encodeURIComponent(pdfUrl)}` : '#'}
          variant={pdfReady ? 'green' : 'disabled'}
        >
          <FileText className="w-4 h-4" /> View PDF
        </ActionLink>
      </div>
    </div>
  );
}

function ActionLink({
  href,
  variant,
  children,
}: {
  href: string;
  variant: 'blue' | 'indigo' | 'green' | 'disabled';
  children: React.ReactNode;
}) {
  const styles: Record<typeof variant, string> = {
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
    green: 'bg-green-600 text-white hover:bg-green-700',
    disabled: 'bg-gray-800 text-gray-500 cursor-not-allowed',
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}
