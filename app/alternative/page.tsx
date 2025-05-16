import { useState, useEffect, useRef } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FilePlus, Upload } from "lucide-react";
import { Loader2, X } from "lucide-react";
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

export default function ChatDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Your goal is to collect all required dispute fields. Ask explicitly, never guess. Require proof and set 'proof_uploaded' only after confirmation.",
    },
    {
      role: "assistant",
      content:
        "Let's start your dispute. Briefly describe your issue.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState<"chat" | "upload_proof">("chat");

  // Proof state
  const [proofFiles, setProofFiles] = useState<UploadedFile[]>([]);
  const [evidenceType, setEvidenceType] = useState("");
  const [proofDescription, setProofDescription] = useState("");

  // Helper to upload files
  const uploadFileToSupabase = async (file: File): Promise<UploadedFile | null> => {
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("proofbundle").upload(path, file);
    if (uploadError) return null;
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
    setProofFiles(prev => [...prev, ...uploaded]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput(''); setLoading(true);

    const res = await fetch('/api/gptchat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated })
    });
    const data = await res.json();

    // Function call handling
    if (data.function_call?.name === 'user_upload_proof') {
      setMessages(prev => [...prev, { role: 'assistant', content: '📎 Please upload proof files now.' }]);
      setCurrentStep('upload_proof'); setLoading(false);
      return;
    }
    if (data.function_call?.name === 'create_dispute') {
      let fields = {};
      try { fields = JSON.parse(data.function_call.arguments || '{}'); } catch {}
      if (!session?.user) {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ Please log in.' }]);
        setLoading(false);
        return;
      }
      // Insert dispute
      const { data: dispute, error } = await supabase.from('disputes').insert({
        user_id: session.user.id,
        ...fields,
        user_confirmed_input: true,
        status: 'draft',
        archived: false
      }).select('id').single();
      if (error || !dispute?.id) {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${error?.message || 'Error'}` }]);
        setLoading(false); return;
      }
      // Insert proof bundle
      if (proofFiles.length) {
        await supabase.from('proof_bundle').insert({
          user_id: session.user.id,
          dispute_id: dispute.id,
          receipt_url: proofFiles[0].url,
          screenshot_urls: proofFiles.slice(1).map(f => f.url),
          evidence_source: 'user_upload',
          dispute_type: evidenceType,
          user_description: proofDescription,
          policy_snapshot: null,
        });
      }
      setMessages(prev => [...prev, { role: 'assistant', content: '✅ Dispute created!' }]);
      setTimeout(() => router.push(`/cases/${dispute.id}`), 1500);
      setLoading(false);
      return;
    }
    // Fallback
    if (data.reply) setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="animate-fade-up animate-once animate-ease-in backdrop-blur-xl fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <GlowyBackground />
      {showDisclaimer ? (
        <div className="bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
          <p>The document is AI-generated, not legal advice.</p>
          <Button onClick={() => setShowDisclaimer(false)} className="mt-6">OK</Button>
        </div>
      ) : currentStep === 'upload_proof' ? (
        <div className="bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-xl w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Proof</h2>
          <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="w-full mb-2" />
          {proofFiles.map((f,i) => <div key={i}><a href={f.url} target="_blank" rel="noreferrer" className="underline">{f.name}</a></div>)}
          <select value={evidenceType} onChange={e => setEvidenceType(e.target.value)} className="w-full mb-2">
            <option value="">Select evidence type</option>
            <option value="receipt">Receipt / Invoice</option>
            <option value="bank_statement">Bank statement</option>
            <option value="chat_screenshot">Chat screenshot</option>
            <option value="tracking_doc">Tracking / shipping doc</option>
            <option value="other">Other</option>
          </select>
          <textarea value={proofDescription} onChange={e => setProofDescription(e.target.value)} placeholder="Describe evidence…" className="w-full mb-4" rows={3} />
          <Button onClick={async () => {
            const confirmMsg: Message = { role: 'user', content: 'Proof upload complete. Please finalize dispute.' };
            const next = [...messages, confirmMsg]; setMessages(next); setCurrentStep('chat'); setLoading(true);
            const res2 = await fetch('/api/gptchat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ messages: next }) });
            const d2 = await res2.json();
            if (d2.function_call?.name === 'create_dispute') {
              let fields = {};
              try { fields = JSON.parse(d2.function_call.arguments || '{}'); } catch {}
              if (session?.user) {
                const { data: disp } = await supabase.from('disputes').insert({ user_id: session.user.id, ...fields, user_confirmed_input:true,status:'draft',archived:false }).select('id').single();
                if (disp?.id) {
                  if (proofFiles.length) {
                    await supabase.from('proof_bundle').insert({ user_id: session.user.id, dispute_id: disp.id, receipt_url:proofFiles[0].url, screenshot_urls:proofFiles.slice(1).map(f=>f.url), evidence_source:'user_upload', dispute_type:evidenceType, user_description:proofDescription, policy_snapshot:null });
                  }
                  setMessages(prev=>[...prev,{role:'assistant',content:'✅ Dispute created!'}]);
                  setTimeout(()=>router.push(`/cases/${disp.id}`),1500);
                }
              }
            } else if (d2.reply) {
              setMessages(prev=>[...prev,{role:'assistant',content:d2.reply}]);
            }
            setLoading(false);
          }}>Continue</Button>
        </div>
      ) : (
        <div className="bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-xl w-full p-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3"><X /></button>
          <div className="max-h-96 overflow-auto mb-4">
            {messages.map((m,i) => (
              <div key={i} className={`p-3 rounded-xl ${m.role==='user'? 'bg-white/20 ml-auto':'bg-black/30 mr-auto'}`}>{m.content}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSendMessage()} placeholder="Type message…" disabled={loading} />
            <Button onClick={handleSendMessage} disabled={loading}>{loading? <Loader2 className="animate-spin" />:'Send'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
