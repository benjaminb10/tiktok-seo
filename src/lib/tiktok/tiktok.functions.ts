import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import {
  createDownloadJobs,
  createVideoDownloadJob,
} from "./tiktok.jobs.server";
import { cancelRun, createMetadataRun, getRunDetails } from "./tiktok.runs.server";
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
