"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const supabase = useSupabaseClient(); // ✅ use context-aware Supabase client
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/cases/new");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-fadeInUp">
        <h1 className="text-3xl font-bold text-gray-800">Створити акаунт</h1>

        <div className="space-y-4 text-left">
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-gray-600">Пароль</label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <Button
          onClick={handleRegister}
          disabled={loading}
          className="w-full flex justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Зареєструватись"}
        </Button>

        <p className="text-sm text-gray-600 text-center">
          Вже маєте акаунт?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Увійти
          </Link>
        </p>
      </div>
    </main>
  );
}
