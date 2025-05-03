'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-4xl font-bold tracking-wide">
          Disput<span className="text-blue-400">.ai</span>
        </h1>
      </div>

      {/* Tagline */}
      <p className="uppercase text-sm text-gray-400 tracking-widest mb-6">
        Legal Operating System
      </p>

      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-8 text-xs text-gray-300 mb-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          DISPUTE LOGGED
        </div>
        <div className="w-6 h-px bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          PROOF
        </div>
        <div className="w-6 h-px bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          GENERATED
        </div>
      </div>

      {/* Status Box */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg mb-10">
        <p className="text-gray-500 text-xs">[03:47:02]</p>
        <p className="text-lg font-semibold mb-2">Case Initiated</p>
        <p className="text-sm text-gray-400">
          Create a time-stamped PDF for your dispute.
        </p>
      </div>

      {/* Generate Block */}
      <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
        <div className="text-left space-y-2">
          <h2 className="text-xl font-bold">Generate Proof</h2>
          <p className="text-gray-400 text-sm">
            Create a time-stamped PDF for your dispute
          </p>
          <Button className="mt-3">Submit</Button>
        </div>

        <div className="border border-gray-700 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">AI GENERATED</p>
          <div className="w-24 h-24 bg-white text-black flex items-center justify-center text-xs">
            QR
          </div>
          <p className="mt-2 text-sm text-gray-400">PDF</p>
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="flex gap-4 mb-6">
        <Link href="/register">
          <Button className="px-6 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500">
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" className="px-6 py-3 text-sm font-semibold rounded-xl border border-gray-600 text-gray-300">
            Login
          </Button>
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        Built for digital consumers. Automated legal support.
      </p>
    </main>
  );
}
