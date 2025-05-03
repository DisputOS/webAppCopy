'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Plus } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-gray-950 text-white font-mono flex flex-col items-center justify-center px-6 py-12 text-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-tr from-blue-900 via-black to-indigo-900 opacity-20 blur-2xl" />

      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold tracking-wider">
          Disput<span className="text-blue-400">.ai</span>
        </h1>
        <p className="uppercase text-sm text-gray-400 tracking-widest mt-2">
          Legal Operating System
        </p>
      </div>

      {/* Headline */}
      <h2 className="text-4xl sm:text-5xl font-bold mb-12">Hello, human.</h2>

      {/* Auth Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/login">
          <Button className="w-full flex items-center justify-center gap-2 border border-gray-500 text-lg text-white bg-transparent hover:bg-gray-800">
            <User className="w-5 h-5" /> Login
          </Button>
        </Link>
        <Link href="/register">
          <Button className="w-full flex items-center justify-center gap-2 border border-gray-500 text-lg text-white bg-transparent hover:bg-gray-800">
            <Plus className="w-5 h-5" /> Register
          </Button>
        </Link>
      </div>

      {/* Description */}
      <p className="mt-12 max-w-xl text-sm text-gray-400">
        Disput.ai helps you generate time-stamped legal proof and resolve disputes in minutes. We empower digital consumers with AI-driven documentation, automation, and protection.
      </p>

      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }
      `}</style>
    </main>
  );
}
