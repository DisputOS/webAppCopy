'use client'

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Types
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

interface DisputeFields {
  platform_name?: string;
  purchase_date?: string;
  [key: string]: any;
}

export default function DisputeWizard() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [platformName, setPlatformName] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Your goal is to collect all required dispute fields. Ask for each explicitly. Do not guess values. Require proof upload and set 'proof_uploaded: true' only after confirmation.",
    },
    {
      role: "assistant",
      content:
        "I'm here to help you create your dispute. Could you please describe your issue briefly?",
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
    setUploadLoading(true);
    try {
      let dispute_id = disputeId;
      if (!dispute_id) {
        const { data: inserted, error: insertErr } = await supabase
          .from("disputes")
          .insert({
            user_id: session.user.id,
            user_confirmed_input: true,
            status: "draft",
            archived: false,
            ...disputeFields,
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

  return (
    <div className="min-h-screen p-10 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
        {/* Purchase Info */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Step 1: Purchase Info</h2>
            <Input
              placeholder="Platform Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="mb-4"
            />
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mb-4"
            />
            <Button onClick={() => setCurrentStep(2)} disabled={!platformName || !purchaseDate}>
              Next
            </Button>
          </div>
        )}

        {/* Chat Assistant */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Step 2: Chat</h2>
            <div className="space-y-2 mb-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${m.role === "user" ? "bg-indigo-600 text-white ml-auto" : "bg-gray-700 text-white mr-auto"}`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={chatLoading}
              />
              <Button onClick={handleSendMessage} disabled={chatLoading}>
                {chatLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send"}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Evidence */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Step 3: Upload Evidence</h2>
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="mb-4" />
            <Input
              placeholder="Evidence Type"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="mb-4"
            />
            <Input
              placeholder="Evidence Description"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleUpload} disabled={uploadLoading}>
              {uploadLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Upload & Continue"}
            </Button>
            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
          </div>
        )}

        {/* Summary */}
        {currentStep === 4 && disputeFields && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Step 4: Summary</h2>
            <pre className="text-sm bg-gray-700 p-4 rounded-lg overflow-auto">
              {JSON.stringify(disputeFields, null, 2)}
            </pre>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {currentStep > 1 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}