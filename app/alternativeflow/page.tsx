'use client'

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Loader2, Upload, FilePlus, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

// Types
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

interface DisputeFields {
  platform_name?: string;
  purchase_date?: string;
  problem_type?: string;
  description?: string;
  user_contact_platform?: string;
  user_contact_desc?: string;
  training_permission?: string;
  [key: string]: any;
}

export default function DisputeWizard() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const steps = ["Platform", "Chat", "Evidence", "Summary", "Complete"];

  const [platformName, setPlatformName] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm here to help you create your dispute. Could you please describe your issue briefly? We can talk on any language you want!",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [disputeFields, setDisputeFields] = useState<DisputeFields | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [evidenceType, setEvidenceType] = useState<string>("");
  const [evidenceDescription, setEvidenceDescription] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/gptchat2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.function_call?.name === "create_dispute") {
        let fields: DisputeFields = {};
        try {
          fields = JSON.parse(data.function_call.arguments);
        } catch (err) {
          setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error parsing response." }]);
          setChatLoading(false);
          return;
        }
        fields.platform_name = platformName;
        fields.purchase_date = purchaseDate;
        setDisputeFields(fields);
        setCurrentStep(3);
      } else if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Something went wrong." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return setUploadError("Please select at least one file.");
    if (!evidenceType) return setUploadError("Please choose the evidence type.");
    if (!session?.user) return setUploadError("You must be logged in.");
    setUploadError(null);
    let countryCode = 'XX';
