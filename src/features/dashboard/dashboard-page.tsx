import type { DashboardStats } from "#/lib/tiktok/tiktok.runs.server";
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {hasAnalyses ? (
          <StatsSection user={user} stats={stats} />
        ) : (
          <WelcomeSection user={user} />
        )}
      </div>
    </div>
  );
}
