import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TikTokAnalyzerPage } from "#/features/tiktok/tiktok-analyzer-page";

const homeSearchSchema = z.object({
  runId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: homeSearchSchema,
  component: HomePage,
});

function HomePage() {
  const search = Route.useSearch();
  return <TikTokAnalyzerPage searchRunId={search.runId} />;
}
