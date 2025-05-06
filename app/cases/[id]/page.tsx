// DisputeDetail page + ProofGallery client‑side component
// 📝 Notes:
// • The page stays a server component (no 'use client').
// • ProofGallery is a small client component that handles horizontal scroll, swipe & arrow navigation.
// • Tailwind + lucide‑react icons. Adjust paths if your alias differs.

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  FileText,
  FileUp,
  FileCheck2,
  FileSignature,
} from 'lucide-react';

import { DisputeActionsMenu } from '@/components/DisputeActionsMenu';
import ProofGallery from '@/components/ProofGallery'; // ← client component

export const dynamic = 'force-dynamic';

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  /* ───────────────────────────────────────────────────────── Supabase */
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

  /* ───────────────────────────────────────────────────────── derived */
  const proofCount = rawCount ?? 0;
  const pdfReady = Boolean(dispute.pdf_url);

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  const steps: Array<'Proof' | 'Template' | 'PDF'> = ['Proof', 'Template', 'PDF'];
  const currentStep = pdfReady ? 3 : proofCount > 0 ? 2 : 1;

  /* ───────────────────────────────────────────────────────── JSX */
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 space-y-6">
      {/* back */}
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to all cases
      </Link>

      {/* progress bar */}
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

      {/* actions menu */}
      <div className="mt-6 flex justify-end">
        <DisputeActionsMenu disputeId={dispute.id} isArchived={dispute.archived} />
      </div>

      {/* main grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* left – dispute meta */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6 ">
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
            <Detail label="Platform" value={dispute.platform_name} />
            <Detail label="Purchase Date" value={new Date(dispute.purchase_date).toLocaleDateString()} />
            <Detail label="Amount" value={`${dispute.purchase_amount ?? '—'} ${dispute.currency ?? ''}`} />
            <Detail label="Created At" value={new Date(dispute.created_at).toLocaleDateString()} />
          </div>

          <div>
            <p className="font-medium text-gray-500 mb-1">Description</p>
            <p className="whitespace-pre-line text-gray-100 leading-relaxed">{dispute.description}</p>
          </div>
        </div>

        {/* right – proofs gallery */}
        {proofCount > 0 && (
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 max-h-[80vh]">
            <h2 className="text-lg font-semibold mb-4 text-white">Uploaded Proofs</h2>
            <ProofGallery proofs={proofs ?? []} />
          </div>
        )}
      </div>

      {/* footer actions */}
      <FooterActions
        pdfReady={pdfReady}
        proofCount={proofCount}
        disputeId={dispute.id}
        pdfUrl={dispute.pdf_url}
        paramsId={params.id}
      />
    </main>
  );
}

/* ───────────────────────────────────────────────────────── helpers */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium text-gray-500">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function FooterActions({
  pdfReady,
  proofCount,
  disputeId,
  pdfUrl,
  paramsId,
}: {
  pdfReady: boolean;
  proofCount: number;
  disputeId: string;
  pdfUrl: string | null;
  paramsId: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
      <div className="space-y-1 text-sm text-gray-400">
        {proofCount === 0 ? (
          <p>Please upload at least one proof to proceed.</p>
        ) : (
          <p>
            Proof files uploaded: <strong>{proofCount}</strong>
          </p>
        )}
        {!pdfReady && proofCount > 0 && <p className="text-xs text-gray-500">PDF will be available after generation.</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionLink href={`/cases/${paramsId}/evidence`} icon={FileUp} label="Add Proof" className="bg-blue-600 hover:bg-blue-700" />
        <ActionLink
          href={proofCount > 0 ? `/cases/${paramsId}/generate` : '#'}
          icon={PlusCircle}
          label="Generate Template"
          disabled={proofCount === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        />
        <ActionLink
          href={pdfReady ? `/cases/${paramsId}/review?pdf=${encodeURIComponent(pdfUrl ?? '')}` : '#'}
          icon={FileText}
          label="View PDF"
          disabled={!pdfReady}
          className="bg-green-600 hover:bg-green-700"
        />
      </div>
    </div>
  );
}

interface ActionLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  className?: string;
}

function ActionLink({ href, icon: Icon, label, disabled, className }: ActionLinkProps) {
  const base = `inline-flex items-center gap-2 px-4 py-2 rounded-md transition`;
  return (
    <Link
      href={href}
      className={`${base} ${disabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : `${className} text-white`}`}
    >
      <Icon className="w-4 h-4" /> {label}
    </Link>
  );
}

/* ───────────────────────────────────────────────────────── client component */
// app/components/ProofGallery.tsx

'use client';
import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

type Proof = { proof_id: string; receipt_url: string | null };

export default function ProofGallery({ proofs }: { proofs: Proof[] }) {
  const galleryRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* arrows – desktop only */}
      <button
        onClick={() => galleryRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-800/70 hover:bg-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => galleryRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-800/70 hover:bg-gray-700"
      >
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </button>

      {/* scroll / swipe container */}
      <div
        ref={galleryRef}
        className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory scroll-smooth"
      >
        {proofs.map(
          (p) =>
            p.receipt_url && (
              <div
                key={p.proof_id}
                className="snap-start flex-shrink-0 w-[calc((100%-2rem)/3)] md:w-[160px] rounded-lg overflow-hidden border border-gray-700"
              >
                <img src={p.receipt_url} alt="uploaded proof" className="w-full h-40 object-cover" />
                <div className="p-2 text-xs text-gray-400 truncate">{p.receipt_url.split('/').pop()}</div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
