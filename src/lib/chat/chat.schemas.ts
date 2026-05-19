import { z } from "zod";

const videoStatsSchema = z.object({
  totalViews: z.number(),
  totalLikes: z.number(),
  totalComments: z.number(),
  avgViews: z.number(),
  avgLikes: z.number(),
  avgEngagement: z.number(),
});

const topVideoSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  viewCount: z.number().nullable(),
  likeCount: z.number().nullable(),
  commentCount: z.number().nullable(),
  repostCount: z.number().nullable(),
  tags: z.array(z.string()),
  publishedAt: z.string().nullable(),
});

const videoContextSchema = z.object({
  handle: z.string(),
  totalVideos: z.number(),
  stats: videoStatsSchema,
  topVideos: z.array(topVideoSchema),
});

const messageHistorySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  context: videoContextSchema,
  history: z.array(messageHistorySchema),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
