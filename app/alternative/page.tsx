'use client'
import { useState, useEffect, useRef } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogOverlay, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FilePlus, Upload, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import GlowyBackground from "@/components/GlowyBackground";

// Message type
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
interface UploadedFile {
  name: string;
  url: string;
}

export default function ChatDisputeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Your goal is to collect all required dispute fields. Ask explicitly, never guess. Require proof and set 'proof_uploaded' only after confirmation." },
    { role: "assistant", content: "Let's start your dispute. Briefly describe your issue." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState<"chat" | "upload_proof">("chat");

  // Proof state
  const [proofFiles, setProofFiles] = useState<UploadedFile[]>([]);
  const [evidenceType, setEvidenceType] = useState("");
  const [proofDescription, setProofDescription] = useState("");

  // Helpers...
  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('proofbundle').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('proofbundle').getPublicUrl(path);
    return { name: file.name, url: data.publicUrl };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploads: UploadedFile[] = [];
    for (const file of Array.from(e.target.files)) {
      const uf = await uploadFile(file);
      if (uf) uploads.push(uf);
    }
    setProofFiles(prev => [...prev, ...uploads]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    const all = [...messages, userMsg]; setMessages(all); setInput(''); setLoading(true);
    const res = await fetch('/api/gptchat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ messages: all }) });
    const data = await res.json();

    // handle function calls
    if (data.function_call?.name === 'user_upload_proof') {
      setMessages(prev => [...prev, { role: 'assistant', content: '📎 Please upload proof files now.' }]);
      setCurrentStep('upload_proof'); setLoading(false); return;
    }
    if (data.function_call?.name === 'create_dispute') {
      let fields = {};
      try { fields = JSON.parse(data.function_call.arguments); } catch {}
      if (!session?.user) { setMessages(prev => [...prev, { role: 'assistant', content: '❌ Please log in.' }]); setLoading(false); return; }
      const { data: disp, error } = await supabase.from('disputes').insert({ user_id: session.user.id, ...fields, user_confirmed_input: true, status: 'draft', archived: false }).select('id').single();
      if (error || !disp?.id) { setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${error?.message}` }]); setLoading(false); return; }
      if (proofFiles.length) {
        await supabase.from('proof_bundle').insert({ user_id: session.user.id, dispute_id: disp.id, receipt_url: proofFiles[0].url, screenshot_urls: proofFiles.slice(1).map(f => f.url), evidence_source: 'user_upload', dispute_type: evidenceType, user_description: proofDescription, policy_snapshot: null });
      }
      setMessages(prev => [...prev, { role: 'assistant', content: '✅ Dispute created!' }]);
      setTimeout(() => router.push(`/cases/${disp.id}`), 1500);
      setLoading(false); return;
    }
    if (data.reply) setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <GlowyBackground />
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Dispute Wizard</DialogTitle>
        <DialogDescription>Follow the steps to file your dispute.</DialogDescription>

        {showDisclaimer ? (
          <div className="p-4 text-center">
            <p>The document is AI-generated, not legal advice.</p>
            <Button onClick={() => setShowDisclaimer(false)} className="mt-4">I Agree</Button>
          </div>
        ) : currentStep === 'upload_proof' ? (
          <div>
            <h3>Upload Proof</h3>
            <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="mb-2" />
            {proofFiles.map((f,i) => <div key={i}><a href={f.url} target="_blank" rel="noreferrer">{f.name}</a></div>)}
            <select value={evidenceType} onChange={e => setEvidenceType(e.target.value)} className="mt-2 w-full">
              <option value="">Select evidence type</option>
              <option value="receipt">Receipt</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="chat_screenshot">Chat Screenshot</option>
            </select>
            <textarea value={proofDescription} onChange={e => setProofDescription(e.target.value)} placeholder="Describe evidence…" className="w-full mt-2 p-2" rows={3} />
            <Button onClick={() => { setCurrentStep('chat'); sendMessage(); }} className="mt-4">Continue</Button>
          </div>
        ) : (
          <div className="flex flex-col h-80">
            <div className="flex-1 overflow-auto p-2">
              {messages.map((m,i) => (
                <div key={i} className={`my-1 p-2 rounded ${m.role==='user'?'bg-indigo-600 text-white ml-auto':'bg-gray-200 text-black mr-auto'}`}>{m.content}</div>
              ))}
            </div>
            <div className="flex gap-2 p-2">
              <Input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage()} placeholder="Type message…" disabled={loading} />
              <Button onClick={sendMessage} disabled={loading}>{loading? <Loader2 className="animate-spin" />:'Send'}</Button>
            </div>
          </div>
        )}

        <DialogClose className="mt-4">Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
