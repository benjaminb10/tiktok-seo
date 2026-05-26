// Client-safe configuration - no cloudflare:workers imports here

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

export function isLimitReached(
  used: number,
  limit: number,
): boolean {
  if (limit === -1) return false; // unlimited
  return used >= limit;
}
