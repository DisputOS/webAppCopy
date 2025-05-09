"use client";

import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CheckCircle, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// -----------------------------------------------------------------------------
// Question flows
// Each problem type gets a tailored sequence of UI steps. Every flow ALWAYS ends
// with:  ▸ legal AI-disclaimer  ▸ training permission  ▸ final confirmation.
// -----------------------------------------------------------------------------
const BASE_FLOW = [
  "amount_currency",
  "platform",
  "purchase_date",
  "problem_type",
  "service_usage",
  "tracking_info",
  "description",
  // the three system-wide steps ↓
  "disclaimer",
  "training_permission",
  "confirm",
] as const;

type FlowStep = (typeof BASE_FLOW)[number];

const QUESTION_FLOW_BY_TYPE: Record<string, FlowStep[]> = {
  subscription_auto_renewal: BASE_FLOW,
  item_not_delivered: BASE_FLOW.filter((s) => s !== "service_usage"),
  other: BASE_FLOW,
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function NewDisputeModal({ onClose }: { onClose: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  // -------------------------------------------------
  // Local state
  // -------------------------------------------------
  const [form, setForm] = useState({
    purchase_amount: "",
    currency: "",
    platform_name: "",
    purchase_date: "",
    problem_type: "",
    description: "",
    service_usage: "",
    tracking_info: "",
    training_permission: "no", // yes | no
  });

  const [agreeAccuracy, setAgreeAccuracy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const flowSteps =
    QUESTION_FLOW_BY_TYPE[form.problem_type] || QUESTION_FLOW_BY_TYPE["other"];
  const currentStep = flowSteps[step];

  // -------------------------------------------------
  // Helpers
  // -------------------------------------------------
  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = () => {
    switch (currentStep) {
      case "amount_currency":
        return !!form.purchase_amount &&
          parseFloat(form.purchase_amount) > 0 &&
          !!form.currency;
      case "platform":
        return !!form.platform_name;
      case "purchase_date":
        return (
          !!form.purchase_date && new Date(form.purchase_date) <= new Date()
        );
      case "problem_type":
        return !!form.problem_type;
      case "service_usage":
        return form.service_usage === "yes" || form.service_usage === "no";
      case "tracking_info":
        return true; // optional
      case "description":
        return form.description.trim().length >= 20;
      case "training_permission":
        return form.training_permission === "yes" || form.training_permission === "no";
      case "confirm":
        return agreeAccuracy;
      default:
        return true;
    }
  };

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => (s === 0 ? 0 : s - 1));

  const handleSubmit = async () => {
    if (!session) return;
    setLoading(true);

    const { error } = await supabase
      .from("disputes")
      .insert([
        {
          user_id: session.user.id,
          platform_name: form.platform_name,
          purchase_amount: parseFloat(form.purchase_amount || "0"),
          currency: form.currency,
          purchase_date: form.purchase_date ? new Date(form.purchase_date) : null,
          problem_type: form.problem_type,
          description: form.description,
          // UX-required flags
          user_confirmed_input: true, // user accuracy checkbox
          legal_disclaimer_shown: true, // user saw the AI disclaimer
          training_permission: form.training_permission === "yes",
          // system fields
          user_plan: "free",
          status: "draft",
          archived: false,
          // optional user inputs
          service_usage: form.service_usage || null,
          tracking_info: form.tracking_info || null,
        },
      ])
      .single();

    setLoading(false);

    if (error) {
      console.error("❌ Supabase insert failed:", error.message, error.details);
      alert("Insert error: " + error.message);
      return;
    }

    router.push("/dashboard");
  };

  // -------------------------------------------------
  // Step renderers
  // -------------------------------------------------
  const renderStep = () => {
    switch (currentStep) {
      case "amount_currency":
        return (
          <>
            <Input
              placeholder="Amount (e.g. 20)"
              value={form.purchase_amount}
              onChange={(e) => handleChange("purchase_amount", e.target.value)}
            />
            <Input
              placeholder="Currency (e.g. EUR)"
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="mt-2"
            />
          </>
        );
      case "platform":
        return (
          <Input
            placeholder="Platform / merchant (e.g. Notion)"
            value={form.platform_name}
            onChange={(e) => handleChange("platform_name", e.target.value)}
          />
        );
      case "purchase_date":
        return (
          <Input
            type="date"
            value={form.purchase_date}
            onChange={(e) => handleChange("purchase_date", e.target.value)}
          />
        );
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
      case "tracking_info":
        return (
          <Input
            placeholder="Tracking number (optional)"
            value={form.tracking_info}
            onChange={(e) => handleChange("tracking_info", e.target.value)}
          />
        );
      case "description":
        return (
          <textarea
            className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm min-h-[120px]"
            placeholder="Describe the issue in detail (min 20 characters)…"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        );
      case "disclaimer":
        return (
          <div className="space-y-3 text-sm leading-relaxed text-gray-300">
            <p>
              The following document will be generated by an AI system. It is <strong className="text-white">not</strong> legal advice and may require revision by a qualified attorney in your jurisdiction.
            </p>
            <p>
              By continuing you acknowledge that you have read and understood this disclaimer.
            </p>
          </div>
        );
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
      case "confirm":
        return (
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={agreeAccuracy}
              onChange={(e) => setAgreeAccuracy(e.target.checked)}
              className="accent-blue-500 w-4 h-4"
            />
            I confirm that all information I provided is accurate and complete.
          </label>
        );
    }
  };

  // -------------------------------------------------
  // UI Shell
  // -------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Start a new dispute</h2>

        {/* Progress dots */}
        <div className="flex gap-3 justify-center mb-6">
          {flowSteps.map((_, i) => (
            <span key={i}>
              {i < step ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : i === step ? (
                <Circle className="w-5 h-5 text-blue-200 animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
            </span>
          ))}
        </div>

        {/* Step content */}
        <section className="space-y-6">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 0 && (
              <Button variant="outline" onClick={prev} disabled={loading}>
                Back
              </Button>
            )}
            {step < flowSteps.length - 1 ? (
              <Button onClick={next} disabled={!validateStep()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !validateStep()}>
                {loading ? "Submitting…" : "Submit"}
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
