import type { JobType } from "../../src/lib/tiktok/tiktok.types";

export type LeasedJob = {
  id: string;
  runId: string;
  type: JobType;
  payload: Record<string, unknown>;
  leaseToken: string;
};

export type SidecarConfig = {
  appUrl: string;
  sidecarToken: string;
  workerId: string;
  concurrency: number;
  metadataLimit: number;
  metadataRoot: string;
  videoRoot: string;
};
