import { ArrowLeft, Eye, ExternalLink, Heart, MessageCircle, TrendingUp, Users, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { ProfileDetail } from "#/lib/tiktok/tiktok.profiles.server";
import { formatNumber } from "#/features/tiktok/formatters";
import { ProfileVideosTable } from "./profile-videos-table";

type PublicProfilePageProps = {
  username: string;
  profileData?: ProfileDetail | null;
};

export function PublicProfilePage({ username, profileData }: PublicProfilePageProps) {
  // If we have profile data, show it
  if (profileData && profileData.videos.length > 0) {
    return <ProfileWithData username={username} data={profileData} />;
  }

  // Otherwise show the coming soon page
  return <ProfileComingSoon username={username} />;
}

function ProfileWithData({ username, data }: { username: string; data: ProfileDetail }) {
  const engagementRate = data.totalViews > 0
    ? ((data.totalLikes / data.totalViews) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back button */}
        <Link to="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        {/* Profile Header */}
        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-pink-50 via-violet-50 to-background p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              {data.avatarUrl ? (
                <img
                  src={data.avatarUrl}
                  alt={`@${username}`}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-2xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="mb-2 text-3xl font-bold">@{username}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>{formatNumber(data.totalVideos)} videos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(data.totalViews)} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(data.totalLikes)} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(data.totalComments)} comments</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={`https://www.tiktok.com/@${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on TikTok
                </Button>
              </a>
              <Link to="/app">
                <Button size="sm">Get deeper insights</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.totalVideos)}</div>
              <p className="text-xs text-muted-foreground">Analyzed videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.totalViews)}</div>
              <p className="text-xs text-muted-foreground">Across all videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.totalLikes)}</div>
              <p className="text-xs text-muted-foreground">Total engagement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{engagementRate}%</div>
              <p className="text-xs text-muted-foreground">Likes / Views ratio</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Videos Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
              {data.videos.slice(0, 6).map((video) => (
                <a
                  key={video.id}
                  href={video.webpageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md"
                >
                  {/* Thumbnail */}
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.description || video.title || "TikTok video"}
                      className="aspect-[9/16] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[9/16] w-full bg-gradient-to-br from-pink-100 to-violet-100" />
                  )}

                  {/* Video stats overlay */}
                  <div className="p-2 bg-background/95">
                    <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(video.viewCount || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(video.likeCount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle>Full Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileVideosTable videos={data.videos} />
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-8 rounded-2xl border bg-gradient-to-r from-pink-500 via-violet-500 to-purple-500 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Want deeper insights?</h2>
          <p className="mb-6 text-white/90">
            Analyze this profile with AI-powered insights, competitor tracking, and more.
          </p>
          <Link to="/app">
            <Button size="lg" variant="secondary">
              Analyze @{username} for free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileComingSoon({ username }: { username: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back button */}
        <Link to="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        {/* Profile Header */}
        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-pink-50 via-violet-50 to-background p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar placeholder */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-2xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="mb-2 text-3xl font-bold">@{username}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>TikTok Creator</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={`https://www.tiktok.com/@${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on TikTok
                </Button>
              </a>
              <Link to="/app">
                <Button size="sm">Analyze this profile</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Coming soon message */}
        <div className="rounded-2xl border bg-muted/30 p-12 text-center">
          <h2 className="mb-4 text-2xl font-bold">Public Profile Analytics Coming Soon</h2>
          <p className="mb-6 text-muted-foreground">
            We're working on bringing you detailed public analytics for @{username}.
            <br />
            For now, you can analyze any profile using our app.
          </p>
          <Link to="/app">
            <Button size="lg">Analyze @{username} now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
