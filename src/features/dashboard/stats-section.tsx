import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Eye, Heart, Video, Clock } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card } from "#/components/ui/card";
import { QuotaSummaryCard } from "#/features/paywall/quota-summary-card";
import type { DashboardStats } from "#/lib/tiktok/tiktok.runs.server";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type StatsSectionProps = {
  user: User;
  stats: DashboardStats;
};

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function StatsSection({ user, stats }: StatsSectionProps) {
  const firstName = user.name?.split(" ")[0] || "there";

  const statCards = [
    {
      icon: BarChart3,
      label: "Analyses",
      value: stats.totalAnalyses.toString(),
    },
    {
      icon: Video,
      label: "Videos analyzed",
      value: formatNumber(stats.totalVideos),
    },
    {
      icon: Eye,
      label: "Total views",
      value: formatNumber(stats.totalViews),
    },
    {
      icon: Heart,
      label: "Avg engagement",
      value: `${stats.avgEngagement.toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's your analytics overview
          </p>
        </div>
        <Link to="/app">
          <Button>
            New analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Last Analysis + Quota */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Last Analysis */}
        {stats.lastAnalysis && (
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last analysis
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {stats.lastAnalysis.avatarUrl ? (
                  <img
                    src={stats.lastAnalysis.avatarUrl}
                    alt=""
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {stats.lastAnalysis.handle?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-foreground">
                    @{stats.lastAnalysis.handle || "unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.lastAnalysis.videoCount} videos &middot;{" "}
                    {formatNumber(stats.lastAnalysis.totalViews)} views &middot;{" "}
                    {timeAgo(stats.lastAnalysis.createdAt)}
                  </div>
                </div>
              </div>
              <Link to="/app" search={{ runId: stats.lastAnalysis.id }}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quota Card */}
        <Card className="p-4">
          <div className="mb-3 text-sm text-muted-foreground">Your quota</div>
          <QuotaSummaryCard />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="mb-3 text-sm text-muted-foreground">Quick actions</div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app">
            <Button variant="outline" size="sm">
              New analysis
            </Button>
          </Link>
          <Link to="/analyses">
            <Button variant="outline" size="sm">
              View all analyses
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="outline" size="sm">
              Discover profiles
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
