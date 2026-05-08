import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { appendMetadataJobVideos } from "#/lib/tiktok/tiktok.jobs.server";
import { sidecarProgressSchema } from "#/lib/tiktok/tiktok.schemas";
import {
  isSidecarAuthorized,
  unauthorizedSidecarResponse,
} from "#/lib/tiktok/tiktok.sidecar-auth.server";

export const Route = createFileRoute("/api/sidecar/jobs/$jobId/progress")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!isSidecarAuthorized(request)) {
          return unauthorizedSidecarResponse();
        }

        const data = sidecarProgressSchema.parse(await request.json());
        const result = await appendMetadataJobVideos(db, {
          jobId: params.jobId,
          leaseToken: data.leaseToken,
          videos: data.videos,
        });

        return Response.json(result);
      },
    },
  },
});
