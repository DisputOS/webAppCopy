"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const supabase = useSupabaseClient(); // ✅ this uses the session-aware client
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-indigo-50 to-teal-50 p-6">
      <div className="w-full max-w-md rounded-2xl shadow-xl bg-white/80 backdrop-blur-lg p-8 animate-fadeInUp border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Вхід у Disput AI
        </h1>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Увійти
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Не маєте акаунта?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Зареєструватися
          </Link>
        </p>
      </div>
    </main>
  );
}
