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

interface UploadedFile {
  name: string;
  url: string;
}

export default function ChatDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([{
    role: "system",
    content: "Your goal is to collect all required dispute fields. Ask for each one explicitly. Do not guess values. Ask for proof upload and mark 'proof_uploaded: true' only after user confirms completion."
  }, {
    role: "assistant",
    content: "I'm here to help you create your dispute. Could you please describe your issue briefly?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState<"chat" | "upload_proof">("chat");

  const [proofFiles, setProofFiles] = useState<UploadedFile[]>([]);
  const [evidenceType, setEvidenceType] = useState("");
  const [proofDescription, setProofDescription] = useState("");

  const uploadFileToSupabase = async (file: File): Promise<UploadedFile | null> => {
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("proofbundle").upload(path, file);
    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return null;
    }
    const { data } = supabase.storage.from("proofbundle").getPublicUrl(path);
    return { name: file.name, url: data.publicUrl };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploaded: UploadedFile[] = [];
    for (const file of Array.from(e.target.files)) {
      const uploadedFile = await uploadFileToSupabase(file);
      if (uploadedFile) uploaded.push(uploadedFile);
    }
    setProofFiles((prev) => [...prev, ...uploaded]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/gptchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages }),
    });

    const data = await res.json();

    if (data.function_call && typeof data.function_call.name === "string") {
      const { name, arguments: args } = data.function_call;

      if (name === "user_upload_proof") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "📎 Please upload your proof files now." },
        ]);
        setCurrentStep("upload_proof");
        setLoading(false);
        return;
      }

      if (name === "create_dispute") {
        let fields = {};
        try {
          fields = JSON.parse(args || "{}");
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "❌ Error parsing data from assistant." },
          ]);
          setLoading(false);
          return;
        }

        if (!session?.user) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "❌ You must be logged in to submit a dispute." },
          ]);
          setLoading(false);
          return;
        }

        const { data: dispute, error } = await supabase
          .from("disputes")
          .insert({
            user_id: session.user.id,
            ...fields,
            user_confirmed_input: true,
            status: "draft",
            archived: false,
          })
          .select("id")
          .single();

        if (error || !dispute?.id) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `❌ Error: ${error?.message || "Unknown error"}` },
          ]);
          setLoading(false);
          return;
        }

        if (proofFiles.length > 0) {
          await supabase.from("proof_bundle").insert({
            user_id: session.user.id,
            dispute_id: dispute.id,
            receipt_url: proofFiles[0]?.url ?? null,
            screenshot_urls: proofFiles.slice(1).map((f) => f.url),
            evidence_source: "user_upload",
            dispute_type: evidenceType,
            user_description: proofDescription,
            policy_snapshot: null,
          });
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "✅ Your dispute was successfully created!" },
        ]);
        setTimeout(() => router.push(`/cases/${dispute.id}`), 1500);
        setLoading(false);
        return;
      }
    }

    if (data.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    }

    setLoading(false);
  };
}




  return (
    <div className="animate-fade-in-down backdrop-blur-xl fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <GlowyBackground />

      {showDisclaimer ? (
        <div className="bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-md w-full p-6 text-center z-10">
          <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
          <p>
            The document we generate is created by an AI system. It is{" "}
            <strong className="text-white">not</strong> legal advice and may require review by a qualified attorney.
          </p>
          <p className="mt-2">
            By continuing, you acknowledge that you have read and understood this disclaimer.
          </p>
          <Button onClick={() => setShowDisclaimer(false)} className="mt-6">
            ok!
          </Button>
        </div>
      ) : currentStep === "upload_proof" ? (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl max-w-xl w-full p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Upload your proof</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Upload files</label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2"
            />
            <ul className="mt-2 text-xs max-h-28 overflow-auto text-gray-300 space-y-1">
              {proofFiles.map((f, i) => (
                <li key={i}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Evidence type</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2"
            >
              <option value="">Select evidence type</option>
              <option value="receipt">Receipt / Invoice</option>
              <option value="bank_statement">Bank statement</option>
              <option value="chat_screenshot">Chat screenshot</option>
              <option value="tracking_doc">Tracking / shipping doc</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2"
              rows={3}
              placeholder="Describe your evidence…"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("chat")}>
              Back to chat
               </Button>
          <Button
  onClick={async () => {
    const m: Message = {
      role: "user",
      content: "I've uploaded my proof files and filled out the evidence type and description.",
    };
    setMessages((prev) => [...prev, m]);
    setCurrentStep("chat");
    setInput("");
    await handleSendMessage(); // 💡 вызовет GPT и продолжит
  }}
>
  Continue
</Button>

          </div>
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
