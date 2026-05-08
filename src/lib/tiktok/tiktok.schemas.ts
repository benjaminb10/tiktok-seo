import { z } from "zod";

export const createRunSchema = z.object({
  input: z.string().trim().min(1).max(300),
});

export const runIdSchema = z.object({
  runId: z.string().min(1).max(64),
});

export const videoDownloadSchema = z.object({
  runId: z.string().min(1).max(64),
  videoId: z.string().min(1).max(120),
});

export const sidecarLeaseSchema = z.object({
  workerId: z.string().trim().min(1).max(120),
  limit: z.number().int().min(1).max(5).default(5),
});

export const sidecarCompleteSchema = z.object({
  leaseToken: z.string().min(1),
  videos: z.array(z.unknown()).optional(),
  localPath: z.string().nullable().optional(),
});

export const sidecarProgressSchema = z.object({
  leaseToken: z.string().min(1),
  videos: z.array(z.unknown()).min(1).max(10),
});

export const sidecarFailSchema = z.object({
  leaseToken: z.string().min(1),
  error: z.string().trim().min(1).max(4000),
});
