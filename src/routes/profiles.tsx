import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Heart, Trash2, TrendingUp, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { LandingFooter } from "#/components/landing-footer";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { formatNumber } from "#/features/tiktok/formatters";
import { deleteProfileFn, getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";
import type { ProfileSummary } from "#/lib/tiktok/tiktok.profiles.server";

export const Route = createFileRoute("/profiles")({
  component: ProfilesPage,
  loader: async () => {
    const profiles = await getAnalyzedProfilesFn();
    return { profiles };
  },
  head: () => ({
    meta: [
      { title: "Discover TikTok Creators | Viewlify.app" },
      {
        name: "description",
        content: "Browse analyzed TikTok creators. View stats, engagement rates, and viral content patterns from thousands of TikTok profiles.",
      },
      { property: "og:title", content: "Discover TikTok Creators | Viewlify.app" },
      {
        property: "og:description",
        content: "Browse analyzed TikTok creators with detailed performance insights",
      },
    ],
  }),
});

function ProfilesPage() {
  const { profiles } = Route.useLoaderData();
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("admin_auth");
      setIsAdmin(auth === "authenticated");
    }
  }, []);

  const handleDeleteProfile = (handle: string) => {
    if (!isAdmin) {
      alert("Admin access required");
      return;
    }

    setProfileToDelete(handle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!profileToDelete) return;

    setIsDeleting(true);
    try {
      const password = "benoudis.benjamin@gmail.com!"; // Auto-fill password for authenticated admin
      const result = await deleteProfileFn({ data: { username: profileToDelete, password } });

      if (result.deleted) {
        setLocalProfiles(localProfiles.filter(p => p.handle !== profileToDelete));
        setDeleteDialogOpen(false);
        setProfileToDelete(null);
      } else {
        alert("Profile not found or already deleted");
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete profile: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/30 py-16">
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
              <span>{localProfiles.length} creators analyzed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          {localProfiles.length === 0 ? (
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
              {localProfiles.map((profile) => (
                <ProfileCard
                  key={profile.handle}
                  profile={profile}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteProfile}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete @{profileToDelete} and all
              associated analyses? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LandingFooter />
    </div>
  );
}

function ProfileCard({
  profile,
  isAdmin,
  onDelete
}: {
  profile: ProfileSummary;
  isAdmin: boolean;
  onDelete: (handle: string) => void;
}) {
  const engagementRate = profile.totalViews > 0
    ? ((profile.totalLikes / profile.totalViews) * 100).toFixed(1)
    : "0";

  return (
    <Card className="transition-all hover:shadow-lg hover:shadow-primary/10 relative">
      <CardContent className="p-6">
        {/* Delete button (admin only) */}
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

        {/* Avatar */}
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

        {/* Handle */}
        <h3 className="mb-1 text-xl font-bold">
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
