import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "#/db";
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
} from "./tiktok.runs.server";
import {
  getAnalyzedProfiles,
  getProfileDetail,
} from "./tiktok.profiles.server";
import {
  createRunSchema,
  runIdSchema,
  videoDownloadSchema,
} from "./tiktok.schemas";

export const createMetadataRunFn = createServerFn({ method: "POST" })
  .inputValidator((input) => createRunSchema.parse(input))
  .handler(async ({ data }) => {
    return createMetadataRun(db, data.input);
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
