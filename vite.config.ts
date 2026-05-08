import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const DEFAULT_VIDEO_ROOT = "downloads/tiktok-videos";
const LEGACY_PUBLIC_VIDEO_ROOT = "public/tiktok-videos";

export default defineConfig({
  server: {
    watch: {
      ignored: ["**/downloads/**", "**/public/tiktok-videos/**"],
    },
  },
  plugins: [
    localTikTokVideos(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

function localTikTokVideos(): Plugin {
  return {
    name: "local-tiktok-videos",
    configureServer(server) {
      server.middlewares.use("/tiktok-videos", async (request, response) => {
        if (!request.url) {
          response.statusCode = 404;
          response.end("Video indisponible");
          return;
        }

        const decodedPath = safeDecodePath(request.url.split("?")[0] ?? "");
        const videoPath = await findLocalVideoPath(decodedPath);
        if (!videoPath) {
          response.statusCode = 404;
          response.end("Video indisponible");
          return;
        }

        try {
          const fileStat = await stat(videoPath);
          if (!fileStat.isFile()) {
            response.statusCode = 404;
            response.end("Video indisponible");
            return;
          }

          const range = parseRange(request.headers.range, fileStat.size);
          response.setHeader("Accept-Ranges", "bytes");
          response.setHeader("Content-Type", contentTypeForPath(videoPath));
          response.setHeader("Cache-Control", "no-store");

          if (range === "invalid") {
            response.statusCode = 416;
            response.setHeader("Content-Range", `bytes */${fileStat.size}`);
            response.end();
            return;
          }

          if (range) {
            response.statusCode = 206;
            response.setHeader("Content-Length", String(range.end - range.start + 1));
            response.setHeader(
              "Content-Range",
              `bytes ${range.start}-${range.end}/${fileStat.size}`,
            );
            createReadStream(videoPath, {
              start: range.start,
              end: range.end,
            }).pipe(response);
            return;
          }

          response.statusCode = 200;
          response.setHeader("Content-Length", String(fileStat.size));
          createReadStream(videoPath).pipe(response);
        } catch {
          response.statusCode = 404;
          response.end("Video indisponible");
        }
      });
    },
  };
}

async function findLocalVideoPath(decodedPath: string): Promise<string | null> {
  for (const root of localVideoRoots()) {
    const videoPath = path.resolve(root, `.${decodedPath}`);
    if (videoPath === root || !videoPath.startsWith(root + path.sep)) continue;
    if (!isVideoPath(videoPath)) continue;

    try {
      const fileStat = await stat(videoPath);
      if (fileStat.isFile()) return videoPath;
    } catch {
      continue;
    }
  }

  return null;
}

function localVideoRoots(): string[] {
  return unique([
    process.env.VIDEO_ROOT ?? DEFAULT_VIDEO_ROOT,
    DEFAULT_VIDEO_ROOT,
    LEGACY_PUBLIC_VIDEO_ROOT,
  ]).map((root) => path.resolve(process.cwd(), root));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function safeDecodePath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function parseRange(
  value: string | string[] | undefined,
  size: number,
): { start: number; end: number } | "invalid" | null {
  if (Array.isArray(value) || !value) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match) return "invalid";

  const [, startRaw, endRaw] = match;
  if (!startRaw && !endRaw) return "invalid";

  if (!startRaw) {
    const suffixLength = Number(endRaw);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return "invalid";
    return {
      start: Math.max(size - suffixLength, 0),
      end: size - 1,
    };
  }

  const start = Number(startRaw);
  const end = endRaw ? Number(endRaw) : size - 1;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return "invalid";
  }

  return { start, end: Math.min(end, size - 1) };
}

function contentTypeForPath(filePath: string): string {
  if (filePath.endsWith(".webm")) return "video/webm";
  if (filePath.endsWith(".mov")) return "video/quicktime";
  if (filePath.endsWith(".mkv")) return "video/x-matroska";
  return "video/mp4";
}

function isVideoPath(filePath: string): boolean {
  return /\.(mp4|webm|mov|mkv)$/i.test(filePath);
}
