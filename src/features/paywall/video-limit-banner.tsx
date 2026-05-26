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
    <div className="relative my-6 overflow-hidden rounded-xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 via-violet-500/5 to-pink-500/5 p-6">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-violet-500/10 opacity-50" />
      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white">
          <Lock className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {hiddenCount} more videos available
          </h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to {nextTier} to see all videos and access more detailed analytics.
          </p>
        </div>
        <Button
          asChild
          className="shrink-0 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
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
