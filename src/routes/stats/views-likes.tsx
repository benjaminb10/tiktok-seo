import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ClientOnly } from "#/components/client-only";
import { LeaderboardScatterChart } from "#/features/leaderboard/scatter-chart";
import { StatsLayout } from "#/features/leaderboard/stats-layout";
import { getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/stats/views-likes")({
  component: ViewsLikesStatsPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "TikTok Likes vs Views Analysis | Creator Performance | Viewlify" },
      {
        name: "description",
        content:
          "Explore the relationship between TikTok likes and views. Understand how views translate to likes across different creators and content types.",
      },
      {
        name: "keywords",
        content:
          "TikTok likes analysis, TikTok views, likes vs views, creator performance, TikTok statistics",
      },
      { property: "og:title", content: "TikTok Likes vs Views Analysis | Viewlify" },
      {
        property: "og:description",
        content: "Explore how TikTok views translate to likes across creators.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TikTok Likes vs Views" },
      {
        name: "twitter:description",
        content: "Understand the relationship between views and likes on TikTok.",
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

function ViewsLikesStatsPage() {
  const { profiles } = Route.useLoaderData();

  const scatterData = profiles
    .filter((p) => p.totalViews > 0 && p.totalLikes > 0)
    .map((p) => ({
      handle: p.handle,
      avatarUrl: p.avatarUrl,
      x: p.totalViews,
      y: p.totalLikes,
    }));

  const totalViews = profiles.reduce((sum, p) => sum + p.totalViews, 0);
  const totalLikes = profiles.reduce((sum, p) => sum + p.totalLikes, 0);
  const avgLikesPerView = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

  const topByViews = [...profiles].sort((a, b) => b.totalViews - a.totalViews)[0];
  const topByLikes = [...profiles].sort((a, b) => b.totalLikes - a.totalLikes)[0];

  return (
    <StatsLayout
      title="Likes vs Views Analysis"
      description="Explore the relationship between total likes and views across TikTok creators"
      currentPage="views-likes"
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "TikTok Likes vs Views Analysis",
            description: "Explore the relationship between TikTok likes and views.",
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
            <p className="text-sm text-muted-foreground">Total Likes</p>
            <p className="text-2xl font-bold">{formatNumber(totalLikes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Like Rate</p>
            <p className="text-2xl font-bold">{avgLikesPerView.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Most Viewed</p>
            <p className="text-2xl font-bold">@{topByViews?.handle || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Likes vs Views (Log Scale)</CardTitle>
          <CardDescription>
            Each point represents a creator. The logarithmic scale helps visualize creators across different size ranges.
            Hover to see details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnly fallback={<div className="h-[500px] animate-pulse rounded-lg bg-muted/50" />}>
            {() => (
              <LeaderboardScatterChart
                data={scatterData}
                xLabel="Total Views"
                yLabel="Total Likes"
                height={500}
                logScale
              />
            )}
          </ClientOnly>
        </CardContent>
      </Card>

      {/* Insight Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Viewed Creator</CardTitle>
          </CardHeader>
          <CardContent>
            {topByViews && (
              <div className="flex items-center gap-4">
                {topByViews.avatarUrl && (
                  <img src={topByViews.avatarUrl} alt="" className="h-12 w-12 rounded-full" />
                )}
                <div>
                  <p className="font-semibold">@{topByViews.handle}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(topByViews.totalViews)} views · {formatNumber(topByViews.totalLikes)} likes
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Liked Creator</CardTitle>
          </CardHeader>
          <CardContent>
            {topByLikes && (
              <div className="flex items-center gap-4">
                {topByLikes.avatarUrl && (
                  <img src={topByLikes.avatarUrl} alt="" className="h-12 w-12 rounded-full" />
                )}
                <div>
                  <p className="font-semibold">@{topByLikes.handle}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(topByLikes.totalLikes)} likes · {formatNumber(topByLikes.totalViews)} views
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StatsLayout>
  );
}
