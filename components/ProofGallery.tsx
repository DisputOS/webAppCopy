'use client';

import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Proof {
  proof_id: string;
  receipt_url: string;
}

interface Props {
  proofs: Proof[];
}

/** Horizontally–scrollable gallery (3 cards / viewport, touch‑swipe & arrow controlled) */
export default function ProofGallery({ proofs }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = (ref.current.clientWidth / 3) * (dir === 'left' ? -1 : 1);
    ref.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!proofs.length) return null;

  return (
    <div className="relative">
      {/* desktop arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-gray-800/70 p-2 text-gray-200 hover:bg-gray-700 md:block"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-gray-800/70 p-2 text-gray-200 hover:bg-gray-700 md:block"
      >
        <ArrowLeft className="h-4 w-4 rotate-180" />
      </button>

      {/* scroll / swipe container */}
      <div
        ref={ref}
        className="flex snap-x snap-mandatory space-x-4 overflow-x-auto pb-2 scroll-smooth"
      >
        {proofs.map((p) => (
          <div
            key={p.proof_id}
            className="snap-start w-[calc((100%-2rem)/3)] flex-shrink-0 overflow-hidden rounded-lg border border-gray-700 md:w-[160px]"
          >
            <img src={p.receipt_url} alt="Uploaded proof" className="h-40 w-full object-cover" />
            <div className="truncate p-2 text-xs text-gray-400">
              {p.receipt_url.split('/').pop()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
