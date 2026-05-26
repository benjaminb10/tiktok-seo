import { db } from "#/db";
import { user, userUsage } from "#/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  TIER_CONFIG,
  isLimitReached,
  type SubscriptionTier,
} from "./stripe.config";

export type UsageAction = "analysis" | "export" | "aiInsight";

export type UserQuota = {
  tier: SubscriptionTier;
  usage: {
    analyses: { used: number; limit: number };
    exports: { used: number; limit: number };
    aiInsights: { used: number; limit: number };
  };
  periodEnd: Date;
};

export class QuotaExceededError extends Error {
  constructor(
    public action: UsageAction,
    public used: number,
    public limit: number,
  ) {
    super(`Quota exceeded for ${action}: ${used}/${limit}`);
    this.name = "QuotaExceededError";
  }
}

function getMonthPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export async function getUserQuota(userId: string): Promise<UserQuota> {
  // Get user tier
  const [userData] = await db
    .select({ tier: user.tier })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const tier = (userData?.tier || "free") as SubscriptionTier;
  const tierConfig = TIER_CONFIG[tier];
  const { start, end } = getMonthPeriod();

  // Get or create usage record for current period
  const [usage] = await db
    .select()
    .from(userUsage)
    .where(
      and(
        eq(userUsage.userId, userId),
        gte(userUsage.periodStart, start),
        lte(userUsage.periodEnd, end),
      ),
    )
    .limit(1);

  const usageData = usage || {
    analysesUsed: 0,
    exportsUsed: 0,
    aiInsightsUsed: 0,
  };

  return {
    tier,
    usage: {
      analyses: {
        used: usageData.analysesUsed,
        limit: tierConfig.limits.analysesPerMonth,
      },
      exports: {
        used: usageData.exportsUsed,
        limit: tierConfig.limits.exports ? -1 : 0,
      },
      aiInsights: {
        used: usageData.aiInsightsUsed,
        limit: tierConfig.limits.aiInsights,
      },
    },
    periodEnd: end,
  };
}

export async function checkQuota(
  userId: string,
  action: UsageAction,
): Promise<void> {
  const quota = await getUserQuota(userId);
  let used: number;
  let limit: number;

  switch (action) {
    case "analysis":
      used = quota.usage.analyses.used;
      limit = quota.usage.analyses.limit;
      break;
    case "export":
      used = quota.usage.exports.used;
      limit = quota.usage.exports.limit;
      break;
    case "aiInsight":
      used = quota.usage.aiInsights.used;
      limit = quota.usage.aiInsights.limit;
      break;
  }

  if (isLimitReached(used, limit)) {
    throw new QuotaExceededError(action, used, limit);
  }
}

export async function incrementUsage(
  userId: string,
  action: UsageAction,
): Promise<void> {
  const { start, end } = getMonthPeriod();
  const now = new Date();

  // Get existing usage record
  const [existing] = await db
    .select({ id: userUsage.id })
    .from(userUsage)
    .where(
      and(
        eq(userUsage.userId, userId),
        gte(userUsage.periodStart, start),
        lte(userUsage.periodEnd, end),
      ),
    )
    .limit(1);

  const field = {
    analysis: "analysesUsed",
    export: "exportsUsed",
    aiInsight: "aiInsightsUsed",
  }[action] as "analysesUsed" | "exportsUsed" | "aiInsightsUsed";

  if (existing) {
    // Increment existing record
    const [currentUsage] = await db
      .select({ [field]: userUsage[field] })
      .from(userUsage)
      .where(eq(userUsage.id, existing.id))
      .limit(1);

    await db
      .update(userUsage)
      .set({
        [field]: (currentUsage?.[field] || 0) + 1,
        updatedAt: now,
      })
      .where(eq(userUsage.id, existing.id));
  } else {
    // Create new usage record
    await db.insert(userUsage).values({
      id: nanoid(),
      userId,
      periodStart: start,
      periodEnd: end,
      analysesUsed: action === "analysis" ? 1 : 0,
      exportsUsed: action === "export" ? 1 : 0,
      aiInsightsUsed: action === "aiInsight" ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function trackUsage(
  userId: string,
  action: UsageAction,
): Promise<void> {
  await checkQuota(userId, action);
  await incrementUsage(userId, action);
}
