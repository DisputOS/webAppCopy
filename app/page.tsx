"use client";

import Link from "next/link";

export default function LandingComingSoon() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 px-6 py-12 font-mono text-white text-center">
      {/* Animated background gradient using pure CSS */}
      <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_bottom_right,theme(colors.blue.900),theme(colors.indigo.900),theme(colors.black))] bg-[length:400%_400%] animate-slowSpin opacity-25 blur-3xl" />

      {/* Logo & tagline */}
      <div className="mb-10 animate-fadeInUp">
        <h1 className="text-5xl font-extrabold tracking-wider">
          Disput<span className="text-blue-400">.ai</span>
        </h1>
        <p className="mt-2 uppercase text-sm tracking-[0.3em] text-gray-400">
          Legal Operating System
        </p>
      </div>

      {/* Message */}
      <h2 className="mb-6 animate-fadeInUp text-4xl font-bold">We’re cooking something big.</h2>

      <p className="mx-auto max-w-lg animate-fadeInUp text-base leading-relaxed text-gray-300">
        Disput.ai is currently in private alpha. Our AI‑powered legal engine will let you
        file disputes, generate rock‑solid evidence bundles, and reclaim your digital
        consumer rights in minutes. Stay tuned — public beta drops soon.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-col gap-4 animate-fadeInUp sm:flex-row">
        <Link
          href="mailto:hello@disput.ai?subject=Beta%20Access"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-500 transition"
        >
          Request Beta Access
        </Link>
        <Link
          href="https://twitter.com/disput_ai"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition"
        >
          Follow Updates ↗
        </Link>
      </div>

      {/* Footer */}
      <p className="animate-fadeInSlow absolute bottom-4 text-xs text-gray-500">
        © 2025 Disput.ai — All rights reserved.
      </p>

      {/* Tailwind keyframes */}
      <style jsx>{`
        @keyframes slowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-slowSpin { animation: slowSpin 40s linear infinite; }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }

        @keyframes fadeInSlow {
          0% { opacity: 0; }
          100% { opacity: 0.4; }
        }
        .animate-fadeInSlow { animation: fadeInSlow 2s ease forwards 1.2s; }
      `}</style>
    </main>
  );
}
