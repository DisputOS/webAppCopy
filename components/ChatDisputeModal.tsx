"use client";

import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import GlowyBackground from "@/components/GlowyBackground";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "I'm here to help you create your dispute. Could you please describe your issue briefly?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/gptchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const data = await res.json();

    if (data.fields) {
      if (!session?.user) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ You must be logged in to submit a dispute." },
        ]);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("disputes").insert({
        user_id: session.user.id,
        ...data.fields,
        user_confirmed_input: true,
        status: "draft",
        archived: false,
      });

      if (!error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "✅ Your dispute was successfully created!" },
        ]);
        setTimeout(() => router.push("/cases"), 1500); // ⟵ редирект после задержки
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ Error: ${error.message}` },
        ]);
      }
    } else {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    }

    setLoading(false);
  };

  return (
    <div className="backdrop-blur-xl fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <GlowyBackground />

      {showDisclaimer ? (
        <div className="bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-md w-full p-6 text-center z-10">
          <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
          <p>
            The document we generate is created by an AI system. It is{" "}
            <strong className="text-white">not</strong> legal advice and may require review by a qualified attorney.
          </p>
          <p className="mt-2">By continuing, you acknowledge that you have read and understood this disclaimer.</p>
          <Button onClick={() => setShowDisclaimer(false)} className="mt-6">
            ok!
          </Button>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl max-w-xl w-full p-6 relative z-10 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-h-96 overflow-auto space-y-2 mb-4 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl backdrop-blur-sm ${
                  m.role === "user" ? "bg-white/20 ml-auto" : "bg-black/30 mr-auto"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              className="backdrop-blur-md bg-white/20 placeholder-gray-300 text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
