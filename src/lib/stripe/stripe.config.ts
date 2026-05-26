import { env } from "cloudflare:workers";

export type SubscriptionTier = "free" | "creator" | "pro" | "agency";

export type TierConfig = {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  limits: {
    analysesPerMonth: number;
    videosPerAnalysis: number;
    historyDays: number;
    exports: boolean;
    aiInsights: number;
    compareAccounts: number;
    competitorTracking: number;
    apiAccess: boolean;
  };
};

export const TIER_CONFIG: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      analysesPerMonth: 1,
      videosPerAnalysis: 20,
      historyDays: 7,
      exports: false,
      aiInsights: 1,
      compareAccounts: 0,
      competitorTracking: 0,
      apiAccess: false,
    },
  },
  creator: {
    name: "Creator",
    priceMonthly: 29,
    priceYearly: 300, // 25€/month
    limits: {
      analysesPerMonth: 20,
      videosPerAnalysis: 200,
      historyDays: 90,
      exports: true,
      aiInsights: -1, // unlimited
      compareAccounts: 2,
      competitorTracking: 0,
      apiAccess: false,
    },
  },
  pro: {
    name: "Pro",
    priceMonthly: 79,
    priceYearly: 828, // 69€/month
    limits: {
      analysesPerMonth: -1, // unlimited
      videosPerAnalysis: -1, // unlimited
      historyDays: -1, // unlimited
      exports: true,
      aiInsights: -1,
      compareAccounts: 5,
      competitorTracking: 10,
      apiAccess: false,
    },
  },
  agency: {
    name: "Agency",
    priceMonthly: 199,
    priceYearly: 2148, // 179€/month
    limits: {
      analysesPerMonth: -1,
      videosPerAnalysis: -1,
      historyDays: -1,
      exports: true,
      aiInsights: -1,
      compareAccounts: -1,
      competitorTracking: -1,
      apiAccess: true,
    },
  },
};

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

export function isLimitReached(
  used: number,
  limit: number,
): boolean {
  if (limit === -1) return false; // unlimited
  return used >= limit;
}
