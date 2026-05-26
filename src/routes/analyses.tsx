import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listUserRunsFn } from "#/lib/tiktok/tiktok.functions";
import type { RunStatus } from "#/lib/tiktok/tiktok.types";
import { formatNumber } from "#/features/tiktok/formatters";
import { getAvatarUrl } from "#/features/analysis/types";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { PlayCircle, Clock, CheckCircle2, XCircle, Ban, Eye, Info, Sparkles } from "lucide-react";
import { signIn } from "#/lib/auth.client";
import { useQuota } from "#/lib/stripe/quota-context";
import { TIER_CONFIG } from "#/lib/stripe/stripe.config";

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
  const { quota, getHistoryDays } = useQuota();
  const historyDays = getHistoryDays();
  const isLimitedHistory = historyDays !== Infinity;

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
      <div className="flex h-full items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Sign in to view your analyses</CardTitle>
            <CardDescription>
              Create an account or sign in to save your TikTok analyses and access them anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-3 py-6 text-base"
              onClick={() =>
                signIn.social({
                  provider: "google",
                  callbackURL: "/analyses",
                })
              }
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Secure authentication
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
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

        {isLimitedHistory && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                History limited to the last {historyDays} days.
                {quota?.tier === "free" && " Upgrade to Creator for 90 days of history."}
              </span>
              {quota?.tier === "free" && (
                <Link to="/pricing">
                  <Button variant="outline" size="sm" className="ml-4">
                    <Sparkles className="h-3 w-3 mr-1" />
                    View plans
                  </Button>
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {runs.map((run) => (
            <Card key={run.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 p-6">
                {/* Avatar */}
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage
                    src={run.handle && run.avatarUrl ? getAvatarUrl(run.handle) : undefined}
                    alt={run.handle || run.input}
                  />
                  <AvatarFallback className="bg-primary text-white text-lg font-semibold">
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
