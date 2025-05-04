"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingComingSoon() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 px-6 py-12 font-mono text-white text-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_bottom_right,theme(colors.blue.900),theme(colors.indigo.900),theme(colors.black))] bg-[length:400%_400%] animate-[spin_30s_linear_infinite] opacity-25 blur-3xl" />

      {/* Logo & tagline */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-10"
      >
        <h1 className="text-5xl font-extrabold tracking-wider">
          Disput<span className="text-blue-400">.ai</span>
        </h1>
        <p className="mt-2 uppercase text-sm tracking-[0.3em] text-gray-400">
          Legal Operating System
        </p>
      </motion.div>

      {/* Message */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-6 text-4xl sm:text-5xl font-bold"
      >
        We’re cooking something big.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mx-auto max-w-lg text-gray-300 text-base leading-relaxed"
      >
        Disput.ai is currently in private alpha. Our AI‑powered legal engine will let you
        file disputes, generate rock‑solid evidence bundles, and reclaim your digital
        consumer rights in minutes. Stay tuned — public beta drops soon.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-10 flex flex-col gap-4 sm:flex-row"
      >
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
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-4 text-xs text-gray-500"
      >
        © 2025 Disput.ai — All rights reserved.
      </motion.p>
    </main>
  );
}
