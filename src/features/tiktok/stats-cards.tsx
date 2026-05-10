import { Eye, Heart, Play, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";
import { engagementRate, formatNumber, formatPercent } from "./formatters";

type StatsCardsProps = {
  videos: RunVideoRow[];
};

export function StatsCards({ videos }: StatsCardsProps) {
  const totalViews = videos.reduce((sum, v) => sum + (v.viewCount ?? 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likeCount ?? 0), 0);
  const avgEngagement =
    videos.length > 0
      ? videos.reduce((sum, v) => sum + (engagementRate(v) ?? 0), 0) /
        videos.length
      : 0;

  const stats = [
    { label: "Vidéos", value: videos.length, icon: Play },
    { label: "Vues totales", value: formatNumber(totalViews), icon: Eye },
    {
      label: "Engagement moyen",
      value: formatPercent(avgEngagement),
      icon: TrendingUp,
    },
    { label: "Likes totaux", value: formatNumber(totalLikes), icon: Heart },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
