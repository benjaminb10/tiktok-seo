import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { failJob } from "#/lib/tiktok/tiktok.jobs.server";
import { sidecarFailSchema } from "#/lib/tiktok/tiktok.schemas";
import {
  isSidecarAuthorized,
  unauthorizedSidecarResponse,
} from "#/lib/tiktok/tiktok.sidecar-auth.server";

export const Route = createFileRoute("/api/sidecar/jobs/$jobId/fail")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!isSidecarAuthorized(request)) {
          return unauthorizedSidecarResponse();
        }

        const data = sidecarFailSchema.parse(await request.json());
        await failJob(db, {
          jobId: params.jobId,
          leaseToken: data.leaseToken,
          error: data.error,
        });
        return Response.json({ ok: true });
      },
    },
  },
});
