import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 animate-fadeInUp">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 11l-10-5v10l10 5 10-5V8l-10 5z" fill="currentColor" />
        </svg>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Disput<span className="text-indigo-600">.ai</span></h1>
      </div>

      {/* Hero Heading */}
      <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-fadeInUp [animation-delay:100ms]">
        Автоматизуй <span className="text-indigo-600">юридичні диспути</span> за хвилини
      </h2>
      <p className="max-w-2xl text-lg sm:text-xl text-gray-700 mb-8 animate-fadeInUp [animation-delay:200ms]">
        Disput.ai генерує професійні претензійні листи за допомогою штучного інтелекту. Забери свій час та нерви –
        дай нашому AI підготувати необхідні документи, поки ти займаєшся важливими справами.
      </p>

      {/* Call‑to‑Action Buttons */}
      <div className="flex gap-4 animate-fadeInUp [animation-delay:300ms]">
        <Link href="/register">
          <Button className="px-6 py-3 text-lg font-semibold shadow-xl rounded-2xl hover:scale-105 transition-transform duration-200 group">
            Зареєструватися
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" className="px-6 py-3 text-lg font-semibold rounded-2xl hover:scale-105 transition-transform duration-200">
            Увійти
          </Button>
        </Link>
      </div>

      {/* Small footer note */}
      <p className="mt-12 text-sm text-gray-500 animate-fadeInUp [animation-delay:400ms]">
        Підтримуємо 🇺🇦 підприємців та споживачів. Ваші права — наш пріоритет.
      </p>
    </main>
  );
}
