'use client'
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { DisputeActionsMenu } from "./DisputeActionsMenu";

// core & module CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


import {
  BadgeCheck,
  ArrowLeft,
  FileText,
  FileCheck2,
  PlusCircle,
  FileUp
} from "lucide-react";
import Link from "next/link";
import EvidenceUploader from "./EvidenceUploader";

interface Dispute {
  id: string;
  dispute_name?: string;
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

const TABS = ["details", "proofs", "upload"] as const;
type TabKey = typeof TABS[number];

export default function TabbedDisputeDetail({
  dispute,
  proofs,
  proofCount
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const pdfReady = Boolean(dispute.pdf_url);
  const swiperRef = useRef<any>(null);

  const onTabClick = (idx: number) => {
    setActiveIdx(idx);
    swiperRef.current?.slideTo(idx);
  };

  // determine the little banner text
  let userMessage = proofCount === 0
    ? "Step 1: upload at least one proof document to start your case."
    : proofCount === 1 && !pdfReady
    ? "Great start! Upload a different proof type to speed up PDF generation."
    : !pdfReady
    ? "Generating your dispute letter—PDF will appear shortly."
    : "Your PDF is ready! Download and submit.";

  // icon helper
  const TabIcon = (tab: TabKey) => {
    switch (tab) {
      case "details": return <FileText className="w-5 h-5" />;
      case "proofs":  return <FileCheck2 className="w-5 h-5" />;
      case "upload":  return <PlusCircle className="w-5 h-5" />;
    }
  };

  const statusColor: Record<string,string> = {
    draft: "bg-gray-200 text-gray-600",
    open:  "bg-gray-200 text-gray-600",
    won:   "bg-gray-200 text-gray-600",
    lost:  "bg-gray-200 text-gray-600"
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      {/* Back link */}
      <Link href="/cases" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Top Tab Buttons */}
      <div className="flex justify-center space-x-4 mb-4">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => onTabClick(idx)}
            className={`p-2 rounded-lg transition ${
              activeIdx === idx
                ? "bg-gray-200 bg-opacity-20"
                : "text-gray-400 hover:bg-gray-200 hover:bg-opacity-10"
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

      {/* Swipeable Content */}
      <Swiper
        onSwiper={(sw) => (swiperRef.current = sw)}
        onSlideChange={(sw) => setActiveIdx(sw.activeIndex)}
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        className="swipe-container"
      >
        {/* Details Slide */}
        <SwiperSlide>
          <section>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold break-all">
                  {dispute.dispute_name || "Untitled Dispute"}
                </h1>
                <DisputeActionsMenu
                  disputeId={dispute.id}
                  isArchived={dispute.status === "archived"}
                />
              </div>
              <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${statusColor[dispute.status || ""]}`}>
                {dispute.status}
              </span>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
                <div>
                  <p className="font-medium text-gray-500">Platform</p>
                  <p>{dispute.platform_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Purchase Date</p>
                  <p>{new Date(dispute.purchase_date||"").toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Amount</p>
                  <p>{dispute.purchase_amount} {dispute.currency}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Created At</p>
                  <p>{new Date(dispute.created_at||"").toLocaleDateString()}</p>
                </div>
              </div>
              <p className="font-medium text-gray-500">Description</p>
              <p className="whitespace-pre-line text-gray-100">{dispute.description}</p>
              <div className="flex space-x-6 mt-4 justify-center">
                <button onClick={() => onTabClick(2)} className="p-2 rounded-lg bg-gray-200 bg-opacity-20 hover:bg-opacity-30">
                  <FileUp className="w-6 h-6 text-gray-200"/>
                </button>
                <button onClick={() => onTabClick(2)} className="p-2 rounded-lg bg-gray-200 bg-opacity-20 hover:bg-opacity-30">
                  <PlusCircle className="w-6 h-6 text-gray-200"/>
                </button>
                <Link href={pdfReady ? (dispute.pdf_url as string) : "#"} className="p-2 rounded-lg bg-gray-200 bg-opacity-20 hover:bg-opacity-30">
                  <FileText className="w-6 h-6 text-gray-200"/>
                </Link>
              </div>
            </div>
          </section>
        </SwiperSlide>

        {/* Proofs Slide */}
        <SwiperSlide>
          <section>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              {proofCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {proofs.map((p) => (
                    <div key={p.proof_id} className="rounded-lg overflow-hidden border border-gray-700">
                      <img src={p.receipt_url} className="w-full h-40 object-cover"/>
                      <p className="p-2 text-xs text-gray-400 truncate">{p.receipt_url.split("/").pop()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No proofs uploaded yet.</p>
              )}
            </div>
          </section>
        </SwiperSlide>

        {/* Upload Slide */}
        <SwiperSlide>
          <section>
            <EvidenceUploader caseId={dispute.id}/>
          </section>
        </SwiperSlide>
      </Swiper>
    </main>
  );
}