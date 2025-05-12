"use client";

import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "I'm here to help you create your dispute. Could you please describe your issue briefly?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
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
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: '❌ You must be logged in to submit a dispute.' }
        ]);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('disputes').insert({
        user_id: session.user.id,
        ...data.fields,
        user_confirmed_input: true,
        status: 'draft',
        archived: false,
      });

      if (!error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "✅ Your dispute was successfully created!" }]);
        router.push("/cases");
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${error.message}` }]);
      }
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* SVG Background */}
      <svg style={{ display: 'none' }}>
        <filter id="wavy">
          <feTurbulence type="turbulence" baseFrequency="0.005 0.01" numOctaves="2" seed="4" result="turb">
            <animate attributeName="baseFrequency" values="0.005 0.01; 0.007 0.012; 0.005 0.01" dur="12s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="25" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="animated-bg"></div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl max-w-xl w-full p-6 relative z-10 text-white">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-200 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-96 overflow-auto space-y-2 mb-4 pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-xl backdrop-blur-sm ${m.role === 'user' ? 'bg-white/20 ml-auto' : 'bg-black/30 mr-auto'}`}>
              {m.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            className="backdrop-blur-md bg-white/20 placeholder-gray-300 text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={loading}
          />
          <Button onClick={handleSendMessage} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Send"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: url('/public/icons/GPT.png') no-repeat center/cover;
          z-index: -1;
          opacity: 0.8;
          filter: url(#wavy) blur(22px) brightness(1.2);
          animation: softZoom 16s ease-in-out infinite alternate;
        }

        @keyframes softZoom {
          0% {
            transform: scale(1) translateY(5px);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.015) translateY(0);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.03) translateY(-5px);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
}
