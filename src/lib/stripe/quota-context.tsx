"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createServerFn } from "@tanstack/react-start";
import { getServerSession } from "#/lib/auth.server";
import { getUserQuota, type UserQuota, type UsageAction } from "./quota.server";
import { TIER_CONFIG, type SubscriptionTier } from "./stripe.config";

// Server function to get user quota
export const getUserQuotaFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { authenticated: false as const, quota: null };
    }
    const quota = await getUserQuota(session.user.id);
    return { authenticated: true as const, quota };
  }
);

// Default quota for non-authenticated users (Free tier limits)
const FREE_TIER_QUOTA: UserQuota = {
  tier: "free" as SubscriptionTier,
  usage: {
    analyses: { used: 0, limit: TIER_CONFIG.free.limits.analysesPerMonth },
    exports: { used: 0, limit: 0 }, // exports disabled for free
    aiInsights: { used: 0, limit: TIER_CONFIG.free.limits.aiInsights },
  },
  periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
};

// Local storage key for anonymous usage tracking
const ANON_USAGE_KEY = "viewlify_anon_usage";

type AnonUsage = {
  analyses: number;
  aiInsights: number;
  month: string; // "YYYY-MM" format to reset monthly
};

function getAnonUsage(): AnonUsage {
  if (typeof window === "undefined") {
    return { analyses: 0, aiInsights: 0, month: "" };
  }
  try {
    const stored = localStorage.getItem(ANON_USAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AnonUsage;
      const currentMonth = new Date().toISOString().slice(0, 7);
      // Reset if new month
      if (data.month !== currentMonth) {
        return { analyses: 0, aiInsights: 0, month: currentMonth };
      }
      return data;
    }
  } catch {
    // Ignore parse errors
  }
  return { analyses: 0, aiInsights: 0, month: new Date().toISOString().slice(0, 7) };
}

function setAnonUsage(usage: AnonUsage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANON_USAGE_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage errors
  }
}

export type QuotaContextValue = {
  quota: UserQuota | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
  canPerformAction: (action: UsageAction) => boolean;
  incrementAnonUsage: (action: "analysis" | "aiInsight") => void;
  getVideoLimit: () => number;
  getHistoryDays: () => number;
  canExport: () => boolean;
};

const QuotaContext = createContext<QuotaContextValue | null>(null);

