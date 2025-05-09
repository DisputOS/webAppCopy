// file: src/lib/dispute-flow.ts
// (Place this in a shared “lib” or “utils” folder, e.g. <root>/src/lib)
// Pure data and helper definitions for the dispute wizard
// Pure data and helper definitions for the dispute wizard

// -----------------------------------------------------------------------------
// Step definitions -----------------------------------------------------------
// -----------------------------------------------------------------------------
export type FlowStep =
  | "amount_currency"
  | "platform"
  | "purchase_date"
  | "problem_type"
  | "service_usage"
  | "tracking_info"
  | "description"
  | "disclaimer"
  | "training_permission"
  | "confirm";

export const BASE_FLOW: readonly FlowStep[] = [
  "amount_currency",
  "platform",
  "purchase_date",
  "problem_type",
  "service_usage",
  "tracking_info",
  "description",
  "disclaimer",
  "training_permission",
  "confirm",
] as const;

/**
 * Map problem-types to bespoke flows
 *  • subscription_auto_renewal → no tracking_info
 *  • item_not_delivered       → no service_usage
 */
export const QUESTION_FLOW_BY_TYPE: Record<string, FlowStep[]> = {
  subscription_auto_renewal: BASE_FLOW.filter((s) => s !== "tracking_info"),
  item_not_delivered:       BASE_FLOW.filter((s) => s !== "service_usage"),
  other:                    [...BASE_FLOW],
};
