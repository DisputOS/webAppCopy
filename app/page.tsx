"use client";

export default function LandingComingSoon() {
  return (
    <main className=""min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 space-y-6"">
      {/* Animated background gradient using pure CSS */}
      <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_bottom_right,theme(colors.blue.900),theme(colors.indigo.900),theme(colors.black))] bg-[length:400%_400%] animate-slowSpin opacity-25 blur-3xl" />

      {/* Logo & tagline */}
      <div className="mb-10 animate-fadeInUp">
        <h1 className="text-5xl font-extrabold tracking-wider">
          Disput<span className="text-blue-400">.Brain</span>
        </h1>
        <p className="mt-2 uppercase text-sm tracking-[0.3em] text-gray-400">
          Legal Operating System
        </p>
      </div>

      {/* Message */}
      <h2 className="mb-6 animate-fadeInUp text-4xl font-bold">We’re cooking something big.</h2>

      <p className="mx-auto max-w-lg animate-fadeInUp text-base leading-relaxed text-gray-300">
        Disput.ai is building an AI‑powered autopilot for digital consumers. Soon you’ll be able
        to file e‑commerce disputes, auto‑generate legally sound evidence bundles, and reclaim your
        rights in minutes — not weeks. Our team is working hard on the private alpha; public beta
        will open later this year.
      </p>

      {/* Footer */}
      <p className="animate-fadeInSlow absolute bottom-4 text-xs text-gray-500">
        © 2025 DisputBrain — All rights reserved.
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
