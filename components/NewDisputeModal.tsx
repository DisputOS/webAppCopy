// -----------------------------------------------------------------------------
//  UNACTIVE UNACTIVE UNACTIVE UNACTIVE UNACTIVE file: src/components/NewDisputeModal.tsx
// -----------------------------------------------------------------------------
"use client";

import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CheckCircle, Circle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

import { buildFlow, FlowStep } from "@/lib/dispute-flow";

export default function NewDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session  = useSession();
  const router   = useRouter();

  /* ---------------------------------------------------------------------- */
  /* 1) FORM STATE                                                          */
  /* ---------------------------------------------------------------------- */
  const [form, setForm] = useState({
    purchase_amount:          "",
    currency:                 "",
    platform_name:            "",
    purchase_date:            "",
    problem_type:             "",
    description:              "",
    service_usage:            "",
    user_contact_platform:    "",
    user_contact_description: "",
    training_permission:      "no",
    evidence_type:            "",           // NEW 👈
    proof_description:        "",           // NEW 👈
  });

  const [proofFiles,   setProofFiles]   = useState<File[]>([]); // NEW
  const [agreeAcc,     setAgreeAcc]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [step,         setStep]         = useState(0);
  const [errorBanner,  setErrorBanner]  = useState<string | null>(null); // NEW

  /* ---------------------------------------------------------------------- */
  /* 2) DYNAMIC FLOW (branching)                                            */
  /* ---------------------------------------------------------------------- */
  const flowSteps: FlowStep[] = buildFlow({
    problem_type:          form.problem_type,
    user_contact_platform: form.user_contact_platform as "" | "yes" | "no",
  });
  const currentStep = flowSteps[step];

  if (step >= flowSteps.length) {
    setStep(flowSteps.length - 1);
    return null;
  }

  const handleChange = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  /* ---------------------------------------------------------------------- */
  /* 3) VALIDATION                                                          */
  /* ---------------------------------------------------------------------- */
  const validateStep = (): boolean => {
    switch (currentStep) {
      case "amount_currency":
        return !!form.purchase_amount && +form.purchase_amount > 0 && !!form.currency;
      case "platform":
        return !!form.platform_name;
      case "purchase_date":
        return !!form.purchase_date && new Date(form.purchase_date) <= new Date();
      case "problem_type":
        return !!form.problem_type;
      case "service_usage":
        return ["yes", "no"].includes(form.service_usage);
      case "user_contact_platform":
        return ["yes", "no"].includes(form.user_contact_platform);
      case "user_contact_description":
        return form.user_contact_description.trim().length >= 10;
      case "user_upload_proof":
        return proofFiles.length > 0 && !!form.evidence_type; // evidence_type required
      case "description":
        return form.description.trim().length >= 20;
      case "training_permission":
        return ["yes", "no"].includes(form.training_permission);
      case "confirm":
        return agreeAcc;
      default:
        return true;
    }
  };

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(0, s - 1));

  /* ---------------------------------------------------------------------- */
