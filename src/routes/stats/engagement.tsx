import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ClientOnly } from "#/components/client-only";
import { LeaderboardScatterChart } from "#/features/leaderboard/scatter-chart";
import { StatsLayout } from "#/features/leaderboard/stats-layout";
import { RankingTable } from "#/features/leaderboard/ranking-table";
import { getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/stats/engagement")({
  component: EngagementStatsPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "TikTok Engagement Rate Analysis | Views vs Engagement | Viewlify" },
      {
        name: "description",
        content:
          "Analyze TikTok engagement rates across creators. See how engagement correlates with total views and discover which creators have the best engagement metrics.",
      },
      {
        name: "keywords",
        content:
          "TikTok engagement rate, TikTok engagement analysis, creator engagement, views vs engagement, TikTok metrics",
      },
      { property: "og:title", content: "TikTok Engagement Rate Analysis | Viewlify" },
      {
        property: "og:description",
        content: "Analyze how TikTok engagement rates correlate with total views.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TikTok Engagement Analysis" },
      {
        name: "twitter:description",
        content: "See how engagement rates correlate with views on TikTok.",
      },
    ],
  }),
});

function EngagementStatsPage() {
  const { profiles } = Route.useLoaderData();

  const enrichedProfiles = profiles.map((p) => ({
    ...p,
    engagementRate: p.totalViews > 0 ? (p.totalLikes / p.totalViews) * 100 : 0,
  }));

  const scatterData = enrichedProfiles
    .filter((p) => p.totalViews > 0)
    .map((p) => ({
      handle: p.handle,
      avatarUrl: p.avatarUrl,
      x: p.totalViews,
      y: p.engagementRate,
    }));

  const avgEngagement =
    profiles.reduce((sum, p) => {
      const rate = p.totalViews > 0 ? (p.totalLikes / p.totalViews) * 100 : 0;
      return sum + rate;
    }, 0) / profiles.length;

  const highEngagementCount = enrichedProfiles.filter((p) => p.engagementRate >= 5).length;

  return (
    <StatsLayout
      title="Engagement Rate Analysis"
      description="How engagement correlates with total views across TikTok creators"
      currentPage="engagement"
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "TikTok Engagement Rate Analysis",
            description: "Analyze how TikTok engagement rates correlate with total views.",
            creator: { "@type": "Organization", name: "Viewlify" },
          }),
        }}
      />

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average Engagement</p>
            <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Engagement (≥5%)</p>
            <p className="text-2xl font-bold">{highEngagementCount} creators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Best Engagement</p>
            <p className="text-2xl font-bold">
              {Math.max(...enrichedProfiles.map((p) => p.engagementRate)).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Creators Analyzed</p>
            <p className="text-2xl font-bold">{profiles.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Views vs Engagement Rate</CardTitle>
          <CardDescription>
            Each point represents a creator. Hover to see details. Higher engagement rates often indicate more engaged audiences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnly fallback={<div className="h-[500px] animate-pulse rounded-lg bg-muted/50" />}>
            {() => (
              <LeaderboardScatterChart
                data={scatterData}
                xLabel="Total Views"
                yLabel="Engagement %"
                yFormatter={(val) => `${val.toFixed(1)}%`}
                height={500}
              />
            )}
          </ClientOnly>
        </CardContent>
      </Card>

      {/* Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Most Engaging Creators</CardTitle>
          <CardDescription>Creators ranked by engagement rate (likes/views)</CardDescription>
        </CardHeader>
        <CardContent>
          <RankingTable data={profiles} sortBy="engagement" limit={15} />
        </CardContent>
      </Card>
    </StatsLayout>
  );
}
