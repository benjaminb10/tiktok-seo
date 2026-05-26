import type { DashboardStats } from "#/lib/tiktok/tiktok.runs.server";
import { NewAnalysisInput } from "#/features/analysis/new-analysis-input";
import { WelcomeSection } from "./welcome-section";
import { StatsSection } from "./stats-section";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type DashboardPageProps = {
  user: User;
  stats: DashboardStats | null;
};

export function DashboardPage({ user, stats }: DashboardPageProps) {
  const hasAnalyses = stats && stats.totalAnalyses > 0;
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome + New Analysis Input */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-muted-foreground">
                {hasAnalyses ? "Start a new analysis or view your stats below" : "Start your first analysis"}
              </p>
            </div>
            <NewAnalysisInput />
          </div>

          {/* Stats or Welcome Section */}
          {hasAnalyses ? (
            <StatsSection stats={stats} />
          ) : (
            <WelcomeSection user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
