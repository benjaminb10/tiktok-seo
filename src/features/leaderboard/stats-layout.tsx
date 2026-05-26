import { Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, TrendingUp, Users, Star, Heart } from "lucide-react";
import { LandingFooter } from "#/components/landing-footer";

type StatsLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  currentPage: "overview" | "engagement" | "views-likes" | "top-creators" | "rising-stars";
};

const statsPages = [
  { id: "overview", label: "Overview", href: "/leaderboard", icon: BarChart3 },
  { id: "engagement", label: "Engagement", href: "/stats/engagement", icon: TrendingUp },
  { id: "views-likes", label: "Likes vs Views", href: "/stats/views-likes", icon: Heart },
  { id: "top-creators", label: "Top Creators", href: "/stats/top-creators", icon: Users },
  { id: "rising-stars", label: "Rising Stars", href: "/stats/rising-stars", icon: Star },
] as const;

export function StatsLayout({ children, title, description, currentPage }: StatsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {currentPage !== "overview" && (
            <Link
              to="/leaderboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leaderboard
            </Link>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
      </section>

      {/* Navigation */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {statsPages.map((page) => {
              const Icon = page.icon;
              const isActive = page.id === currentPage;
              return (
                <Link
                  key={page.id}
                  to={page.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {page.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </div>

      <LandingFooter />
    </div>
  );
}
