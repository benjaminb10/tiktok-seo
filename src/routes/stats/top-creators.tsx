import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ClientOnly } from "#/components/client-only";
import { LeaderboardBarChart } from "#/features/leaderboard/bar-chart";
import { StatsLayout } from "#/features/leaderboard/stats-layout";
import { RankingTable } from "#/features/leaderboard/ranking-table";
import { getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/stats/top-creators")({
  component: TopCreatorsStatsPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "Top TikTok Creators by Views | Creator Rankings | Viewlify" },
      {
        name: "description",
        content:
          "Discover the top TikTok creators ranked by total views. See the most viewed creators and compare their performance metrics.",
      },
      {
        name: "keywords",
        content:
          "top TikTok creators, most viewed TikTok, TikTok rankings, popular TikTok creators, TikTok influencers",
      },
      { property: "og:title", content: "Top TikTok Creators by Views | Viewlify" },
      {
        property: "og:description",
        content: "Discover the most viewed TikTok creators and their performance metrics.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Top TikTok Creators" },
      {
        name: "twitter:description",
        content: "See the most viewed TikTok creators and compare their stats.",
      },
    ],
  }),
});

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function TopCreatorsStatsPage() {
  const { profiles } = Route.useLoaderData();

  const barChartData = profiles.map((p) => ({
    handle: p.handle,
    avatarUrl: p.avatarUrl,
    value: p.totalViews,
  }));

  const totalViews = profiles.reduce((sum, p) => sum + p.totalViews, 0);
  const sortedByViews = [...profiles].sort((a, b) => b.totalViews - a.totalViews);
  const top10Views = sortedByViews.slice(0, 10).reduce((sum, p) => sum + p.totalViews, 0);
  const top10Percentage = totalViews > 0 ? (top10Views / totalViews) * 100 : 0;

  return (
    <StatsLayout
      title="Top TikTok Creators"
      description="The highest performing creators ranked by total views"
      currentPage="top-creators"
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Top TikTok Creators by Views",
            description: "Discover the most viewed TikTok creators.",
            creator: { "@type": "Organization", name: "Viewlify" },
          }),
        }}
      />

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">#1 Creator</p>
            <p className="text-2xl font-bold">@{sortedByViews[0]?.handle || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Top 10 Share</p>
            <p className="text-2xl font-bold">{top10Percentage.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Creators Ranked</p>
            <p className="text-2xl font-bold">{profiles.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top 10 Creators by Views</CardTitle>
          <CardDescription>
            The ten most viewed TikTok creators in our database. Hover over bars for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnly fallback={<div className="h-[500px] animate-pulse rounded-lg bg-muted/50" />}>
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

      {/* Full Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Creator Rankings</CardTitle>
          <CardDescription>All creators ranked by total views</CardDescription>
        </CardHeader>
        <CardContent>
          <RankingTable data={profiles} sortBy="views" limit={25} />
        </CardContent>
      </Card>
    </StatsLayout>
  );
}