/* 4) SUBMIT: create dispute → upload files → insert proof_bundle         */
/* ---------------------------------------------------------------------- */
const handleSubmit = async () => {
  if (!session) return;
  setErrorBanner(null);
  setLoading(true);

  /* 4-A) Insert dispute -------------------------------------------------- */
  const { data: dispute, error: disputeErr } = await supabase
    .from("disputes")
    .insert([{
      user_id:                session.user.id,
      platform_name:          form.platform_name,
      purchase_amount:        parseFloat(form.purchase_amount),
      currency:               form.currency,
      purchase_date:          new Date(form.purchase_date),
      problem_type:           form.problem_type,
      description:            form.description,
      service_usage:          form.service_usage || null,
      user_contact_platform:  form.user_contact_platform || null,
      user_contact_desc:      form.user_contact_description || null,
      user_confirmed_input:   true,
      legal_disclaimer_shown: true,
      training_permission:    form.training_permission === "yes",
      user_plan:              "free",
      status:                 "draft",
      archived:               false,
    }])
    .select("id")          // ask Supabase to return only the id
    .single();

  if (disputeErr) {
    setLoading(false);
    return setErrorBanner(disputeErr.message);
  }

  /* Make TS happy – dispute.id is guaranteed here */
  const disputeId = dispute.id!;          // <-- non-nullable string

  /* 4-B) Upload proofs + insert proof_bundle ----------------------------- */
  const BUCKET = "proofbundle";
  const urls: string[] = [];

  for (const file of proofFiles) {
    const path = `${disputeId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file);
    if (upErr) {
      console.error("Upload error:", upErr.message);
      continue;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  if (urls.length) {
    await supabase.from("proof_bundle").insert([{
      user_id:          session.user.id,
      dispute_id:       disputeId,               // references the dispute
      receipt_url:      urls[0] ?? null,
      screenshot_urls:  urls.slice(1),
      evidence_source:  "user_upload",
      dispute_type:     form.evidence_type,
      user_description: form.proof_description,
      policy_snapshot:  null,
    }]);
  }

  setLoading(false);
  router.push(`/cases/${disputeId}`);
};


  /* ------------------------------------------------------------------ */
/* 5) RENDER PER STEP                                                 */
/* ------------------------------------------------------------------ */
const renderStep = () => {
  switch (currentStep) {
    /* ---------- 1. amount & currency -------------------------------- */
    case "amount_currency":
      return (
        <>
          <Input
            placeholder="Amount (e.g. 20)"
            className="w-full"                              // 👈 visible width
            value={form.purchase_amount}
            onChange={(e) => handleChange("purchase_amount", e.target.value)}
          />
          <Input
            placeholder="Currency (e.g. EUR)"
            className="w-full mt-2"                         // 👈 visible width
            value={form.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
          />
        </>
      );

    /* ---------- 2. platform ----------------------------------------- */
    case "platform":
      return (
        <Input
          placeholder="Merchant / platform name (e.g. Notion)"
          className="w-full"
          value={form.platform_name}
          onChange={(e) => handleChange("platform_name", e.target.value)}
        />
      );

    /* ---------- 3. purchase_date ------------------------------------ */
    case "purchase_date":
      return (
        <Input
          type="date"
          className="w-full"
          value={form.purchase_date}
          onChange={(e) => handleChange("purchase_date", e.target.value)}
        />
      );

    /* ---------- 4. problem_type ------------------------------------- */
    case "problem_type":
      return (
        <select
          value={form.problem_type}
          onChange={(e) => handleChange("problem_type", e.target.value)}
          className="w-full bg-gray-950 border border-gray-700 rounded p-2"
        >
          <option value="">Select problem type</option>
          <option value="subscription_auto_renewal">Subscription auto-renewal</option>
          <option value="item_not_delivered">Item not delivered</option>
          <option value="other">Other</option>
        </select>
      );

    /* ---------- 5. service_usage ------------------------------------ */
    case "service_usage":
      return (
        <select
          value={form.service_usage}
          onChange={(e) => handleChange("service_usage", e.target.value)}
          className="w-full bg-gray-950 border border-gray-700 rounded p-2"
        >
          <option value="">Did you use the service?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );

    /* ---------- 6. user_contact_platform ---------------------------- */
    case "user_contact_platform":
      return (
        <select
          value={form.user_contact_platform}
          onChange={(e) => handleChange("user_contact_platform", e.target.value)}
          className="w-full bg-gray-950 border border-gray-700 rounded p-2"
        >
          <option value="">Did you already contact the merchant/platform?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );

    /* ---------- 7. user_contact_description ------------------------- */
    case "user_contact_description":
      return (
        <textarea
          className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm min-h-[120px]"
          placeholder="Describe when and how you contacted the merchant…"
          value={form.user_contact_description}
          onChange={(e) => handleChange("user_contact_description", e.target.value)}
        />
      );

    /* ---------- 8. description (issue details) ---------------------- */
    case "description":
      return (
        <textarea
          className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm min-h-[120px]"
          placeholder="Describe the issue in detail (min 20 characters)…"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      );

    /* ---------- 9. user_upload_proof ----------------------------------- */
case "user_upload_proof":
  return (
    <>
      {/* File picker */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload files
        </label>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => {
            if (e.target.files) setProofFiles(Array.from(e.target.files));
          }}
          className="w-full border border-gray-700 bg-gray-800
                     text-sm text-white rounded-lg px-4 py-2
                     file:mr-4 file:py-1 file:px-3 file:rounded
                     file:border-0 file:text-sm file:font-medium
                     file:bg-blue-600 hover:file:bg-blue-500"
        />
        {proofFiles.length > 0 && (
          <ul className="mt-2 text-xs max-h-28 overflow-auto text-gray-400 space-y-1">
            {proofFiles.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Evidence type */}
      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Evidence type
        </label>
        <select
          value={form.evidence_type}
          onChange={(e) => handleChange("evidence_type", e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg p-2 text-sm"
        >
          <option value="">Select evidence type</option>
          <option value="receipt">Receipt / Invoice</option>
          <option value="bank_statement">Bank statement</option>
          <option value="chat_screenshot">Chat screenshot</option>
          <option value="tracking_doc">Tracking / shipping doc</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Optional description */}
      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          value={form.proof_description}
          onChange={(e) => handleChange("proof_description", e.target.value)}
          className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg p-3 text-sm"
          rows={4}
          placeholder="Describe your evidence…"
        />
      </div>
    </>
  );


    /* ---------- 10. disclaimer -------------------------------------- */
    case "disclaimer":
      return (
        <div className="space-y-3 text-sm leading-relaxed text-gray-300">
          <p>
            The document we generate is created by an AI system. It is <strong className="text-white">not</strong> legal advice and may require review by a qualified attorney.
          </p>
          <p>By continuing, you acknowledge that you have read and understood this disclaimer.</p>
        </div>
      );

   /* ---------- 11. training_permission ----------------------------- */
case "training_permission":
  return (
    <div className="space-y-4 text-sm">
      <p className="text-gray-300">
        May we anonymously use this dispute (without personal data) to improve Disput.ai?
      </p>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="yes"
            checked={form.training_permission === "yes"}
            onChange={(e) => handleChange("training_permission", e.target.value)}
          />
          Yes, you can use my data
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="no"
            checked={form.training_permission === "no"}
            onChange={(e) => handleChange("training_permission", e.target.value)}
          />
          No, do not use my data
        </label>
      </div>
    </div>
  );

/* ---------- 12. confirm ----------------------------------------- */
case "confirm":
  return (
    <label className="flex items-center gap-3 text-sm text-gray-300">
      <input
        type="checkbox"
        checked={agreeAcc}
        onChange={(e) => setAgreeAcc(e.target.checked)}
        className="accent-blue-500 w-4 h-4"
      />
      I confirm that all information I provide is accurate and complete.
    </label>
  );


    default:
      return null;
  }
};


  /* ---------------------------------------------------------------------- */
  /* 6) UI LAYOUT                                                           */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-white rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Start a new dispute</h2>

        {/* progress dots */}
        <div className="flex gap-3 justify-center mb-6">
          {flowSteps.map((_, i) => (
            <span key={i}>
              {i < step
                ? <CheckCircle className="w-5 h-5 text-blue-400" />
                : i === step
                ? <Circle className="w-5 h-5 text-blue-200 animate-pulse" />
                : <Circle className="w-5 h-5 text-gray-600" />}
            </span>
          ))}
        </div>

        {/* error banner */}
        {errorBanner && (
          <p className="text-red-500 text-xs text-center mb-4">{errorBanner}</p>
        )}

        <section className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-4">
            {step > 0 && (
              <Button variant="outline" onClick={prev} disabled={loading}>
                Back
              </Button>
            )}

            {step < flowSteps.length - 1 ? (
              <Button onClick={next} disabled={!validateStep() || loading}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !validateStep()}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
