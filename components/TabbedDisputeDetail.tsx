// -----------------------------------------------------------------------------
// file: src/app/cases/[id]/DisputeDetail.tsx   (server component)
// -----------------------------------------------------------------------------
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import TabbedDisputeDetail from '@/components/TabbedDisputeDetail';

export const dynamic = 'force-dynamic';

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
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
  const proofCount = rawCount ?? 0;

  return (
    <TabbedDisputeDetail
      dispute={dispute}
      proofs={proofs || []}
      proofCount={proofCount}
    />
  );
}


// -----------------------------------------------------------------------------
// file: src/components/TabbedDisputeDetail.tsx   (client component with swipe)
// NOTE: Requires `react-swipeable`. Install via: `npm install react-swipeable`

"use client";

import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import {
  BadgeCheck,
  ArrowLeft,
  FileText,
  FileCheck2,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import EvidenceUploader from './EvidenceUploader';

interface Dispute {
  id: string;
  problem_type?: string;
  status?: string;
  platform_name?: string;
  purchase_date?: string;
  purchase_amount?: number;
  currency?: string;
  created_at?: string;
  description?: string;
  pdf_url?: string;
}

interface Proof {
  proof_id: string;
  receipt_url: string;
}

interface Props {
  dispute: Dispute;
  proofs: Proof[];
  proofCount: number;
}

const TABS = ['details', 'proofs', 'upload'] as const;
type TabKey = typeof TABS[number];

export default function TabbedDisputeDetail({ dispute, proofs, proofCount }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const pdfReady = Boolean(dispute.pdf_url);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveIdx(idx => Math.min(idx + 1, TABS.length - 1)),
    onSwipedRight: () => setActiveIdx(idx => Math.max(idx - 1, 0)),
    trackMouse: true,
    trackTouch: true,
    delta: 10,
  });

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-gray-200 text-gray-600',
    won: 'bg-gray-200 text-gray-600',
    lost: 'bg-gray-200 text-gray-600',
  };

  let userMessage: string;
  if (proofCount === 0) userMessage = 'Step 1: upload at least one proof document to start your case.';
  else if (proofCount === 1 && !pdfReady) userMessage = 'Great start! Upload a different proof type to speed up PDF generation.';
  else if (!pdfReady) userMessage = 'Generating your dispute letter—PDF will appear shortly.';
  else userMessage = 'Your PDF is ready! Download and submit.';

  const TabIcon = (tab: TabKey) => {
    switch (tab) {
      case 'details': return <FileText className="w-5 h-5" />;
      case 'proofs': return <FileCheck2 className="w-5 h-5" />;
      case 'upload': return <PlusCircle className="w-5 h-5" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      <Link href="/cases" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <div className="flex justify-center space-x-4 mb-4">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveIdx(idx)}
            className={`p-2 rounded-lg transition ${
              activeIdx === idx ? 'bg-gray-200 bg-opacity-20' : 'text-gray-400 hover:bg-gray-200 hover:bg-opacity-10'
            }`}
          >
            {TabIcon(tab)}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-4 flex items-center gap-3 text-sm text-gray-200 mb-4">
        <BadgeCheck className="w-4 h-4 text-gray-400" />
        <p>{userMessage}</p>
      </div>

      <div {...handlers} ref={containerRef} className="relative overflow-hidden">
        <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${activeIdx * 100}%)` }}>

          {/* Details Panel */}
          <section className="min-w-full p-4">
            {/* ... content unchanged ... */}
          </section>

          {/* Proofs Panel */}
          <section className="min-w-full p-4">
            {/* ... content unchanged ... */}
          </section>

          {/* Upload Panel */}
          <section className="min-w-full p-4">
            <EvidenceUploader caseId={dispute.id} />
          </section>
        </div>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        {TABS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-2 h-2 rounded-full transition ${
              activeIdx === idx ? 'bg-gray-200 bg-opacity-50' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </main>
  );
}
