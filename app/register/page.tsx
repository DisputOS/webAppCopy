"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [sent,  setSent]        = useState(false);   // ← show “check email” state

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/`  // where the magic‑link lands
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);                 // switch to “check your e‑mail” panel
    }
  };

  /* ------------- UI --------------- */
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center uppercase tracking-wide">
          Create account
        </h1>

        {sent ? (
          /* After sign‑up */
          <div className="space-y-4 text-center">
            <MailCheck className="mx-auto w-12 h-12 text-blue-400" />
            <p className="text-sm text-gray-300">
              Almost there! <br />
              We’ve sent a confirmation link to&nbsp;
              <span className="font-semibold">{email}</span>.
            </p>
            <p className="text-xs text-gray-500">
              Open the e‑mail and click &ldquo;Confirm&rdquo; to activate your account.
            </p>

            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={() => router.push("/login")}
            >
              Back to login
            </Button>
          </div>
        ) : (
          /* Sign‑up form */
          <div className="space-y-5">
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

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign up
            </Button>

            <p className="text-sm text-gray-400 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
