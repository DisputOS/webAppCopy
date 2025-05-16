// ✅ Modified version of ChatDisputeModal that works both as modal and inline

import React, { useState } from "react";
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

interface UploadedFile {
  name: string;
  url: string;
}

export default function ChatDisputeModal({
  onClose,
  embedded = false,
}: {
  onClose?: () => void;
  embedded?: boolean;
}) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Your goal is to collect all required dispute fields. Ask for each explicitly. Do not guess values. Require proof upload and set 'proof_uploaded: true' only after confirmation.",
    },
    {
      role: "assistant",
      content: "I'm here to help you create your dispute. Could you please describe your issue briefly?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(!embedded);
  const [currentStep, setCurrentStep] = useState<"chat" | "upload_proof">("chat");

  const [proofFiles, setProofFiles] = useState<UploadedFile[]>([]);
  const [evidenceType, setEvidenceType] = useState("");
  const [proofDescription, setProofDescription] = useState("");

  const uploadFileToSupabase = async (file: File): Promise<UploadedFile | null> => {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("proofbundle").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("proofbundle").getPublicUrl(path);
    return { name: file.name, url: data.publicUrl };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploaded: UploadedFile[] = [];
    for (const file of Array.from(e.target.files)) {
      const uf = await uploadFileToSupabase(file);
      if (uf) uploaded.push(uf);
    }
    setProofFiles((prev) => [...prev, ...uploaded]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/gptchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated }),
    });
    const data = await res.json();

    if (data.function_call?.name) {
      const { name, arguments: args = "{}" } = data.function_call;

      if (name === "user_upload_proof") {
        setMessages((prev) => [...prev, { role: "assistant", content: "\ud83d\udcce Please upload your proof files now." }]);
        setCurrentStep("upload_proof");
        setLoading(false);
        return;
      }

      if (name === "create_dispute") {
        let fields = {};
        try { fields = JSON.parse(args); } catch {}
        if (!session?.user) {
          setMessages((prev) => [...prev, { role: "assistant", content: "\u274c Please log in." }]);
          setLoading(false);
          return;
        }
        const { data: dispute } = await supabase.from("disputes").insert({
          user_id: session.user.id,
          ...fields,
          user_confirmed_input: true,
          status: "draft",
          archived: false,
        }).select("id").single();
        if (dispute?.id) {
          if (proofFiles.length) {
            await supabase.from("proof_bundle").insert({
              user_id: session.user.id,
              dispute_id: dispute.id,
              receipt_url: proofFiles[0].url,
              screenshot_urls: proofFiles.slice(1).map((f) => f.url),
              evidence_source: "user_upload",
              dispute_type: evidenceType,
              user_description: proofDescription,
              policy_snapshot: null,
            });
          }
          setMessages((prev) => [...prev, { role: "assistant", content: "\u2705 Dispute created!" }]);
          setTimeout(() => router.push(`/cases/${dispute.id}`), 1500);
        }
        setLoading(false);
        return;
      }
    }

    if (data.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    }
    setLoading(false);
  };

  return (
    <div className={`w-full ${embedded ? "bg-white border rounded-xl p-4" : "animate-fade-up animate-once animate-ease-in backdrop-blur-xl fixed inset-0 z-50 flex items-center justify-center overflow-hidden"}`}>
      {!embedded && <GlowyBackground />}

      {showDisclaimer ? (
        <div className="bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-md w-full p-6 text-center z-10">
          <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
          <p>
            The document is generated by AI. It is <strong className="text-white">not</strong> legal advice.
          </p>
          <p className="mt-2">By continuing, you agree.</p>
          <Button onClick={() => setShowDisclaimer(false)} className="mt-6">ok!</Button>
        </div>
      ) : currentStep === "upload_proof" ? (
        <div className="bg-white/10 border border-white/20 shadow-2xl rounded-3xl w-full p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Upload Proof</h2>

          <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="w-full bg-gray-800 text-white rounded px-3 py-2 mb-2" />
          <ul className="text-xs text-gray-300 space-y-1 mb-4">
            {proofFiles.map((f, i) => (
              <li key={i}><a href={f.url} target="_blank" className="underline">{f.name}</a></li>
            ))}
          </ul>

          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)} className="w-full bg-gray-800 text-white rounded px-3 py-2 mb-4">
            <option value="">Select evidence type</option>
            <option value="receipt">Receipt / Invoice</option>
            <option value="bank_statement">Bank statement</option>
            <option value="chat_screenshot">Chat screenshot</option>
            <option value="tracking_doc">Tracking / shipping doc</option>
            <option value="other">Other</option>
          </select>

          <textarea value={proofDescription} onChange={(e) => setProofDescription(e.target.value)} placeholder="Describe your evidence…" className="w-full bg-gray-800 text-white rounded px-3 py-2 mb-4" rows={3} />

          <Button onClick={async () => {
            const m: Message = { role: "user", content: "Proof upload complete. Please finalize dispute." };
            const nextMessages = [...messages, m];
            setMessages(nextMessages);
            setCurrentStep("chat");
            setInput("");
            setLoading(true);
            const res2 = await fetch("/api/gptchat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: nextMessages }),
            });
            const data2 = await res2.json();
            if (data2.function_call?.name === "create_dispute") {
              let fields = {};
              try { fields = JSON.parse(data2.function_call.arguments); } catch {}
              if (session?.user) {
                const { data: dispute } = await supabase.from("disputes").insert({ user_id: session.user.id, ...fields, user_confirmed_input: true, status: "draft", archived: false }).select("id").single();
                if (dispute?.id) {
                  if (proofFiles.length) {
                    await supabase.from("proof_bundle").insert({ user_id: session.user.id, dispute_id: dispute.id, receipt_url: proofFiles[0].url, screenshot_urls: proofFiles.slice(1).map(f => f.url), evidence_source: "user_upload", dispute_type: evidenceType, user_description: proofDescription, policy_snapshot: null });
                  }
                  setMessages(prev => [...prev, { role: "assistant", content: "✅ Dispute created!" }]);
                  setTimeout(() => router.push(`/cases/${dispute.id}`), 1500);
                }
              }
            } else if (data2.reply) {
              setMessages(prev => [...prev, { role: "assistant", content: data2.reply }]);
            }
            setLoading(false);
          }}>Continue</Button>
        </div>
      ) : (
        <div className="bg-white/10 border border-white/20 shadow-2xl rounded-3xl w-full p-6 relative text-white">
          {!embedded && onClose && (
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-200 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="max-h-96 overflow-auto space-y-2 mb-4 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded-xl backdrop-blur-sm ${m.role === "user" ? "bg-white/20 ml-auto" : "bg-black/30 mr-auto"}`}>{m.content}</div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              className="backdrop-blur-md bg-white/20 text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type message…"
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