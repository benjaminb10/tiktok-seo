export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type VideoStats = {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViews: number;
  avgLikes: number;
  avgEngagement: number;
};

export type TopVideo = {
  title: string | null;
  description: string | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  repostCount: number | null;
  tags: string[];
  publishedAt: string | null;
};

export type VideoContext = {
  handle: string;
  totalVideos: number;
  stats: VideoStats;
  topVideos: TopVideo[];
};

export type ChatRequest = {
  message: string;
  context: VideoContext;
  history: Array<{ role: "user" | "assistant"; content: string }>;
};

export type ChatResponse = {
  message: string;
};
