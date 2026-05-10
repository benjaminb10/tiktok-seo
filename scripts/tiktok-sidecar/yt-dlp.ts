import { spawn } from "node:child_process";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  buildMetadataArgs,
  findSubtitlePathForVideo,
  parseVttTranscript,
} from "../../src/lib/tiktok/tiktok.sidecar";
import type { SidecarConfig } from "./types";

export async function collectTikTokMetadata(input: {
  config: SidecarConfig;
  url: string;
  playlistStart?: number;
  onVideo: (video: unknown) => void;
}): Promise<void> {
  await mkdir(input.config.metadataRoot, { recursive: true });
  const outputTemplate = path.join(
    input.config.metadataRoot,
    "%(uploader|playlist|unknown)s",
    "%(upload_date|unknown)s - %(title).120s [%(id)s].%(ext)s",
  );

  await runJsonLines(
    "yt-dlp",
    buildMetadataArgs({
      url: input.url,
      outputTemplate,
      metadataLimit: input.config.metadataLimit,
      playlistStart: input.playlistStart,
    }),
    input.onVideo,
  );
}

export async function downloadTikTokVideo(
  config: SidecarConfig,
  url: string,
): Promise<string | null> {
  await mkdir(config.videoRoot, { recursive: true });
  const archivePath = path.join(config.videoRoot, ".yt-dlp-archive.txt");
  const outputTemplate = path.join(
    config.videoRoot,
    "%(uploader|unknown)s",
    "%(upload_date|unknown)s - %(title).120s [%(id)s].%(ext)s",
  );

  const stdout = await run("yt-dlp", [
    "--ignore-errors",
    "--continue",
    "--no-overwrites",
    "--download-archive",
    archivePath,
    "--merge-output-format",
    "mp4",
    "--output-na-placeholder",
    "unknown",
    "--print",
    "after_move:filepath",
    "-o",
    outputTemplate,
    url,
  ]);

  const downloadedPath =
    stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .at(-1) ?? null;

  if (downloadedPath) return downloadedPath;

  const videoId = readVideoIdFromUrl(url);
  if (!videoId) return null;
  return findDownloadedVideo(config.videoRoot, videoId);
}

export async function enrichMetadataWithLocalSubtitles(
  config: SidecarConfig,
  videos: unknown[],
): Promise<unknown[]> {
  const subtitlePaths = await findSubtitleFiles(config.metadataRoot);
  if (subtitlePaths.length === 0) return videos;

  return Promise.all(
    videos.map(async (video) => {
      const videoId = readMetadataString(video, "id");
      if (!videoId) return video;

      const subtitlePath = findSubtitlePathForVideo(videoId, subtitlePaths);
      if (!subtitlePath) return video;

      const transcript = parseVttTranscript(await readFile(subtitlePath, "utf8"));
      if (!transcript || !isRecord(video)) return video;

      return {
        ...video,
        transcript,
        transcript_source: "subtitle",
        transcript_path: subtitlePath,
      };
    }),
  );
}

async function findDownloadedVideo(
  directory: string,
  videoId: string,
): Promise<string | null> {
  let entries: Array<{
    name: string;
    isDirectory: () => boolean;
    isFile: () => boolean;
  }>;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = await findDownloadedVideo(entryPath, videoId);
      if (found) return found;
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.includes(videoId) &&
      /\.(mp4|webm|mov|mkv)$/i.test(entry.name)
    ) {
      return entryPath;
    }
  }

  return null;
}

async function findSubtitleFiles(directory: string): Promise<string[]> {
  let entries: Array<{
    name: string;
    isDirectory: () => boolean;
    isFile: () => boolean;
  }>;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const subtitlePaths: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      subtitlePaths.push(...(await findSubtitleFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".vtt")) {
      subtitlePaths.push(entryPath);
    }
  }

  return subtitlePaths;
}

function readVideoIdFromUrl(url: string): string | null {
  return /\/video\/(\d+)/.exec(url)?.[1] ?? null;
}

function readMetadataString(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null;
  const item = value[key];
  return typeof item === "string" ? item : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => {
      stderr.push(chunk);
      process.stderr.write(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const output = Buffer.concat(stdout).toString("utf8");
      const error = Buffer.concat(stderr).toString("utf8");
      if (code === 0) {
        resolve(output);
        return;
      }
      reject(new Error(`${command} exited ${code}: ${error}`));
    });
  });
}

function runJsonLines(
  command: string,
  args: string[],
  onJsonLine: (value: unknown) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stderr: Buffer[] = [];
    let stdoutBuffer = "";
    let failed = false;

    const fail = (error: unknown) => {
      if (failed) return;
      failed = true;
      child.kill();
      reject(error);
    };

    const flushLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      onJsonLine(JSON.parse(trimmed) as unknown);
    };

    child.stdout.on("data", (chunk: Buffer) => {
      try {
        stdoutBuffer += chunk.toString("utf8");
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() ?? "";
        for (const line of lines) flushLine(line);
      } catch (error) {
        fail(error);
      }
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr.push(chunk);
      process.stderr.write(chunk);
    });
    child.on("error", fail);
    child.on("close", (code) => {
      if (failed) return;

      try {
        flushLine(stdoutBuffer);
      } catch (error) {
        fail(error);
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      const error = Buffer.concat(stderr).toString("utf8");
      reject(new Error(`${command} exited ${code}: ${error}`));
    });
  });
}
