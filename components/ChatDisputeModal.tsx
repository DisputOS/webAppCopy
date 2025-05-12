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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 p-6 rounded-lg max-w-xl w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <X />
        </button>

        <div className="max-h-96 overflow-auto space-y-2 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm p-2 rounded ${m.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-700 text-white'}`}>
              {m.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
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
    </div>
  );
}
