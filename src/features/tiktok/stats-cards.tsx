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
import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";
import { engagementRate, formatNumber, formatPercent } from "./formatters";

type StatsCardsProps = {
  videos: RunVideoRow[];
};

type StatConfig = {
  label: string;
  value: string | number;
  icon: typeof Play;
  iconBgColor: string;
  iconColor: string;
  sparklineColor: string;
  tooltip?: string;
};

export function StatsCards({ videos }: StatsCardsProps) {
  const totalViews = videos.reduce((sum, v) => sum + (v.viewCount ?? 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likeCount ?? 0), 0);
  const avgEngagement =
    videos.length > 0
      ? videos.reduce((sum, v) => sum + (engagementRate(v) ?? 0), 0) /
        videos.length
      : 0;

  const stats: StatConfig[] = [
    {
      label: "Total videos",
      value: videos.length,
      icon: Play,
      iconBgColor: "bg-pink-100",
      iconColor: "text-pink-500",
      sparklineColor: "stroke-pink-500",
    },
    {
      label: "Total views",
      value: formatNumber(totalViews),
      icon: Eye,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-500",
      sparklineColor: "stroke-blue-500",
    },
    {
      label: "Avg engagement",
      value: formatPercent(avgEngagement),
      icon: TrendingUp,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-500",
      sparklineColor: "stroke-green-500",
      tooltip: "Engagement rate = (Likes + Comments + Reposts) / Views",
    },
    {
      label: "Total likes",
      value: formatNumber(totalLikes),
      icon: Heart,
      iconBgColor: "bg-red-100",
      iconColor: "text-red-500",
      sparklineColor: "stroke-red-500",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                {stat.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full hover:bg-muted p-0.5 transition-colors"
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconBgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <MiniSparkline color={stat.sparklineColor} />
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}

function MiniSparkline({ color }: { color: string }) {
  // Generate simple sparkline data for visual effect
  const points = [30, 45, 35, 50, 42, 55, 48, 60, 52, 65];
  const max = Math.max(...points);
  const normalized = points.map((p) => (p / max) * 30);

  const pathData = normalized
    .map((y, i) => {
      const x = (i / (points.length - 1)) * 100;
      return `${i === 0 ? "M" : "L"} ${x} ${35 - y}`;
    })
    .join(" ");

  return (
    <svg className="h-8 w-full" viewBox="0 0 100 35" preserveAspectRatio="none">
      <path
        d={pathData}
        fill="none"
        className={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
