import { BarChart3, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "#/components/ui/button";

function AuthButtonsFallback() {
  return (
    <>
      <Link to="/login">
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
      </Link>
      <Link to="/login">
        <Button size="sm">Get started</Button>
      </Link>
    </>
  );
}

function AuthButtons() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<{ user: { name: string; email: string; image: string | null } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Dynamic import to avoid SSR issues
    import("#/lib/auth.client").then(({ authClient }) => {
      authClient.getSession().then((result) => {
        if (result.data) {
          setSession({
            user: {
              name: result.data.user.name,
              email: result.data.user.email,
              image: result.data.user.image ?? null,
            },
          });
        }
        setLoading(false);
      });
    });
  }, []);

  // Server render and initial hydration - must match exactly
  if (!mounted || loading) {
    return <AuthButtonsFallback />;
  }

  if (session) {
    return (
      <>
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            )}
            {session.user.name || session.user.email}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            const { signOut } = await import("#/lib/auth.client");
            await signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </>
    );
  }

  return <AuthButtonsFallback />;
}

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground">Viewlify<span className="text-sm font-medium text-muted-foreground">.app</span></span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/profiles"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Discover
          </Link>
          <Link
            to="/leaderboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Leaderboard
          </Link>
          <Link
            to="/tools"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Free Tools
          </Link>
          <Link
            to="/pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <a
            href="/#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
