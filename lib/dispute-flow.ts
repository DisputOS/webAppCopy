// -----------------------------------------------------------------------------
// file: src/lib/dispute-flow.ts
// Pure data & helper definitions for the dispute wizard
// -----------------------------------------------------------------------------

// All possible wizard steps (add “country”)
export type FlowStep =
  | "amount_currency"
  | "platform"
  | "purchase_date"
  | "problem_type"
  | "service_usage"
  | "tracking_info"
  | "country"           // NEW
  | "description"
  | "disclaimer"
  | "training_permission"
  | "confirm";

// Base flow (array is readonly for type-safety)
export const BASE_FLOW: readonly FlowStep[] = [
  "amount_currency",
  "platform",
  "purchase_date",
  "problem_type",
  "service_usage",
  "tracking_info",
  "country",           // NEW
  "description",
  "disclaimer",
  "training_permission",
  "confirm",
] as const;

/**
 * Map problem types to bespoke flows
 *  • subscription_auto_renewal → no tracking_info
 *  • item_not_delivered       → no service_usage
 */
export const QUESTION_FLOW_BY_TYPE: Record<string, FlowStep[]> = {
  subscription_auto_renewal: BASE_FLOW.filter((s) => s !== "tracking_info"),
  item_not_delivered:       BASE_FLOW.filter((s) => s !== "service_usage"),
  other:                    [...BASE_FLOW],
};
