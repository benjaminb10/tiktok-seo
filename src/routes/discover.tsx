import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { ProfileCard } from "#/features/profiles/profile-card";
import { deleteProfileFn, getAnalyzedProfilesFn } from "#/lib/tiktok/tiktok.functions";
import type { ProfileSummary } from "#/lib/tiktok/tiktok.profiles.server";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
});

function DiscoverPage() {
  const [localProfiles, setLocalProfiles] = useState<ProfileSummary[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch profiles client-side to avoid conflicts with QuotaProvider
  useEffect(() => {
    getAnalyzedProfilesFn()
      .then((profiles) => {
        setLocalProfiles(profiles);
        setIsLoadingProfiles(false);
      })
      .catch((error) => {
        console.error("Failed to load profiles:", error);
        setIsLoadingProfiles(false);
      });
  }, []);

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
      const password = "benoudis.benjamin@gmail.com!";
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
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Discover
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse analyzed profiles and learn from the best performing creators
        </p>
        {!isLoadingProfiles && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{localProfiles.length} creators analyzed</span>
          </div>
        )}
      </div>

      {/* Profiles Grid */}
      <div className="p-6">
        {isLoadingProfiles ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : localProfiles.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-8 text-center">
            <h2 className="mb-2 text-lg font-semibold">No profiles yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Be the first to analyze a TikTok profile!
            </p>
            <Link to="/app">
              <Button>Analyze a profile</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localProfiles.map((profile) => (
              <ProfileCard
                key={profile.handle}
                profile={profile}
                isAdmin={isAdmin}
                onDelete={handleDeleteProfile}
                variant="app"
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
