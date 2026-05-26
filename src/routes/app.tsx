import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TikTokAnalyzerPage } from "#/features/tiktok/tiktok-analyzer-page";

const appSearchSchema = z.object({
  runId: z.string().optional().catch(undefined),
  input: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/app")({
  validateSearch: appSearchSchema,
  component: AppPage,
});

function AppPage() {
  const search = Route.useSearch();
  return <TikTokAnalyzerPage searchRunId={search.runId} initialInput={search.input} />;
}
