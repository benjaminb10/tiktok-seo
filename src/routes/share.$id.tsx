import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Heart, Video, TrendingUp, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card } from "#/components/ui/card";
import { LandingFooter } from "#/components/landing-footer";
import { getShareDataFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/share/$id")({
  component: SharePage,
  loader: async ({ params }) => {
    const shareData = await getShareDataFn({ data: { shareId: params.id } });
    return { shareData };
  },
  head: ({ params, loaderData }) => {
    const data = loaderData?.shareData;
    const handle = data?.handle || "TikTok Creator";
    const views = data?.totalViews
      ? data.totalViews >= 1_000_000
        ? `${(data.totalViews / 1_000_000).toFixed(1)}M`
        : data.totalViews >= 1_000
          ? `${(data.totalViews / 1_000).toFixed(1)}K`
          : data.totalViews.toString()
      : "0";

    return {
      meta: [
        { title: `@${handle} TikTok Analysis | Viewlify.app` },
        {
          name: "description",
          content: `See @${handle}'s TikTok analytics: ${views} views, ${data?.totalVideos || 0} videos analyzed with AI insights.`,
        },
        { property: "og:title", content: `@${handle} TikTok Analysis | Viewlify.app` },
        {
          property: "og:description",
          content: `${views} total views, ${data?.avgEngagement?.toFixed(1) || 0}% engagement rate`,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://viewlify.app/share/${params.id}` },
        { property: "og:image", content: `https://viewlify.app/api/og/share/${params.id}` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `https://viewlify.app/api/og/share/${params.id}` },
      ],
    };
  },
});

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function SharePage() {
  const { id } = Route.useParams();
  const { shareData } = Route.useLoaderData();

  if (!shareData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">Analysis not found</h1>
          <p className="mb-8 text-muted-foreground">
            This analysis doesn't exist or hasn't been completed yet.
          </p>
          <Link to="/">
            <Button>Analyze a TikTok profile</Button>
          </Link>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const stats = [
    {
      icon: Video,
      label: "Videos",
      value: formatNumber(shareData.totalVideos),
    },
    {
      icon: Eye,
      label: "Total Views",
      value: formatNumber(shareData.totalViews),
    },
    {
      icon: Heart,
      label: "Total Likes",
      value: formatNumber(shareData.totalLikes),
    },
    {
      icon: TrendingUp,
      label: "Engagement",
      value: `${shareData.avgEngagement.toFixed(1)}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            {shareData.avatarUrl ? (
              <img
                src={shareData.avatarUrl}
                alt={shareData.handle || ""}
                className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-pink-500 to-violet-500 text-2xl font-bold text-white shadow-lg">
                {shareData.handle?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                @{shareData.handle || "Unknown"}
              </h1>
              <p className="mt-1 text-muted-foreground">
                TikTok Analytics by Viewlify.app
              </p>
            </div>

            <div className="flex gap-2">
              <Link to="/app" search={{ input: `@${shareData.handle}` }}>
                <Button className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Full Analysis
                </Button>
              </Link>
              {shareData.handle && (
                <a
                  href={`https://www.tiktok.com/@${shareData.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on TikTok
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
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
        </div>
      </section>

      {/* Top Videos */}
      {shareData.topVideos.length > 0 && (
        <section className="border-t py-8">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-xl font-semibold">Top Performing Videos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shareData.topVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title || ""}
                      className="aspect-[9/16] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[9/16] w-full items-center justify-center bg-muted">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {formatNumber(video.viewCount)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" />
                        {formatNumber(video.likeCount)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            Want to analyze your own TikTok?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Get AI-powered insights, discover viral patterns, and grow your audience.
          </p>
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
