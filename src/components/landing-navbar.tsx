import { BarChart3 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Button } from "#/components/ui/button";

const AuthButtons = lazy(() =>
  import("#/components/auth-buttons.client").then((m) => ({ default: m.AuthButtons }))
);

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

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-violet-500">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Viewlify</span>.app
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/profiles"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Discover
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Suspense fallback={<AuthButtonsFallback />}>
            <AuthButtons />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
