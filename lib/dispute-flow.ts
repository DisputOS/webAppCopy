// -----------------------------------------------------------------------------
// file: src/lib/dispute-flow.ts
// Pure data & helper definitions for the dispute wizard
// -----------------------------------------------------------------------------

export type FlowStep =
  | "amount_currency"
  | "platform"
  | "purchase_date"
  | "problem_type"
  | "description"
  | "service_usage"
  | "user_contact_platform"      // <— NEW spelling
  | "user_contact_description"   // <— shown only if answer == "yes"
  | "user_upload_proof"
  | "disclaimer"
  | "training_permission"
  | "confirm";

// -----------------------------------------------------------------------------
// 1) Base step order (do not put conditional logic here) -----------------------
// -----------------------------------------------------------------------------
export const BASE_FLOW: readonly FlowStep[] = [
  "amount_currency",
  "platform",
  "purchase_date",
  "problem_type",
  "description",
  "service_usage",
  "user_contact_platform",
  "user_contact_description",   // may be stripped later
  "user_upload_proof",
  "disclaimer",
  "training_permission",
  "confirm",
] as const;

// -----------------------------------------------------------------------------
// 2) Problem-type shortcuts (optionally drop service_usage) --------------------
// -----------------------------------------------------------------------------
export const PROBLEM_TYPE_FLOW: Record<string, FlowStep[]> = {
 subscription_auto_renewal: BASE_FLOW.filter(
    (s) => s !== "service_usage"
  ) as FlowStep[],             // cast → mutable
  item_not_delivered: [...BASE_FLOW],   // spread → mutable
  other: [...BASE_FLOW],
};

// -----------------------------------------------------------------------------
// 3) Runtime helper: build the real flow for *this* form state -----------------
// -----------------------------------------------------------------------------
export interface FlowBuildArgs {
  problem_type?: string;
  user_contact_platform?: "yes" | "no" | "";
}

/**
 * Returns the wizard steps that should be presented right now,
 * based on current answers in the form.
 */
export function buildFlow(
  { problem_type = "other", user_contact_platform = "" }: FlowBuildArgs
): FlowStep[] {
  // Start from the static mapping for the selected dispute type
  let steps = PROBLEM_TYPE_FLOW[problem_type] || PROBLEM_TYPE_FLOW["other"];

  // If the user *did not* contact the platform, drop the follow-up question
  if (user_contact_platform === "no") {
    steps = steps.filter((s) => s !== "user_contact_description");
  }

  return steps;
}
