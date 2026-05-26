import { Link } from "@tanstack/react-router";
import { Eye, Heart, Trash2, TrendingUp, Video } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { formatNumber } from "#/features/tiktok/formatters";
import type { ProfileSummary } from "#/lib/tiktok/tiktok.profiles.server";

type ProfileCardProps = {
  profile: ProfileSummary;
  isAdmin: boolean;
  onDelete: (handle: string) => void;
  variant?: "landing" | "app";
};

export function ProfileCard({ profile, isAdmin, onDelete, variant = "landing" }: ProfileCardProps) {
  const engagementRate = profile.totalViews > 0
    ? ((profile.totalLikes / profile.totalViews) * 100).toFixed(1)
    : "0";

  if (variant === "app") {
    return (
      <Card className="transition-all hover:shadow-md relative">
        <CardContent className="p-4">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(profile.handle);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <div className="flex items-start gap-3">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`@${profile.handle}`}
                className="h-12 w-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {profile.handle.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">@{profile.handle}</h3>
              <p className="text-xs text-muted-foreground">
                {profile.analysisCount} analysis{profile.analysisCount !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Video className="h-3.5 w-3.5" />
              <span>{formatNumber(profile.totalVideos)} videos</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span>{formatNumber(profile.totalViews)} views</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              <span>{formatNumber(profile.totalLikes)} likes</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{engagementRate}% eng.</span>
            </div>
          </div>

          <Link
            to="/profile/$username"
            params={{ username: profile.handle }}
            className="mt-3 pt-3 border-t block text-center"
          >
            <span className="text-xs font-medium text-primary hover:underline">
              View profile →
            </span>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Landing variant (larger)
  return (
    <Card className="transition-all hover:shadow-lg hover:shadow-primary/10 relative">
      <CardContent className="p-6">
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(profile.handle);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`@${profile.handle}`}
            className="mb-4 h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {profile.handle.charAt(0).toUpperCase()}
          </div>
        )}

        <h3 className="mb-1 text-xl font-bold">@{profile.handle}</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Analyzed {profile.analysisCount} time{profile.analysisCount !== 1 ? "s" : ""}
        </p>

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

        <Link
          to="/profile/$username"
          params={{ username: profile.handle }}
          className="mt-4 pt-4 border-t block text-center group"
        >
          <span className="text-sm font-medium text-primary group-hover:underline">
            View profile →
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
