"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, User } from "lucide-react";

export default function LoginPage() {
  const supabase = useSupabaseClient();
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
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/cases");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center uppercase tracking-wide">
          Login to Disput AI
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-gray-500 text-lg text-white bg-transparent hover:bg-gray-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <User className="w-5 h-5" />
            )}
            Login
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
