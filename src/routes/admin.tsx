import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
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
import { ShieldCheck } from "lucide-react";

const checkPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const isValid = checkAdminCredentials("admin", data.password);
    return { success: isValid };
  });

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated in localStorage
    const auth = localStorage.getItem("admin_auth");
    if (auth === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

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
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage Viewlify.ai content and settings
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Admin Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate({ to: "/profiles" })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Profiles
                </CardTitle>
                <CardDescription>
                  View and manage analyzed TikTok profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browse all analyzed creators and delete profiles if needed
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate({ to: "/analyses" })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Analyses
                </CardTitle>
                <CardDescription>View all analysis runs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See the complete history of all TikTok analyses
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate({ to: "/app" })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  New Analysis
                </CardTitle>
                <CardDescription>Start a new TikTok analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analyze a new TikTok profile or video
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Password Protection:</span> Some
                actions (like deleting profiles) require password confirmation.
              </p>
              <p>
                <span className="font-semibold">Admin Password:</span>{" "}
                benoudis.benjamin@gmail.com!
              </p>
              <p className="text-muted-foreground">
                Your admin session is stored locally in your browser.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-violet-50 to-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500">
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
            <p className="text-center text-xs text-muted-foreground">
              Password: benoudis.benjamin@gmail.com!
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
