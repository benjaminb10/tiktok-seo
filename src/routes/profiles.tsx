import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Eye, Heart, TrendingUp, Video } from "lucide-react";
import { LandingFooter } from "#/components/landing-footer";
import { Card, CardContent } from "#/components/ui/card";
import { formatNumber } from "#/features/tiktok/formatters";
import { getAnalyzedProfiles, type ProfileSummary } from "#/lib/tiktok/tiktok.profiles.server";

const getProfilesFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getAnalyzedProfiles();
});

export const Route = createFileRoute("/profiles")({
  component: ProfilesPage,
  loader: async () => {
    const profiles = await getProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "Discover TikTok Creators | Viewlify.ai" },
      {
        name: "description",
        content: "Browse analyzed TikTok creators. View stats, engagement rates, and viral content patterns from thousands of TikTok profiles.",
      },
      { property: "og:title", content: "Discover TikTok Creators | Viewlify.ai" },
      {
        property: "og:description",
        content: "Browse analyzed TikTok creators with detailed performance insights",
      },
    ],
  }),
});

function ProfilesPage() {
  const { profiles } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-gradient-to-br from-pink-50 via-violet-50 to-background py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Discover TikTok Creators
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Browse analyzed profiles and learn from the best performing creators
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>{profiles.length} creators analyzed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          {profiles.length === 0 ? (
            <div className="rounded-2xl border bg-muted/30 p-12 text-center">
              <h2 className="mb-4 text-2xl font-bold">No profiles yet</h2>
              <p className="mb-6 text-muted-foreground">
                Be the first to analyze a TikTok profile!
              </p>
              <Link to="/app">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Analyze a profile
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profiles.map((profile) => (
                <ProfileCard key={profile.handle} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function ProfileCard({ profile }: { profile: ProfileSummary }) {
  const engagementRate = profile.totalViews > 0
    ? ((profile.totalLikes / profile.totalViews) * 100).toFixed(1)
    : "0";

  return (
    <Link
      to="/profile/$username"
      params={{ username: profile.handle }}
      className="group"
    >
      <Card className="transition-all hover:shadow-lg hover:shadow-primary/10">
        <CardContent className="p-6">
          {/* Avatar */}
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`@${profile.handle}`}
              className="mb-4 h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-2xl font-bold text-white">
              {profile.handle.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Handle */}
          <h3 className="mb-1 text-xl font-bold group-hover:text-primary">
            @{profile.handle}
          </h3>

          {/* Analysis count */}
          <p className="mb-4 text-xs text-muted-foreground">
            Analyzed {profile.analysisCount} time{profile.analysisCount !== 1 ? "s" : ""}
          </p>

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Video className="h-4 w-4" />
                Videos
              </span>
              <span className="font-medium">{formatNumber(profile.totalVideos)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-4 w-4" />
                Views
              </span>
              <span className="font-medium">{formatNumber(profile.totalViews)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Heart className="h-4 w-4" />
                Likes
              </span>
              <span className="font-medium">{formatNumber(profile.totalLikes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Engagement
              </span>
              <span className="font-medium">{engagementRate}%</span>
            </div>
          </div>

          {/* View profile link */}
          <div className="mt-4 pt-4 border-t text-center">
            <span className="text-sm font-medium text-primary group-hover:underline">
              View profile →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
