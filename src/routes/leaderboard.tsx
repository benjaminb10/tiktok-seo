import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { LandingFooter } from "#/components/landing-footer";
import { ClientOnly } from "#/components/client-only";
import { LeaderboardScatterChart } from "#/features/leaderboard/scatter-chart";
import { LeaderboardBarChart } from "#/features/leaderboard/bar-chart";
import { DistributionCards } from "#/features/leaderboard/distribution-cards";
import { RankingTable } from "#/features/leaderboard/ranking-table";
import { getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";
import type { ProfileSummary } from "#/lib/tiktok/tiktok.profiles.server";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "TikTok Creator Leaderboard | Viewlify" },
      {
        name: "description",
        content:
          "Compare TikTok creators by views, engagement rate, and performance metrics. See who's leading the pack.",
      },
      {
        name: "keywords",
        content:
          "TikTok leaderboard, TikTok creators ranking, TikTok analytics, creator statistics, engagement comparison",
      },
      { property: "og:title", content: "TikTok Creator Leaderboard | Viewlify" },
      {
        property: "og:description",
        content: "Compare TikTok creators by views, engagement, and performance metrics.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TikTok Creator Leaderboard" },
      {
        name: "twitter:description",
        content: "See how TikTok creators compare on views, engagement, and more.",
      },
    ],
  }),
});

function getMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function LeaderboardPage() {
  const { profiles } = Route.useLoaderData();

  // Enrich profiles with calculated metrics
  const enrichedProfiles = profiles.map((p) => ({
    ...p,
    engagementRate: p.totalViews > 0 ? (p.totalLikes / p.totalViews) * 100 : 0,
    avgViewsPerVideo: p.totalVideos > 0 ? p.totalViews / p.totalVideos : 0,
  }));

  // Calculate rising stars (high engagement, lower views)
  const medianViews = getMedian(profiles.map((p) => p.totalViews));
  const risingStars = enrichedProfiles
    .filter((p) => p.engagementRate > 5 && p.totalViews < medianViews && p.totalViews > 0)
    .sort((a, b) => b.engagementRate - a.engagementRate);

  // Prepare scatter chart data
  const scatterViewsEngagement = enrichedProfiles
    .filter((p) => p.totalViews > 0)
    .map((p) => ({
      handle: p.handle,
      avatarUrl: p.avatarUrl,
      x: p.totalViews,
      y: p.engagementRate,
    }));

  const scatterLikesViews = enrichedProfiles
    .filter((p) => p.totalViews > 0)
    .map((p) => ({
      handle: p.handle,
      avatarUrl: p.avatarUrl,
      x: p.totalViews,
      y: p.totalLikes,
    }));

  // Prepare bar chart data
  const barChartData = profiles.map((p) => ({
    handle: p.handle,
    avatarUrl: p.avatarUrl,
    value: p.totalViews,
  }));

  // Calculate total stats
  const totalViews = profiles.reduce((sum, p) => sum + p.totalViews, 0);
  const totalLikes = profiles.reduce((sum, p) => sum + p.totalLikes, 0);
  const avgEngagement =
    totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "TikTok Creator Leaderboard",
            description:
              "Compare TikTok creators by views, engagement rate, and performance metrics.",
            creator: {
              "@type": "Organization",
              name: "Viewlify",
            },
          }),
        }}
      />

      {/* Header */}
      <section className="border-b bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            TikTok Creator Statistics
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Live data from {profiles.length} analyzed creators
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{profiles.length} creators</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>{(totalViews / 1_000_000).toFixed(1)}M total views</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>{avgEngagement}% avg engagement</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
        {/* Distribution Cards */}
        <ClientOnly fallback={<div className="grid gap-4 md:grid-cols-3"><div className="h-[180px] bg-muted/50 rounded-lg animate-pulse" /><div className="h-[180px] bg-muted/50 rounded-lg animate-pulse" /><div className="h-[180px] bg-muted/50 rounded-lg animate-pulse" /></div>}>
          {() => <DistributionCards profiles={profiles} />}
        </ClientOnly>

        {/* Scatter: Views vs Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Views vs Engagement Rate</CardTitle>
            <CardDescription>
              How engagement correlates with total views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientOnly fallback={<div className="h-[400px] bg-muted/50 rounded-lg animate-pulse" />}>
              {() => (
                <LeaderboardScatterChart
                  data={scatterViewsEngagement}
                  xLabel="Total Views"
                  yLabel="Engagement %"
                  yFormatter={(val) => `${val.toFixed(1)}%`}
                />
              )}
            </ClientOnly>
          </CardContent>
        </Card>

        {/* Scatter: Likes vs Views */}
        <Card>
          <CardHeader>
            <CardTitle>Likes vs Views</CardTitle>
            <CardDescription>
              Relationship between total likes and views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientOnly fallback={<div className="h-[400px] bg-muted/50 rounded-lg animate-pulse" />}>
              {() => (
                <LeaderboardScatterChart
                  data={scatterLikesViews}
                  xLabel="Total Views"
                  yLabel="Total Likes"
                />
              )}
            </ClientOnly>
          </CardContent>
        </Card>

        {/* Bar: Top Creators by Views */}
        <Card>
          <CardHeader>
            <CardTitle>Top Creators by Views</CardTitle>
            <CardDescription>
              Highest performing creators by total views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientOnly fallback={<div className="h-[500px] bg-muted/50 rounded-lg animate-pulse" />}>
              {() => (
                <LeaderboardBarChart
                  data={barChartData}
                  valueLabel="Total Views"
                  limit={10}
                />
              )}
            </ClientOnly>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Table: Most Engaging */}
          <Card>
            <CardHeader>
              <CardTitle>Most Engaging Creators</CardTitle>
              <CardDescription>Ranked by engagement rate</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingTable data={profiles} sortBy="engagement" limit={10} />
            </CardContent>
          </Card>

          {/* Table: Rising Stars */}
          <Card>
            <CardHeader>
              <CardTitle>Rising Stars</CardTitle>
              <CardDescription>
                High engagement with growing audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {risingStars.length > 0 ? (
                <RankingTable data={risingStars} sortBy="engagement" limit={10} />
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Not enough data for rising stars
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table: Top by Views */}
        <Card>
          <CardHeader>
            <CardTitle>Full Leaderboard</CardTitle>
            <CardDescription>All creators ranked by total views</CardDescription>
          </CardHeader>
          <CardContent>
            <RankingTable data={profiles} sortBy="views" limit={20} />
          </CardContent>
        </Card>
      </div>

      <LandingFooter />
    </div>
  );
}
