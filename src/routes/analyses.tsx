import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listUserRunsFn } from "#/lib/tiktok/tiktok.functions";
import type { RunStatus } from "#/lib/tiktok/tiktok.types";
import { formatNumber } from "#/features/tiktok/formatters";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Card } from "#/components/ui/card";
import { PlayCircle, Clock, CheckCircle2, XCircle, Ban, Eye, LogIn } from "lucide-react";

type RunRow = {
  id: string;
  input: string;
  normalizedUrl: string;
  kind: "profile" | "video";
  handle: string | null;
  videoId: string | null;
  avatarUrl: string | null;
  status: RunStatus;
  totalDiscovered: number;
  totalSelected: number;
  metadataProcessed: number;
  videoJobsTotal: number;
  videoJobsCompleted: number;
  videoJobsFailed: number;
  error: string | null;
  createdAt: number;
  updatedAt: number;
  totalViews: number;
};

export const Route = createFileRoute("/analyses")({
  component: AnalysesPage,
});

function AnalysesPage() {
  const listUserRuns = useServerFn(listUserRunsFn);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    async function fetchRuns() {
      try {
        const data = await listUserRuns();
        setAuthenticated(data.authenticated);
        setRuns(data.runs);
      } catch (error) {
        console.error("Failed to load runs:", error);
      } finally {
        setLoading(false);
      }
    }
    void fetchRuns();
  }, [listUserRuns]);

  // Auto-refresh when there are running/queued analyses
  useEffect(() => {
    if (!authenticated) return;

    const hasActiveRuns = runs.some(
      (run) => run.status === "running" || run.status === "queued"
    );
    if (!hasActiveRuns) return;

    const interval = setInterval(async () => {
      try {
        const data = await listUserRuns();
        setRuns(data.runs);
      } catch (error) {
        console.error("Failed to refresh runs:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [runs, listUserRuns, authenticated]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading analyses...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Sign in to view your analyses</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create an account or sign in to save your TikTok analyses and access them anytime.
          </p>
          <Link to="/login">
            <Button size="lg">Sign in with Google</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">No analyses yet</h1>
          <p className="text-muted-foreground mb-4">
            Start your first analysis to get started
          </p>
          <Link to="/app">
            <Button>New analysis</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Analyses</h1>
            <p className="text-muted-foreground mt-1">
              History of all your TikTok analyses
            </p>
          </div>
          <Link to="/app">
            <Button size="lg">New analysis</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {runs.map((run) => (
            <Card key={run.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 p-6">
                {/* Avatar */}
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage
                    src={run.avatarUrl || undefined}
                    alt={run.handle || run.input}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-violet-500 text-white text-lg font-semibold">
                    {getInitials(run.handle || run.input)}
                  </AvatarFallback>
                </Avatar>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold truncate">
                          {run.handle || run.input}
                        </h3>
                        <StatusBadge status={run.status} />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(run.createdAt)}</span>
                        </div>

                        {run.kind === "video" && run.videoId && (
                          <div className="flex items-center gap-1">
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span className="truncate">
                              ID: {run.videoId.slice(0, 12)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 items-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {formatNumber(run.totalSelected)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Videos
                        </div>
                      </div>

                      {run.status === "completed" && run.totalSelected > 0 && (
                        <>
                          <div className="h-10 w-px bg-border" />
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                              <Eye className="h-4 w-4" />
                              <span>{formatNumber(run.totalViews)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Views
                            </div>
                          </div>
                        </>
                      )}

                      <div className="h-10 w-px bg-border" />

                      <Link to="/app" search={{ runId: run.id }}>
                        <Button variant="default">
                          View analysis
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RunStatus }) {
  const config: Record<
    RunStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
  > = {
    queued: {
      label: "Queued",
      variant: "secondary",
      icon: <Clock className="h-3 w-3" />,
    },
    running: {
      label: "Running",
      variant: "default",
      icon: <Clock className="h-3 w-3" />,
    },
    completed: {
      label: "Completed",
      variant: "outline",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    failed: {
      label: "Failed",
      variant: "destructive",
      icon: <XCircle className="h-3 w-3" />,
    },
    cancelled: {
      label: "Cancelled",
      variant: "secondary",
      icon: <Ban className="h-3 w-3" />,
    },
  };

  const { label, variant, icon } = config[status];

  return (
    <Badge variant={variant} className="flex w-fit items-center gap-1">
      {icon}
      {label}
    </Badge>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(date);
  }
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^@/, "").trim();
  if (cleaned.length === 0) return "?";

  const words = cleaned.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
}
