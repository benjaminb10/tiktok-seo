import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { StatsLayout } from "#/features/leaderboard/stats-layout";
import { RankingTable } from "#/features/leaderboard/ranking-table";
import { getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/stats/rising-stars")({
  component: RisingStarsStatsPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "Rising TikTok Stars | High Engagement Creators | Viewlify" },
      {
        name: "description",
        content:
          "Discover rising TikTok stars with high engagement rates and growing audiences. Find the next big creators before they blow up.",
      },
      {
        name: "keywords",
        content:
          "rising TikTok stars, new TikTok creators, high engagement TikTok, emerging influencers, TikTok discovery",
      },
      { property: "og:title", content: "Rising TikTok Stars | Viewlify" },
      {
        property: "og:description",
        content: "Discover rising TikTok creators with high engagement and growing audiences.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Rising TikTok Stars" },
      {
        name: "twitter:description",
        content: "Find the next big TikTok creators before they blow up.",
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

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function RisingStarsStatsPage() {
  const { profiles } = Route.useLoaderData();

  const enrichedProfiles = profiles.map((p) => ({
    ...p,
    engagementRate: p.totalViews > 0 ? (p.totalLikes / p.totalViews) * 100 : 0,
  }));

  const medianViews = getMedian(profiles.map((p) => p.totalViews));

  // Rising stars: engagement > 5% AND views < median AND views > 0
  const risingStars = enrichedProfiles
    .filter((p) => p.engagementRate > 5 && p.totalViews < medianViews && p.totalViews > 0)
    .sort((a, b) => b.engagementRate - a.engagementRate);

  // High potential: engagement > 8% regardless of views
  const highPotential = enrichedProfiles
    .filter((p) => p.engagementRate > 8 && p.totalViews > 0)
    .sort((a, b) => b.engagementRate - a.engagementRate);

  const avgRisingEngagement =
    risingStars.length > 0
      ? risingStars.reduce((sum, p) => sum + p.engagementRate, 0) / risingStars.length
      : 0;

  return (
    <StatsLayout
      title="Rising TikTok Stars"
      description="Creators with high engagement rates and growing potential"
      currentPage="rising-stars"
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Rising TikTok Stars",
            description: "Discover rising TikTok creators with high engagement.",
            creator: { "@type": "Organization", name: "Viewlify" },
          }),
        }}
      />

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rising Stars Found</p>
            <p className="text-2xl font-bold">{risingStars.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Engagement</p>
            <p className="text-2xl font-bold">{avgRisingEngagement.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Median Views Threshold</p>
            <p className="text-2xl font-bold">{formatNumber(medianViews)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Potential (≥8%)</p>
            <p className="text-2xl font-bold">{highPotential.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Criteria Explanation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What Makes a Rising Star?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-semibold text-green-600">High Engagement</p>
              <p className="text-sm text-muted-foreground">
                Engagement rate above 5%, meaning their audience is highly active
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-semibold text-blue-600">Growing Audience</p>
              <p className="text-sm text-muted-foreground">
                Views below the median ({formatNumber(medianViews)}), indicating room for growth
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-semibold text-purple-600">Active Content</p>
              <p className="text-sm text-muted-foreground">
                Must have views, showing they're actively creating content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rising Stars Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rising Stars</CardTitle>
          <CardDescription>
            Creators with {">"}5% engagement and views below median, sorted by engagement rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {risingStars.length > 0 ? (
            <RankingTable data={risingStars} sortBy="engagement" limit={20} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No rising stars found with current criteria. Try analyzing more creators!
            </div>
          )}
        </CardContent>
      </Card>

      {/* High Potential Table */}
      <Card>
        <CardHeader>
          <CardTitle>High Potential Creators</CardTitle>
          <CardDescription>
            All creators with engagement rate above 8%, regardless of view count
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highPotential.length > 0 ? (
            <RankingTable data={highPotential} sortBy="engagement" limit={15} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No high potential creators found yet.
            </div>
          )}
        </CardContent>
      </Card>
    </StatsLayout>
  );
}
