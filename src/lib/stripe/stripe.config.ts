export type SubscriptionTier = "free" | "creator" | "pro" | "agency";

export type TierConfig = {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
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
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
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
    // These IDs will be set after creating products in Stripe
    stripePriceIdMonthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_CREATOR_YEARLY || "",
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
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY || "",
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
    stripePriceIdMonthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_AGENCY_YEARLY || "",
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

export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, config] of Object.entries(TIER_CONFIG)) {
    if (
      config.stripePriceIdMonthly === priceId ||
      config.stripePriceIdYearly === priceId
    ) {
      return tier as SubscriptionTier;
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
