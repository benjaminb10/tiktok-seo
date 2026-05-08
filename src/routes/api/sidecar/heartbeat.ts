import { createFileRoute } from "@tanstack/react-router";
import {
  isSidecarAuthorized,
  unauthorizedSidecarResponse,
} from "#/lib/tiktok/tiktok.sidecar-auth.server";

export const Route = createFileRoute("/api/sidecar/heartbeat")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isSidecarAuthorized(request)) {
          return unauthorizedSidecarResponse();
        }

        return Response.json({ ok: true });
      },
    },
  },
});