try {
  const res = await fetch('/api/get-country');
  const json = await res.json();
  countryCode = json.country || 'XX';
} catch (e) {
  console.warn("Could not fetch country code:", e);
}
    setUploadLoading(true);
    try {
      let dispute_id = disputeId;
      if (!dispute_id && disputeFields) {
        const { data: inserted, error: insertErr } = await supabase
          .from("disputes")
          .insert({
            user_id: session.user.id,
            user_confirmed_input: true,
            status: "draft",
            jurisdiction_flag: countryCode, // <--- додано сюди
            archived: false,
            ...disputeFields,
            user_contact_platform: disputeFields.user_contact_platform === "yes",
            training_permission: disputeFields.training_permission === "yes",
          })
          .select("id")
          .single();
        if (insertErr || !inserted?.id) {
          throw insertErr || new Error("Failed to create dispute");
        }
        dispute_id = inserted.id;
        setDisputeId(dispute_id);
      }
      const BUCKET = "proofbundle";
      const urls: string[] = [];
      const uploadedList: { name: string; url: string }[] = [];
      for (const file of Array.from(files)) {
        const filePath = `${dispute_id}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(filePath, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        urls.push(urlData.publicUrl);
        uploadedList.push({ name: file.name, url: urlData.publicUrl });
      }
      await supabase.from("proof_bundle").insert([
        {
          user_id: session.user.id,
          dispute_id: dispute_id,
          receipt_url: urls[0],
          screenshot_urls: urls.slice(1),
          evidence_source: "user_upload",
          dispute_type: evidenceType,
          user_description: evidenceDescription,
          policy_snapshot: null,
        },
      ]);
      setUploadedFiles(uploadedList);
      setUploadLoading(false);
      setCurrentStep(4);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Upload failed");
      setUploadLoading(false);
    }
  };
function CountdownRedirect() {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count === 0 && disputeId) {
      window.location.href = `/cases/${disputeId}`;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  return <p className="text-gray-600">Redirecting in {count} seconds...</p>;
}
const handleFinalSubmit = async () => {
  if (!disputeFields || !session?.user) return;
  setSaving(true);
  let countryCode = 'XX';
  try {
    const res = await fetch('/api/get-country');
    const json = await res.json();
    countryCode = json.country || 'XX';
  } catch (e) {
    console.warn("Could not fetch country code:", e);
  }
  try {
    let dispute_id = disputeId;
    if (!dispute_id) {
      const { data: inserted, error: insertErr } = await supabase
        .from("disputes")
        .insert({
          user_id: session.user.id,
          user_confirmed_input: true,
          status: "draft",
          jurisdiction_flag: countryCode,
          archived: false,
          ...disputeFields,
          user_contact_platform: disputeFields.user_contact_platform === "yes",
          training_permission: disputeFields.training_permission === "yes",
        })
        .select("id")
        .single();
      if (insertErr || !inserted?.id) {
        throw insertErr || new Error("Failed to create dispute");
      }
      dispute_id = inserted.id;
      setDisputeId(dispute_id);
    }
    const BUCKET = "proofbundle";
    const urls: string[] = [];
    const uploadedList: { name: string; url: string }[] = [];
    for (const file of Array.from(files || [])) {
      const filePath = `${dispute_id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(filePath, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      urls.push(urlData.publicUrl);
      uploadedList.push({ name: file.name, url: urlData.publicUrl });
    }
    await supabase.from("proof_bundle").insert([
      {
        user_id: session.user.id,
        dispute_id: dispute_id,
        receipt_url: urls[0],
        screenshot_urls: urls.slice(1),
        evidence_source: "user_upload",
        dispute_type: evidenceType,
        user_description: evidenceDescription,
        policy_snapshot: null,
      },
    ]);
    setUploadedFiles(uploadedList);
    setCurrentStep(5);
  } catch (err: any) {
    console.error("Failed to finalize dispute:", err);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="text-black min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-1/4 p-4 border-r border-slate-200">
        <h2 className="text-xl font-semibold mb-6">Dispute Progress</h2>
        <ul className="space-y-2">
          {steps.map((label, i) => (
            <li
              key={label}
              className={`flex items-center gap-2 ${
                i === currentStep - 1 ? "text-indigo-600 font-bold" : "text-slate-500"
              }`}
            >
              <span className="w-6 h-6 text-sm flex items-center justify-center rounded-full border">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold">Step {currentStep}: {steps[currentStep - 1]}</h1>

        {currentStep === 1 && (
          <div className="space-y-4 bg-white border rounded-xl p-6">
            <Input placeholder="Platform Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-3">
            <div className="space-y-2 bg-white border rounded-xl p-4 max-h-80 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded ${m.role === "user" ? "bg-indigo-600 text-white ml-auto" : "bg-slate-200 text-black mr-auto"}`}>{m.content}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} disabled={chatLoading} />
              <Button onClick={handleSendMessage} disabled={chatLoading}>{chatLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send"}</Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="border border-dashed border-slate-300 p-6 rounded-xl bg-white">
            <Label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="w-8 h-8 text-slate-500" />
              <span>Upload Evidence</span>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
              />
            </Label>
            <ul className="mt-4 space-y-2">
              {files && Array.from(files).map((file, idx) => (
                <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                  <FilePlus className="w-4 h-4" /> {file.name}
                </li>
              ))}
            </ul>
            <Input className="mt-4" placeholder="Evidence Description" value={evidenceDescription} onChange={(e) => setEvidenceDescription(e.target.value)} />
            <Button className="mt-4" onClick={handleUpload} disabled={uploadLoading}>
              {uploadLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Upload & Continue"}
            </Button>
            <label className="block text-sm mb-1">Evidence Type</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
            >
              <option value="">Select evidence type</option>
              <option value="receipt">Receipt / Invoice</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="chat_screenshot">Chat Screenshot</option>
              <option value="tracking_doc">Tracking / Shipping Doc</option>
              <option value="other">Other</option>
            </select>
            {uploadError && <p className="text-red-500 mt-2 text-sm">{uploadError}</p>}
          </div>
        )}

{currentStep === 4 && disputeFields && (
  <div className="bg-white p-6 rounded-xl border">
    <h2 className="text-xl font-semibold mb-4">Review your dispute</h2>
    <div className="space-y-3">
      <Input
        value={disputeFields.dispute_name || ""}
        onChange={(e) => setDisputeFields({ ...disputeFields, dispute_name: e.target.value })}
        placeholder="Name for your dispute (e.g. 'Spotify Refund Case')"
      />
      
      <Input
        value={disputeFields.description || ""}
        onChange={(e) => setDisputeFields({ ...disputeFields, description: e.target.value })}
        placeholder="Description"
      />
      <Input
        type="number"
        value={disputeFields.purchase_amount || ""}
        onChange={(e) => setDisputeFields({ ...disputeFields, purchase_amount: parseFloat(e.target.value) })}
        placeholder="Amount Spent"
      />
      <Input
        value={disputeFields.currency || ""}
        onChange={(e) => setDisputeFields({ ...disputeFields, currency: e.target.value })}
        placeholder="Currency (e.g. USD)"
      />
      <select
        value={disputeFields.user_contact_platform || ""}
        onChange={(e) => setDisputeFields({ ...disputeFields, user_contact_platform: e.target.value })}
        className="w-full bg-gray-100 p-2 rounded"
      >
        <option value="">Did you contact the platform?</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      {disputeFields.user_contact_platform === "yes" && (
        <Input
          value={disputeFields.user_contact_desc || ""}
          onChange={(e) => setDisputeFields({ ...disputeFields, user_contact_desc: e.target.value })}
          placeholder="Describe your communication"
        />
      )}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={disputeFields.training_permission === "yes"}
          onChange={(e) =>
            setDisputeFields({
              ...disputeFields,
              training_permission: e.target.checked ? "yes" : "no",
            })
          }
        />
        <span>Allow use of this dispute to improve Disput.ai</span>
      </label>

      {uploadedFiles.length > 0 && (
        <div className="pt-4">
          <h3 className="text-md font-semibold mb-2">Uploaded Evidence</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((f, idx) => {
              const isImage = f.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const isPDF = f.url.match(/\.pdf$/i);
              return (
                <div key={idx} className="relative border rounded overflow-hidden group bg-gray-100">
                  {isImage ? (
                    <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                  ) : isPDF ? (
                    <div className="w-full h-32 flex items-center justify-center bg-red-100 text-red-600 font-semibold">
                      PDF File
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-yellow-100 text-yellow-800 font-semibold">
                      File
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Button onClick={handleFinalSubmit} disabled={saving} className="mt-4">
        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm and Submit"}
      </Button>
    </div>
  </div>
)}
{currentStep === 5 && (
  <div className="text-center space-y-6 py-10">
    <div className="mx-auto w-16 h-16 animate-bounce text-green-500">
      <CheckCircle className="w-full h-full" />
    </div>
    <h2 className="text-2xl font-bold text-green-500 animate-fade-in">✅ Dispute submitted successfully!</h2>
    <CountdownRedirect />
    <Button
      onClick={() => {
        if (disputeId) {
          window.location.href = `/cases/${disputeId}`;
        }
      }}
      className="mt-4"
    >
      Navigate to the Dispute!
    </Button>
  </div>
)}


        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(s - 1, 1))} disabled={currentStep === 1}>Back</Button>
          <Button onClick={() => setCurrentStep((s) => Math.min(s + 1, 5))}>Continue</Button>
        </div>

        <div className="text-xs text-slate-400">
          Your data is encrypted. OpenAI logging is disabled.
        </div>
      </main>
    </div>
  );
}
