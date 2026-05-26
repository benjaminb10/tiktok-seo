import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, TrendingUp, Users, Star, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ClientOnly } from "#/components/client-only";
import { DistributionCards } from "#/features/leaderboard/distribution-cards";
import { StatsLayout } from "#/features/leaderboard/stats-layout";
import { getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "TikTok Creator Leaderboard & Statistics | Viewlify" },
      {
        name: "description",
        content:
          "Explore TikTok creator statistics, rankings, and performance metrics. Compare engagement rates, view counts, and discover rising stars.",
      },
      {
        name: "keywords",
        content:
          "TikTok leaderboard, TikTok creator rankings, TikTok statistics, creator analytics, TikTok metrics",
      },
      { property: "og:title", content: "TikTok Creator Leaderboard & Statistics | Viewlify" },
      {
        property: "og:description",
        content: "Explore TikTok creator statistics, rankings, and performance metrics.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TikTok Creator Leaderboard" },
      {
        name: "twitter:description",
        content: "Explore TikTok creator statistics and rankings.",
      },
    ],
  }),
});

const statsLinks = [
  {
    href: "/stats/engagement",
    icon: TrendingUp,
    title: "Engagement Analysis",
    description: "See how engagement rate correlates with total views across creators",
    color: "text-green-500",
  },
  {
    href: "/stats/views-likes",
    icon: Heart,
    title: "Likes vs Views",
    description: "Explore the relationship between total likes and views",
    color: "text-pink-500",
  },
  {
    href: "/stats/top-creators",
    icon: Users,
    title: "Top Creators",
    description: "Discover the highest performing TikTok creators by views",
    color: "text-blue-500",
  },
  {
    href: "/stats/rising-stars",
    icon: Star,
    title: "Rising Stars",
    description: "Find creators with high engagement and growing audiences",
    color: "text-yellow-500",
  },
];

function LeaderboardPage() {
  const { profiles } = Route.useLoaderData();

  const totalViews = profiles.reduce((sum, p) => sum + p.totalViews, 0);
  const totalLikes = profiles.reduce((sum, p) => sum + p.totalLikes, 0);
  const avgEngagement = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "0";

  return (
    <StatsLayout
      title="TikTok Creator Statistics"
      description={`Live data from ${profiles.length} analyzed creators`}
      currentPage="overview"
    >
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "TikTok Creator Leaderboard",
            description: "Compare TikTok creators by views, engagement rate, and performance metrics.",
            creator: {
              "@type": "Organization",
              name: "Viewlify",
            },
          }),
        }}
      />

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profiles.length}</p>
              <p className="text-sm text-muted-foreground">Creators analyzed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(totalViews / 1_000_000_000).toFixed(1)}B</p>
              <p className="text-sm text-muted-foreground">Total views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgEngagement}%</p>
              <p className="text-sm text-muted-foreground">Avg engagement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Distribution Overview</h2>
        <ClientOnly
          fallback={
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-[180px] animate-pulse rounded-lg bg-muted/50" />
              <div className="h-[180px] animate-pulse rounded-lg bg-muted/50" />
              <div className="h-[180px] animate-pulse rounded-lg bg-muted/50" />
            </div>
          }
        >
          {() => <DistributionCards profiles={profiles} />}
        </ClientOnly>
      </div>

      {/* Stats Links */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Explore Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {statsLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted`}>
                        <Icon className={`h-5 w-5 ${link.color}`} />
                      </div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="flex items-center justify-between">
                      <span>{link.description}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </StatsLayout>
  );
}
