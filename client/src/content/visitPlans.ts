export const VISIT_PLANS = {
  STANDARD: { label: "Standard visit", price: 999, description: "An exterior photo and location check." },
  DETAILED: { label: "Detailed visit", price: 2499, description: "A visit following your specific inspection notes." },
} as const;
export type VisitPlan = keyof typeof VISIT_PLANS;
export function formatVisitQuote(plan?: string | null, price?: number | null) {
  if (!plan || price == null) return "Visit fee not recorded";
  const label = plan === "DETAILED" ? "Detailed visit" : "Standard visit";
  return `${label} quoted at ₹${(price / 100).toLocaleString("en-IN")}`;
}

/** Price alone for dense mobile cards and job tickets. */
export function visitPriceLabel(
  plan?: string | null,
  pricePaise?: number | null
): string | null {
  if (!plan || pricePaise == null) return null;
  return `₹${(pricePaise / 100).toLocaleString("en-IN")}`;
}

/** Plan name alone when the price or plan is missing. */
export function visitPlanLabel(plan?: string | null): string | null {
  if (plan === "DETAILED") return "Detailed visit";
  if (plan === "STANDARD") return "Standard visit";
  return null;
}
