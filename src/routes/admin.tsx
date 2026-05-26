import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { desc, eq, sql, count } from "drizzle-orm";
import { db } from "#/db";
import { user, searchRuns, subscriptions } from "#/db/schema";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { checkAdminCredentials } from "#/lib/auth";
import {
  ShieldCheck,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  CreditCard,
  Activity,
} from "lucide-react";

// Server functions for admin data
const getAdminStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  // Get total users
  const totalUsersResult = await db.select({ count: count() }).from(user);
  const totalUsers = totalUsersResult[0]?.count || 0;

  // Get users registered in last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentUsersResult = await db
    .select({ count: count() })
    .from(user)
    .where(sql`${user.createdAt} > ${new Date(sevenDaysAgo)}`);
  const recentUsers = recentUsersResult[0]?.count || 0;

  // Get total analyses
  const totalAnalysesResult = await db.select({ count: count() }).from(searchRuns);
  const totalAnalyses = totalAnalysesResult[0]?.count || 0;

  // Get analyses in last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentAnalysesResult = await db
    .select({ count: count() })
    .from(searchRuns)
    .where(sql`${searchRuns.createdAt} > ${oneDayAgo}`);
  const recentAnalyses = recentAnalysesResult[0]?.count || 0;

  // Get active subscriptions
  const activeSubsResult = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const activeSubscriptions = activeSubsResult[0]?.count || 0;

  // Get running analyses
  const runningAnalysesResult = await db
    .select({ count: count() })
    .from(searchRuns)
    .where(eq(searchRuns.status, "running"));
  const runningAnalyses = runningAnalysesResult[0]?.count || 0;

  return {
    totalUsers,
    recentUsers,
    totalAnalyses,
    recentAnalyses,
    activeSubscriptions,
    runningAnalyses,
  };
});

const getRecentUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(10);

  return users;
});

const getRecentAnalysesFn = createServerFn({ method: "GET" }).handler(async () => {
  const analyses = await db
    .select({
      id: searchRuns.id,
      handle: searchRuns.handle,
      status: searchRuns.status,
      totalDiscovered: searchRuns.totalDiscovered,
      createdAt: searchRuns.createdAt,
      userId: searchRuns.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(searchRuns)
    .leftJoin(user, eq(searchRuns.userId, user.id))
    .orderBy(desc(searchRuns.createdAt))
    .limit(20);

  return analyses;
});

const checkPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const isValid = checkAdminCredentials("admin", data.password);
    return { success: isValid };
  });

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type AdminStats = {
  totalUsers: number;
  recentUsers: number;
  totalAnalyses: number;
  recentAnalyses: number;
  activeSubscriptions: number;
  runningAnalyses: number;
};

type RecentUser = {
  id: string;
  name: string;
  email: string;
  tier: string;
  createdAt: Date;
};

type RecentAnalysis = {
  id: string;
  handle: string | null;
  status: string;
  totalDiscovered: number;
  createdAt: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [statsData, usersData, analysesData] = await Promise.all([
        getAdminStatsFn(),
        getRecentUsersFn(),
        getRecentAnalysesFn(),
      ]);
      setStats(statsData);
      setRecentUsers(usersData as RecentUser[]);
      setRecentAnalyses(analysesData as RecentAnalysis[]);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await checkPasswordFn({ data: { password } });

      if (result.success) {
        localStorage.setItem("admin_auth", "authenticated");
        setIsAuthenticated(true);
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPassword("");
    setStats(null);
    setRecentUsers([]);
    setRecentAnalyses([]);
  };

  const formatDate = (date: Date | number) => {
    const d = typeof date === "number" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "queued":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "agency":
        return "text-purple-600 bg-purple-100";
      case "pro":
        return "text-blue-600 bg-blue-100";
      case "creator":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor users and activity on Viewlify.app
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDashboardData} disabled={loadingData}>
                {loadingData ? "Loading..." : "Refresh"}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    New (7 days)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">+{stats.recentUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Total Analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalAnalyses}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last 24h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.recentAnalyses}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Running
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{stats.runningAnalyses}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Paying
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">{stats.activeSubscriptions}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>Last 10 registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No users yet</p>
                  ) : (
                    recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(u.tier)}`}
                          >
                            {u.tier}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(u.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
                <CardDescription>Last 20 analysis runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentAnalyses.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No analyses yet</p>
                  ) : (
                    recentAnalyses.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            @{a.handle || "unknown"}
                            <span className="text-muted-foreground font-normal ml-1">
                              ({a.totalDiscovered} videos)
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.userName || a.userEmail || "Anonymous"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(a.status)}`}
                          >
                            {a.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(a.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate({ to: "/profiles" })}
            >
              <CardHeader>
                <CardTitle className="text-base">Public Profiles</CardTitle>
                <CardDescription>Manage public profile pages</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate({ to: "/analyses" })}
            >
              <CardHeader>
                <CardTitle className="text-base">All Analyses</CardTitle>
                <CardDescription>View complete analysis history</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate({ to: "/app" })}
            >
              <CardHeader>
                <CardTitle className="text-base">New Analysis</CardTitle>
                <CardDescription>Start a new TikTok analysis</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Enter the admin password to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking..." : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