export function QuotaProvider({ children }: { children: ReactNode }) {
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [anonUsage, setAnonUsageState] = useState<AnonUsage>({
    analyses: 0,
    aiInsights: 0,
    month: ""
  });

  // Load anonymous usage on mount
  useEffect(() => {
    setAnonUsageState(getAnonUsage());
  }, []);

  const fetchQuota = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getUserQuotaFn();
      if (result.authenticated && result.quota) {
        setQuota(result.quota);
        setIsAuthenticated(true);
      } else {
        // Not authenticated - use Free tier with anonymous tracking
        const anon = getAnonUsage();
        setAnonUsageState(anon);
        setQuota({
          ...FREE_TIER_QUOTA,
          usage: {
            analyses: {
              used: anon.analyses,
              limit: TIER_CONFIG.free.limits.analysesPerMonth
            },
            exports: { used: 0, limit: 0 },
            aiInsights: {
              used: anon.aiInsights,
              limit: TIER_CONFIG.free.limits.aiInsights
            },
          },
        });
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to fetch quota:", error);
      // Fallback to free tier on error
      setQuota(FREE_TIER_QUOTA);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const canPerformAction = useCallback(
    (action: UsageAction): boolean => {
      if (!quota) return false;

      const { used, limit } = quota.usage[
        action === "analysis" ? "analyses" :
        action === "export" ? "exports" : "aiInsights"
      ];

      // -1 means unlimited
      if (limit === -1) return true;
      // 0 means disabled (for exports on free tier)
      if (limit === 0) return false;

      return used < limit;
    },
    [quota]
  );

  const incrementAnonUsage = useCallback(
    (action: "analysis" | "aiInsight") => {
      if (isAuthenticated) return; // Only for anonymous users

      const currentMonth = new Date().toISOString().slice(0, 7);
      const newUsage: AnonUsage = {
        ...anonUsage,
        month: currentMonth,
        [action === "analysis" ? "analyses" : "aiInsights"]:
          anonUsage[action === "analysis" ? "analyses" : "aiInsights"] + 1,
      };

      setAnonUsage(newUsage);
      setAnonUsageState(newUsage);

      // Update quota state
      if (quota) {
        setQuota({
          ...quota,
          usage: {
            ...quota.usage,
            [action === "analysis" ? "analyses" : "aiInsights"]: {
              ...quota.usage[action === "analysis" ? "analyses" : "aiInsights"],
              used: newUsage[action === "analysis" ? "analyses" : "aiInsights"],
            },
          },
        });
      }
    },
    [isAuthenticated, anonUsage, quota]
  );

  const getVideoLimit = useCallback((): number => {
    if (!quota) return TIER_CONFIG.free.limits.videosPerAnalysis;
    const limit = TIER_CONFIG[quota.tier].limits.videosPerAnalysis;
    return limit === -1 ? Infinity : limit;
  }, [quota]);

  const getHistoryDays = useCallback((): number => {
    if (!quota) return TIER_CONFIG.free.limits.historyDays;
    const days = TIER_CONFIG[quota.tier].limits.historyDays;
    return days === -1 ? Infinity : days;
  }, [quota]);

  const canExport = useCallback((): boolean => {
    if (!quota) return false;
    return TIER_CONFIG[quota.tier].limits.exports;
  }, [quota]);

  const value: QuotaContextValue = {
    quota,
    isAuthenticated,
    isLoading,
    refetch: fetchQuota,
    canPerformAction,
    incrementAnonUsage,
    getVideoLimit,
    getHistoryDays,
    canExport,
  };

  return (
    <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>
  );
}

// Default values for when no QuotaProvider is present (public pages)
const DEFAULT_QUOTA_VALUE: QuotaContextValue = {
  quota: FREE_TIER_QUOTA,
  isAuthenticated: false,
  isLoading: false,
  refetch: async () => {},
  canPerformAction: () => false,
  incrementAnonUsage: () => {},
  getVideoLimit: () => TIER_CONFIG.free.limits.videosPerAnalysis,
  getHistoryDays: () => TIER_CONFIG.free.limits.historyDays,
  canExport: () => false,
};

export function useQuota(): QuotaContextValue {
  const context = useContext(QuotaContext);
  // Return defaults for public pages without QuotaProvider
  if (!context) {
    return DEFAULT_QUOTA_VALUE;
  }
  return context;
}

// Helper hook to get remaining quota for display
export function useQuotaDisplay() {
  const { quota, isLoading } = useQuota();

  if (isLoading || !quota) {
    return {
      analyses: { used: 0, limit: 1, remaining: 1, isUnlimited: false },
      aiInsights: { used: 0, limit: 1, remaining: 1, isUnlimited: false },
      tier: "free" as SubscriptionTier,
    };
  }

  const analysesLimit = quota.usage.analyses.limit;
  const aiInsightsLimit = quota.usage.aiInsights.limit;

  return {
    analyses: {
      used: quota.usage.analyses.used,
      limit: analysesLimit,
      remaining: analysesLimit === -1 ? Infinity : Math.max(0, analysesLimit - quota.usage.analyses.used),
      isUnlimited: analysesLimit === -1,
    },
    aiInsights: {
      used: quota.usage.aiInsights.used,
      limit: aiInsightsLimit,
      remaining: aiInsightsLimit === -1 ? Infinity : Math.max(0, aiInsightsLimit - quota.usage.aiInsights.used),
      isUnlimited: aiInsightsLimit === -1,
    },
    tier: quota.tier,
  };
}
