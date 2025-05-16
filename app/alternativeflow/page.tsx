'use client'
import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, FileText } from "lucide-react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function DisputeWizard() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 state
  const [platformName, setPlatformName] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>("");

  // Step 2 state (chat)
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
  const [disputeFields, setDisputeFields] = useState<any>(null);

  // Step 3 state (evidence)
  const [files, setFiles] = useState<FileList | null>(null);
  const [evidenceType, setEvidenceType] = useState<string>("");
  const [evidenceDescription, setEvidenceDescription] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [disputeId, setDisputeId] = useState<string | null>(null);

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
   const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/gptchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.function_call?.name) {
        const { name, arguments: args = "{}" } = data.function_call;
        if (name === "create_dispute") {
          let fields = {};
          try {
            fields = JSON.parse(args);
          } catch (err) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "❌ Error parsing response." },
            ]);
            setChatLoading(false);
            return;
          }
          // Use platform and date from step 1 if provided
          (fields as any).platform_name = platformName;
          (fields as any).purchase_date = purchaseDate;
          setDisputeFields(fields);
          setChatLoading(false);
          setCurrentStep(3);
          return;
        }
        if (name === "user_upload_proof") {
          setChatLoading(false);
          setCurrentStep(3);
          return;
        }
      }
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Something went wrong." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle evidence upload
  const handleUpload = async () => {
    if (!files || files.length === 0) return setUploadError("Please select at least one file.");
    if (!evidenceType) return setUploadError("Please choose the evidence type.");
    if (!session?.user) return setUploadError("You must be logged in.");
    setUploadError(null);
    setUploadLoading(true);
    try {
      // Insert dispute if not already
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
        const publicUrl = urlData.publicUrl;
        urls.push(publicUrl);
        uploadedList.push({ name: file.name, url: publicUrl });
      }
      // Insert proof bundle
      const { error: bundleErr } = await supabase.from("proof_bundle").insert([
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
      if (bundleErr) throw bundleErr;
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
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 p-6">
        <h2 className="text-xl font-bold mb-4">Dispute Steps</h2>
        <ul className="space-y-4">
          {["Platform", "Chat", "Evidence", "Summary", "Preview"].map((step, idx) => {
            const stepIndex = idx + 1;
            const isCurrent = currentStep === stepIndex;
            const isDone = currentStep > stepIndex;
            return (
              <li
                key={idx}
                className={`flex items-center space-x-2 ${
                  isCurrent
                    ? "text-indigo-400 font-semibold"
                    : isDone
                    ? "text-green-400"
                    : "text-gray-500"
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-6 h-6" />
                ) : isCurrent ? (
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                    {stepIndex}
                  </div>
                ) : (
                  <div className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center">
                    {stepIndex}
                  </div>
                )}
                <span>{step}</span>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {currentStep === 1 && (
          <div className="space-y-6 max-w-lg mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Purchase Info</h2>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">
                Platform Name
              </label>
              <Input
                id="platform"
                type="text"
                placeholder="e.g., Amazon"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="block w-full"
              />
            </div>
            <div>
              <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-300 mb-1">
                Purchase Date
              </label>
              <Input
                id="purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="block w-full"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Chat with Assistant</h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white ml-auto"
                      : "bg-gray-700 text-white mr-auto"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={chatLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={chatLoading}>
                {chatLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 max-w-lg mx-auto bg-gray-900 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Step 3: Upload Evidence</h2>
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">
                Upload files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => setFiles(e.target.files)}
                className="block w-full text-sm text-gray-200 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="evidence-type" className="block text-sm font-medium text-gray-300 mb-1">
                Evidence type
              </label>
              <select
                id="evidence-type"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="block w-full p-2 text-sm text-gray-200 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select evidence type
                </option>
                <option value="receipt">Receipt / Invoice</option>
                <option value="bank_statement">Bank statement</option>
                <option value="chat_screenshot">Chat screenshot</option>
                <option value="tracking_doc">Tracking / shipping doc</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="evidence-description" className="block text-sm font-medium text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="evidence-description"
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
                rows={3}
                className="block w-full p-2 text-sm text-gray-200 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe your evidence…"
              />
            </div>
            {uploadError && <p className="text-red-500 text-sm text-center">{uploadError}</p>}
            <Button onClick={handleUpload} disabled={uploadLoading} className="w-full flex items-center justify-center gap-2">
              {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload & Continue"}
            </Button>
          </div>
        )}

        {currentStep === 4 && disputeFields && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Step 4: Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-400">Platform</p>
                <p>{disputeFields.platform_name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Purchase Date</p>
                <p>{disputeFields.purchase_date}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Amount</p>
                <p>
                  {disputeFields.purchase_amount} {disputeFields.currency}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Problem Type</p>
                <p>{disputeFields.problem_type}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-400">Description</p>
                <p>{disputeFields.description}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Service Used</p>
                <p>{disputeFields.service_usage}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Contacted Platform</p>
                <p>{disputeFields.user_contact_platform}</p>
              </div>
              {disputeFields.user_contact_platform === "yes" && (
                <div className="col-span-2">
                  <p className="font-medium text-gray-400">Contact Description</p>
                  <p>{disputeFields.user_contact_desc}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="font-medium text-gray-400">Training Permission</p>
                <p>{disputeFields.training_permission}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-6">Evidence</h3>
            <div className="mt-2">
              <p>
                <span className="font-medium text-gray-400">Type:</span> {evidenceType}
              </p>
              <p>
                <span className="font-medium text-gray-400">Description:</span> {evidenceDescription}
              </p>
              {uploadedFiles.length > 0 && (
                <>
                  <p className="font-medium text-gray-400 mt-2">Files:</p>
                  <ul className="list-disc list-inside">
                    {uploadedFiles.map((f, idx) => (
                      <li key={idx}>
                        <a href={f.url} target="_blank" className="text-indigo-300 hover:underline">
                          {f.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Step 5: PDF Preview</h2>
            <FileText className="w-16 h-16 text-gray-600" />
            <p className="mt-4 text-gray-400">PDF Preview Mockup</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 max-w-2xl mx-auto">
          {currentStep > 1 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          {currentStep < 5 && currentStep !== 3 && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && (!platformName || !purchaseDate)) ||
                (currentStep === 2 && !disputeFields)
              }
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}