// Server-only functions that require cloudflare:workers
import { env } from "cloudflare:workers";
import type { SubscriptionTier } from "./stripe.config";

// Map of price IDs to tiers - populated at runtime
const PRICE_ID_MAP: Record<SubscriptionTier, { monthly: string; yearly: string }> = {
  free: { monthly: "", yearly: "" },
  creator: { monthly: "STRIPE_PRICE_CREATOR_MONTHLY", yearly: "STRIPE_PRICE_CREATOR_YEARLY" },
  pro: { monthly: "STRIPE_PRICE_PRO_MONTHLY", yearly: "STRIPE_PRICE_PRO_YEARLY" },
  agency: { monthly: "STRIPE_PRICE_AGENCY_MONTHLY", yearly: "STRIPE_PRICE_AGENCY_YEARLY" },
};

export function getPriceIdForTier(
  tier: SubscriptionTier,
  billing: "monthly" | "yearly",
): string | null {
  if (tier === "free") return null;

  const envKey = PRICE_ID_MAP[tier][billing];
  return (env as Record<string, string>)[envKey] || null;
}

export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  // Check each tier's price IDs from env
  for (const tier of ["creator", "pro", "agency"] as const) {
    const monthlyKey = PRICE_ID_MAP[tier].monthly;
    const yearlyKey = PRICE_ID_MAP[tier].yearly;

    const monthlyId = (env as Record<string, string>)[monthlyKey];
    const yearlyId = (env as Record<string, string>)[yearlyKey];

    if (priceId === monthlyId || priceId === yearlyId) {
      return tier;
    }
  }
  return null;
}
