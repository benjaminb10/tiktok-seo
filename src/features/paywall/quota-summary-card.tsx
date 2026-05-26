import { Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp, Bot, Crown } from "lucide-react";
import { Progress } from "#/components/ui/progress";
import { Button } from "#/components/ui/button";
import { useQuotaDisplay } from "#/lib/stripe/quota-context";

const TIER_COLORS = {
  free: "text-muted-foreground",
  creator: "text-pink-500",
  pro: "text-violet-500",
  agency: "text-amber-500",
} as const;

const TIER_LABELS = {
  free: "Free",
  creator: "Creator",
  pro: "Pro",
  agency: "Agency",
} as const;

export function QuotaSummaryCard() {
  const quotaDisplay = useQuotaDisplay();

  const analysisPercentage = quotaDisplay.analyses.isUnlimited
    ? 0
    : Math.min(100, (quotaDisplay.analyses.used / quotaDisplay.analyses.limit) * 100);

  const aiPercentage = quotaDisplay.aiInsights.isUnlimited
    ? 0
    : Math.min(100, (quotaDisplay.aiInsights.used / quotaDisplay.aiInsights.limit) * 100);

  const showUpgrade = quotaDisplay.tier === "free" && (analysisPercentage >= 80 || aiPercentage >= 80);
  const isNearLimit = analysisPercentage >= 80 || aiPercentage >= 80;

  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      {/* Tier Badge */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crown className={`h-3.5 w-3.5 ${TIER_COLORS[quotaDisplay.tier]}`} />
          <span className={`text-xs font-medium ${TIER_COLORS[quotaDisplay.tier]}`}>
            {TIER_LABELS[quotaDisplay.tier]}
          </span>
        </div>
        {quotaDisplay.tier !== "free" && (
          <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground">
            Manage
          </Link>
        )}
      </div>

      {/* Quotas */}
      <div className="space-y-2.5">
        {/* Analyses */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Analyses</span>
            </div>
            <span className={`font-medium ${analysisPercentage >= 100 ? "text-red-500" : ""}`}>
              {quotaDisplay.analyses.isUnlimited
                ? "Unlimited"
                : `${quotaDisplay.analyses.used}/${quotaDisplay.analyses.limit}`}
            </span>
          </div>
          {!quotaDisplay.analyses.isUnlimited && (
            <Progress
              value={analysisPercentage}
              className={`h-1.5 ${analysisPercentage >= 80 ? "[&>div]:bg-amber-500" : ""} ${analysisPercentage >= 100 ? "[&>div]:bg-red-500" : ""}`}
            />
          )}
        </div>

        {/* AI Insights */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bot className="h-3 w-3" />
              <span>AI Insights</span>
            </div>
            <span className={`font-medium ${aiPercentage >= 100 ? "text-red-500" : ""}`}>
              {quotaDisplay.aiInsights.isUnlimited
                ? "Unlimited"
                : `${quotaDisplay.aiInsights.used}/${quotaDisplay.aiInsights.limit}`}
            </span>
          </div>
          {!quotaDisplay.aiInsights.isUnlimited && (
            <Progress
              value={aiPercentage}
              className={`h-1.5 ${aiPercentage >= 80 ? "[&>div]:bg-amber-500" : ""} ${aiPercentage >= 100 ? "[&>div]:bg-red-500" : ""}`}
            />
          )}
        </div>
      </div>

      {/* Upgrade CTA */}
      {quotaDisplay.tier === "free" && (
        <Button
          asChild
          variant={showUpgrade ? "default" : "outline"}
          size="sm"
          className={`mt-3 w-full text-xs ${showUpgrade ? "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600" : ""}`}
        >
          <Link to="/pricing">
            <Sparkles className="mr-1 h-3 w-3" />
            {showUpgrade ? "Unlock more" : "View plans"}
          </Link>
        </Button>
      )}
    </div>
  );
}
