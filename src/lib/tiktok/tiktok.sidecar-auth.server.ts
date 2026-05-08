import { env } from "cloudflare:workers";

export function isSidecarAuthorized(request: Request): boolean {
  const expected = env.SIDECAR_TOKEN;
  if (!expected) return false;

  const authorization = request.headers.get("authorization");
  const sidecarToken = request.headers.get("x-sidecar-token");
  return authorization === `Bearer ${expected}` || sidecarToken === expected;
}

export function unauthorizedSidecarResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
