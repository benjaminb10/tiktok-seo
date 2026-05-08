import { createHash } from "node:crypto";
import { readMetadataLimit } from "../../src/lib/tiktok/tiktok.sidecar";
import type { SidecarConfig } from "./types";

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_VIDEO_ROOT = "downloads/tiktok-videos";

export function readSidecarConfig(
  env = process.env,
  cwd = process.cwd(),
): SidecarConfig {
  return {
    appUrl: env.APP_URL ?? "http://localhost:3000",
    sidecarToken: env.SIDECAR_TOKEN ?? "dev-sidecar-token",
    workerId: env.WORKER_ID ?? defaultWorkerId(cwd),
    concurrency: readConcurrency(env.SIDECAR_CONCURRENCY),
    metadataLimit: readMetadataLimit(env.METADATA_LIMIT),
    metadataRoot: env.METADATA_ROOT ?? "downloads/tiktok-metadata",
    videoRoot: env.VIDEO_ROOT ?? DEFAULT_VIDEO_ROOT,
  };
}

function defaultWorkerId(cwd: string): string {
  const hash = createHash("sha1").update(cwd).digest("hex").slice(0, 8);
  return `sidecar-${hash}`;
}

function readConcurrency(value: string | undefined): number {
  if (!value) return DEFAULT_CONCURRENCY;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_CONCURRENCY;
  return Math.max(1, Math.min(10, parsed));
}
