import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { leaseJobs } from "#/lib/tiktok/tiktok.jobs.server";
import { sidecarLeaseSchema } from "#/lib/tiktok/tiktok.schemas";
import {
  isSidecarAuthorized,
  unauthorizedSidecarResponse,
} from "#/lib/tiktok/tiktok.sidecar-auth.server";

export const Route = createFileRoute("/api/sidecar/lease")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSidecarAuthorized(request)) {
          return unauthorizedSidecarResponse();
        }

        const data = sidecarLeaseSchema.parse(await request.json());
        const jobs = await leaseJobs(db, data);
        return Response.json({ jobs });
      },
    },
  },
});
