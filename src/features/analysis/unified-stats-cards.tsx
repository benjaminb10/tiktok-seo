import { Eye, Heart, Info, Play, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { PremiumBlur } from "#/components/ui/premium-blur";
import { useQuota } from "#/lib/stripe/quota-context";
import { formatNumber, formatPercent } from "#/features/tiktok/formatters";
import type { UnifiedVideo } from "./types";
import { computeStats } from "./types";

type UnifiedStatsCardsProps = {
  videos: UnifiedVideo[];
  disablePremiumBlur?: boolean;
};

type StatConfig = {
  label: string;
  value: string | number;
  icon: typeof Play;
  tooltip?: string;
  premium?: boolean;
};

export function UnifiedStatsCards({ videos, disablePremiumBlur = false }: UnifiedStatsCardsProps) {
  const stats = computeStats(videos);
  const { quota } = useQuota();
  const isFree = !disablePremiumBlur && (!quota || quota.tier === "free");

  const statConfigs: StatConfig[] = [
    {
      label: "Total videos",
      value: stats.totalVideos,
      icon: Play,
    },
    {
      label: "Total views",
      value: formatNumber(stats.totalViews),
      icon: Eye,
    },
    {
      label: "Avg engagement",
      value: formatPercent(stats.avgEngagement),
      icon: TrendingUp,
      tooltip: "Engagement rate = (Likes + Comments + Reposts) / Views",
      premium: true,
    },
    {
      label: "Total likes",
      value: formatNumber(stats.totalLikes),
      icon: Heart,
      premium: true,
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statConfigs.map((stat) => {
          const isLocked = stat.premium && isFree;

          return (
            <Card key={stat.label} size="sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  {stat.tooltip && (
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center justify-center rounded-md hover:bg-muted p-0.5 transition-colors">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{stat.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <PremiumBlur isLocked={isLocked} label="Unlock">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                </PremiumBlur>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
