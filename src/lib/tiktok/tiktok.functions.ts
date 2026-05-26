import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "#/db";
import { checkAdminCredentials } from "#/lib/auth";
import { getServerSession } from "#/lib/auth.server";
import {
  createDownloadJobs,
  createVideoDownloadJob,
} from "./tiktok.jobs.server";
import {
  cancelRun,
  continueMetadataRun,
  createMetadataRun,
  getRunDetails,
  listAllRuns,
  listUserRuns,
  getDashboardStats,
  getShareData,
  QuotaExceededError,
} from "./tiktok.runs.server";
import {
  getAnalyzedProfiles,
  getProfileDetail,
  deleteProfile,
} from "./tiktok.profiles.server";
import {
  createRunSchema,
  runIdSchema,
  videoDownloadSchema,
} from "./tiktok.schemas";

export type CreateRunResult =
  | { success: true; runId: string; jobId: string }
  | { success: false; error: "QUOTA_EXCEEDED"; used: number; limit: number }
  | { success: false; error: "UNKNOWN"; message: string };

export const createMetadataRunFn = createServerFn({ method: "POST" })
  .inputValidator((input) => createRunSchema.parse(input))
  .handler(async ({ data }): Promise<CreateRunResult> => {
    const session = await getServerSession();
    const userId = session?.user?.id ?? null;

    try {
      const result = await createMetadataRun(db, data.input, userId);
      return { success: true, ...result };
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return {
          success: false,
          error: "QUOTA_EXCEEDED",
          used: error.used,
          limit: error.limit,
        };
      }
      throw error;
    }
  });

export const getRunDetailsFn = createServerFn({ method: "GET" })
  .inputValidator((input) => runIdSchema.parse(input))
  .handler(async ({ data }) => {
    return getRunDetails(db, data.runId);
  });

export const createDownloadJobsFn = createServerFn({ method: "POST" })
  .inputValidator((input) => runIdSchema.parse(input))
  .handler(async ({ data }) => {
    return createDownloadJobs(db, { runId: data.runId });
  });

export const createVideoDownloadJobFn = createServerFn({ method: "POST" })
  .inputValidator((input) => videoDownloadSchema.parse(input))
  .handler(async ({ data }) => {
    return createVideoDownloadJob(db, data);
  });

export const cancelRunFn = createServerFn({ method: "POST" })
  .inputValidator((input) => runIdSchema.parse(input))
  .handler(async ({ data }) => {
    return cancelRun(db, data.runId);
  });

export const continueMetadataRunFn = createServerFn({ method: "POST" })
  .inputValidator((input) => runIdSchema.parse(input))
  .handler(async ({ data }) => {
    return continueMetadataRun(db, data.runId);
  });

export const listAllRunsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return listAllRuns(db);
  },
);

export const listUserRunsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { authenticated: false as const, runs: [] };
    }
    const runs = await listUserRuns(db, session.user.id);
    return { authenticated: true as const, runs };
  },
);

export const getAnalyzedProfilesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getAnalyzedProfiles();
  },
);

const usernameSchema = z.object({
  username: z.string(),
});

export const getProfileDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input) => usernameSchema.parse(input))
  .handler(async ({ data }) => {
    return getProfileDetail(data.username);
  });

const deleteProfileSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const deleteProfileFn = createServerFn({ method: "POST" })
  .inputValidator((input) => deleteProfileSchema.parse(input))
  .handler(async ({ data }) => {
    // Simple password check without sessions
    const isValid = checkAdminCredentials("admin", data.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }
    return deleteProfile(data.username);
  });

export const getDashboardStatsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return null;
    }
    return getDashboardStats(db, session.user.id);
  },
);

const shareIdSchema = z.object({
  shareId: z.string(),
});

export const getShareDataFn = createServerFn({ method: "GET" })
  .inputValidator((input) => shareIdSchema.parse(input))
  .handler(async ({ data }) => {
    return getShareData(db, data.shareId);
  });
