"use client";

import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import {
  BadgeCheck,
  ArrowLeft,
  FileText,
  FileUp,
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
  const activeTab = TABS[activeIdx];
  const pdfReady = Boolean(dispute.pdf_url);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveIdx((idx) => Math.min(idx + 1, TABS.length - 1)),
    onSwipedRight: () => setActiveIdx((idx) => Math.max(idx - 1, 0)),
    trackMouse: true,
  });

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  let userMessage: string;
  if (proofCount === 0) userMessage = 'Step 1: upload at least one proof document so we can start building your case.';
  else if (proofCount === 1 && !pdfReady) userMessage = 'Good start! Add one more document of a different type and we will auto-generate your dispute letter faster.';
  else if (!pdfReady) userMessage = 'Your documents look good. We are generating the dispute template now — the PDF link will appear here shortly.';
  else userMessage = 'Your dispute PDF is ready. Download it and send it to the merchant or your bank.';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to all cases
      </Link>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-4">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveIdx(idx)}
            className={`py-2 px-4 rounded-lg transition ${
              activeIdx === idx ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'details' && 'Details'}
            {tab === 'proofs' && `Proofs (${proofCount})`}
            {tab === 'upload' && 'Upload New Proof'}
          </button>
        ))}
      </div>

      {/* Guidance */}
      <div className="bg-indigo-950/60 border border-indigo-800 rounded-xl p-4 flex items-center gap-3 text-sm text-indigo-100 mb-4">
        <BadgeCheck className="w-4 h-4 text-indigo-400" />
        <p>{userMessage}</p>
      </div>

      {/* Swipeable Carousel */}
      <div
        {...handlers}
        ref={containerRef}
        className="relative overflow-hidden"
      >
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${activeIdx * 100}%)` }}
        >
          {/* Details Panel */}
          <section className="min-w-full p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <h1 className="text-2xl font-bold break-all">{dispute.problem_type || 'Untitled Dispute'}</h1>
              <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${statusColor[dispute.status || '']}`}>{dispute.status}</span>

              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
                <div><p className="font-medium text-gray-500">Platform</p><p>{dispute.platform_name}</p></div>
                <div><p className="font-medium text-gray-500">Purchase Date</p><p>{new Date(dispute.purchase_date || '').toLocaleDateString()}</p></div>
                <div><p className="font-medium text-gray-500">Amount</p><p>{dispute.purchase_amount} {dispute.currency}</p></div>
                <div><p className="font-medium text-gray-500">Created At</p><p>{new Date(dispute.created_at || '').toLocaleDateString()}</p></div>
              </div>
              <p className="font-medium text-gray-500">Description</p>
              <p className="whitespace-pre-line text-gray-100 leading-relaxed">{dispute.description}</p>

              <div className="flex space-x-3 mt-4">
                <button onClick={() => setActiveIdx(2)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <FileUp className="w-4 h-4" /> Add Proof
                </button>
                <button onClick={() => setActiveIdx(2)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  <PlusCircle className="w-4 h-4" /> Generate Template
                </button>
                <Link href={pdfReady ? dispute.pdf_url as string : '#'} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <FileText className="w-4 h-4" /> View PDF
                </Link>
              </div>
            </div>
          </section>

          {/* Proofs Panel */}
          <section className="min-w-full p-4">
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
          <section className="min-w-full p-4">
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
              activeIdx === idx ? 'bg-indigo-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </main>
  );
}
