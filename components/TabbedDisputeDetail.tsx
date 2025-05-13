// -----------------------------------------------------------------------------
// file: src/components/TabbedDisputeDetail.tsx   (client component with swipe)
// NOTE: Requires `react-swipeable`. Install via: `npm install react-swipeable`
// Also ensure you have in globals.css:
// .swipe-container { touch-action: pan-y; overscroll-behavior: none; }
// -----------------------------------------------------------------------------
"use client";

import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import {
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
  FileText,
  FileCheck2,
  PlusCircle,
  FileUp,
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
    onSwipedLeft:  () => setActiveIdx(i => Math.min(i + 1, TABS.length - 1)),
    onSwipedRight: () => setActiveIdx(i => Math.max(i - 1, 0)),
    trackTouch:    true,
    delta:         20,
  });

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open:  'bg-gray-200 text-gray-600',
    won:   'bg-gray-200 text-gray-600',
    lost:  'bg-gray-200 text-gray-600',
  };

  let userMessage: string;
  if (proofCount === 0) userMessage = 'Step 1: upload at least one proof document to start your case.';
  else if (proofCount === 1 && !pdfReady) userMessage = 'Great start! Upload a different proof type to speed up PDF generation.';
  else if (!pdfReady) userMessage = 'Generating your dispute letter—PDF will appear shortly.';
  else userMessage = 'Your PDF is ready! Download and submit.';

  const TabIcon = (tab: TabKey) => {
    switch (tab) {
      case 'details': return <FileText className="w-5 h-5" />;
      case 'proofs':  return <FileCheck2 className="w-5 h-5" />;
      case 'upload':  return <PlusCircle className="w-5 h-5" />;
      default:        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 relative">
      <Link href="/cases" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Tabs */}
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

      {/* Guidance Banner */}
      <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-4 flex items-center gap-3 text-sm text-gray-200 mb-4">
        <BadgeCheck className="w-4 h-4 text-gray-400" />
        <p>{userMessage}</p>
      </div>

      {/* Corner touch areas with light overlays */}
      <div
        onClick={() => setActiveIdx(i => Math.max(i - 1, 0))}
        className="absolute left-0 top-0 h-full w-[40px] pointer-events-auto animate-pulse animate-infinite animate-normal"
        style={{
          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.06), transparent)',
        }}
      />
      <div
        onClick={() => setActiveIdx(i => Math.min(i + 1, TABS.length - 1))}
        className="absolute right-0 top-0 h-full w-[40px] pointer-events-auto animate-pulse animate-infinite animate-normal"
        style={{
          background: 'linear-gradient(to left, rgba(255,255,255,0.06), transparent)',
        }}
      />

      {/* Swipeable Panels */}
      <div
        {...handlers}
        ref={containerRef}
        className="swipe-container relative overflow-hidden"
      >
        <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${activeIdx * 100}%)` }}>

          {/* Details Panel */}
          <section className="min-w-full">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <h1 className="text-2xl font-bold break-all">{dispute.problem_type || 'Untitled Dispute'}</h1>
              <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${statusColor[dispute.status || '']}`}>{dispute.status}</span>

              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
                <div>
                  <p className="font-medium text-gray-500">Platform</p>
                  <p>{dispute.platform_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Purchase Date</p>
                  <p>{new Date(dispute.purchase_date || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Amount</p>
                  <p>{dispute.purchase_amount} {dispute.currency}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Created At</p>
                  <p>{new Date(dispute.created_at || '').toLocaleDateString()}</p>
                </div>
              </div>

              <p className="font-medium text-gray-500">Description</p>
              <p className="whitespace-pre-line text-gray-100 leading-relaxed">{dispute.description}</p>

              {/* Action Icons */}
              <div className="flex space-x-6 mt-4 justify-center">
                <button onClick={() => setActiveIdx(2)} className="p-2 rounded-lg bg-gray-200 bg-opacity-20 hover:bg-opacity-30">
                  <FileUp className="w-6 h-6 text-gray-200" />
                </button>
                <button onClick={() => setActiveIdx(2)} className="p-2 rounded-lg bg-gray-200 bg-opacity-20 hover:bg-opacity-30">
                  <PlusCircle className="w-6 h-6 text-gray-200" />
                </button>
                <Link href={pdfReady ? dispute.pdf_url as string : '#'} className="p-2 rounded-lg bg-gray-200 bg-opacity-20 hover:bg-opacity-30">
                  <FileText className="w-6 h-6 text-gray-200" />
                </Link>
              </div>
            </div>
          </section>

          {/* Proofs Panel */}
          <section className="min-w-full">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              {proofCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {proofs.map(p => (
                    <div key={p.proof_id} className="rounded-lg overflow-hidden border border-gray-700">
                      <img src={p.receipt_url} className="w-full h-40 object-cover" />
                      <p className="p-2 text-xs text-gray-400 truncate">{p.receipt_url.split('/').pop()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No proofs uploaded yet.</p>
              )}
            </div>
          </section>

          {/* Upload Panel */}
          <section className="min-w-full">
            <EvidenceUploader caseId={dispute.id} />
          </section>
        </div>
      </div>

      {/* Carousel Indicators */}
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