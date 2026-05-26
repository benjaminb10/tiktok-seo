import { Calculator, Hash, Sparkles, DollarSign, Type, AtSign, Download, type LucideIcon } from "lucide-react";

export type Tool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

export const TOOLS: Tool[] = [
  {
    id: "tiktok-video-downloader",
    title: "TikTok Video Downloader",
    description: "Download TikTok videos without watermark. Fast, free, and easy.",
    icon: Download,
    href: "/tools/tiktok-video-downloader",
  },
  {
    id: "tiktok-engagement-calculator",
    title: "TikTok Engagement Calculator",
    description: "Calculate your TikTok engagement rate and compare it to industry benchmarks.",
    icon: Calculator,
    href: "/tools/tiktok-engagement-calculator",
  },
  {
    id: "tiktok-money-calculator",
    title: "TikTok Money Calculator",
    description: "Estimate your TikTok earnings based on views, likes, and engagement.",
    icon: DollarSign,
    href: "/tools/tiktok-money-calculator",
  },
  {
    id: "tiktok-hashtag-extractor",
    title: "TikTok Hashtag Extractor",
    description: "Extract all hashtags from any TikTok caption in one click.",
    icon: Hash,
    href: "/tools/tiktok-hashtag-extractor",
  },
  {
    id: "tiktok-hashtag-generator",
    title: "AI TikTok Hashtag Generator",
    description: "Generate optimized TikTok hashtags for your niche using AI.",
    icon: Sparkles,
    href: "/tools/tiktok-hashtag-generator",
  },
  {
    id: "tiktok-character-counter",
    title: "TikTok Character Counter",
    description: "Count characters for TikTok bio (80), username (24), and captions (4000).",
    icon: Type,
    href: "/tools/tiktok-character-counter",
  },
  {
    id: "tiktok-username-generator",
    title: "TikTok Username Generator",
    description: "Generate creative and unique TikTok username ideas with AI.",
    icon: AtSign,
    href: "/tools/tiktok-username-generator",
  },
];

export const ENGAGEMENT_BENCHMARKS = [
  { min: 0, max: 0.02, label: "Low", color: "text-red-500", bgColor: "bg-red-100", description: "Below average. Focus on creating more engaging content." },
  { min: 0.02, max: 0.05, label: "Average", color: "text-yellow-500", bgColor: "bg-yellow-100", description: "On par with most creators. Room for improvement." },
  { min: 0.05, max: 0.10, label: "Good", color: "text-green-500", bgColor: "bg-green-100", description: "Above average! Your content resonates with your audience." },
  { min: 0.10, max: 1, label: "Viral", color: "text-primary", bgColor: "bg-primary/10", description: "Exceptional! Your content has viral potential." },
] as const;

export function getBenchmark(rate: number) {
  return ENGAGEMENT_BENCHMARKS.find((b) => rate >= b.min && rate < b.max) ?? ENGAGEMENT_BENCHMARKS[0];
}
