'use client';

import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

type Proof = { proof_id: string; receipt_url: string | null };

export default function ProofCarousel({ proofs }: { proofs: Proof[] }) {
  const galleryRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') =>
    galleryRef.current?.scrollBy({
      left: dir === 'left' ? -galleryRef.current.clientWidth : galleryRef.current.clientWidth,
      behavior: 'smooth',
    });

  return (
    <div className="relative">
      {/* desktop arrows */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-800/70 hover:bg-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-800/70 hover:bg-gray-700"
      >
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </button>

      {/* swipe / scroll area */}
      <div
        ref={galleryRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-4 pb-2"
      >
        {proofs.map(
          p =>
            p.receipt_url && (
              <div
                key={p.proof_id}
                className="snap-start flex-shrink-0 w-[calc((100%-2rem)/3)] md:w-[180px] border border-gray-700 rounded-lg overflow-hidden"
              >
                <img src={p.receipt_url} alt="" className="w-full h-40 object-cover" />
                <div className="p-2 text-xs text-gray-400 truncate">
                  {p.receipt_url.split('/').pop()}
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
