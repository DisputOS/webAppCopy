// -----------------------------------------------------------------------------
// file: src/components/TabbedDisputeDetail.tsx   (client component)
// -----------------------------------------------------------------------------
"use client";

import { useState } from 'react';
import { BadgeCheck, ArrowLeft, FileText, FileCheck2, FileSignature, FileUp, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import EvidenceUploader from './EvidenceUploader';
import { Dispute } from '@/types';

interface Props {
  dispute: Dispute;
  proofs: Array<{ proof_id: string; receipt_url: string }>;  // adjust fields as needed
  proofCount: number;
}

export default function TabbedDisputeDetail({ dispute, proofs, proofCount }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'proofs' | 'upload'>('details');
  const pdfReady = Boolean(dispute.pdf_url);

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  // Helper user message logic same as before
  let userMessage: string;
  if (proofCount === 0) {
    userMessage = 'Step 1: upload at least one proof document so we can start building your case.';
  } else if (proofCount === 1 && !pdfReady) {
    userMessage = 'Good start! Add one more document of a *different* type and we will auto‑generate your dispute letter faster.';
  } else if (!pdfReady) {
    userMessage = 'Your documents look good. We are generating the dispute template now — the PDF link will appear here shortly.';
  } else {
    userMessage = 'Your dispute PDF is ready. Download it and send it to the merchant or your bank.';
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 space-y-6">
      {/* Back link */}
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to all cases
      </Link>

      {/* Tabs navigation */}
      <nav className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('details')}
          className={
            `pb-2 ${
              activeTab === 'details'
                ? 'border-b-2 border-indigo-500 text-indigo-300'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('proofs')}
          className={
            `pb-2 ${
              activeTab === 'proofs'
                ? 'border-b-2 border-indigo-500 text-indigo-300'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          Uploaded Proofs ({proofCount})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={
            `pb-2 ${
              activeTab === 'upload'
                ? 'border-b-2 border-indigo-500 text-indigo-300'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          Upload New Proof
        </button>
      </nav>

      {/* User guidance banner */}
      <div className="bg-indigo-950/60 border border-indigo-800 rounded-xl p-4 flex items-center gap-3 text-sm text-indigo-100">
        <BadgeCheck className="w-4 h-4 text-indigo-400" />
        <p>{userMessage}</p>
      </div>

      {/* Tab panels */}
      {activeTab === 'details' && (
        <section className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
            <h1 className="text-2xl font-bold break-all">{dispute.problem_type || 'Untitled Dispute'}</h1>
            <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${statusColor[dispute.status]}`}>{dispute.status}</span>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
              <div><p className="font-medium text-gray-500">Platform</p><p>{dispute.platform_name}</p></div>
              <div><p className="font-medium text-gray-500">Purchase Date</p><p>{new Date(dispute.purchase_date).toLocaleDateString()}</p></div>
              <div><p className="font-medium text-gray-500">Amount</p><p>{dispute.purchase_amount} {dispute.currency}</p></div>
              <div><p className="font-medium text-gray-500">Created At</p><p>{new Date(dispute.created_at).toLocaleDateString()}</p></div>
            </div>

            <div><p className="font-medium text-gray-500 mb-1">Description</p><p className="whitespace-pre-line text-gray-100 leading-relaxed">{dispute.description}</p></div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Link href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FileUp className="w-4 h-4" /> Add Proof
            </Link>
            <Link href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <PlusCircle className="w-4 h-4" /> Generate Template
            </Link>
            <Link href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <FileText className="w-4 h-4" /> View PDF
            </Link>
          </div>
        </section>
      )}

      {activeTab === 'proofs' && (
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {proofCount > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {proofs.map((proof) => (
                <div key={proof.proof_id} className="rounded-lg overflow-hidden border border-gray-700">
                  <img src={proof.receipt_url} alt="Uploaded proof" className="w-full h-40 object-cover" />
                  <div className="p-2 text-xs text-gray-400 truncate">{proof.receipt_url.split('/').pop()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No proofs uploaded yet.</p>
          )}
        </section>
      )}

      {activeTab === 'upload' && (
        <section>
          <EvidenceUploader caseId={dispute.id} />
        </section>
      )}
    </main>
  );
}
