import { Lock, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

type VideoLimitBannerProps = {
  hiddenCount: number;
  tier: string;
  onUpgradeClick?: () => void;
};

export function VideoLimitBanner({
  hiddenCount,
  tier,
  onUpgradeClick,
}: VideoLimitBannerProps) {
  const nextTier = tier === "free" ? "Creator" : tier === "creator" ? "Pro" : null;

  if (!nextTier || hiddenCount <= 0) return null;

  return (
    <div className="my-6 rounded-lg border bg-muted/30 p-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {hiddenCount} more videos available
          </h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to {nextTier} to see all videos and access more detailed analytics.
          </p>
        </div>
        <Button
          asChild
          onClick={onUpgradeClick}
        >
          <Link to="/pricing">
            <Sparkles className="mr-2 h-4 w-4" />
            Unlock with {nextTier}
          </Link>
        </Button>
      </div>
    </div>
  );
}
