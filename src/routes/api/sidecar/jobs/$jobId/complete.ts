import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import {
  completeMetadataJob,
  completeVideoJob,
} from "#/lib/tiktok/tiktok.jobs.server";
import { sidecarCompleteSchema } from "#/lib/tiktok/tiktok.schemas";
import {
  isSidecarAuthorized,
  unauthorizedSidecarResponse,
} from "#/lib/tiktok/tiktok.sidecar-auth.server";

export const Route = createFileRoute("/api/sidecar/jobs/$jobId/complete")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!isSidecarAuthorized(request)) {
          return unauthorizedSidecarResponse();
        }

        const data = sidecarCompleteSchema.parse(await request.json());
        if (data.videos) {
          const result = await completeMetadataJob(db, {
            jobId: params.jobId,
            leaseToken: data.leaseToken,
            videos: data.videos,
          });
          return Response.json(result);
        }

        await completeVideoJob(db, {
          jobId: params.jobId,
          leaseToken: data.leaseToken,
          localPath: data.localPath ?? null,
        });
        return Response.json({ ok: true });
      },
    },
  },
});
