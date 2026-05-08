export const DEFAULT_METADATA_LIMIT = 100;

export function readMetadataLimit(value: string | undefined): number {
  if (!value) return DEFAULT_METADATA_LIMIT;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_METADATA_LIMIT;
  return Math.max(1, Math.min(DEFAULT_METADATA_LIMIT, parsed));
}

export function buildMetadataArgs(input: {
  url: string;
  outputTemplate: string;
  metadataLimit: number;
}): string[] {
  return [
    "--skip-download",
    "--no-simulate",
    "--write-info-json",
    "--write-subs",
    "--write-auto-subs",
    "--sub-langs",
    "all",
    "--sub-format",
    "vtt",
    "--dump-json",
    "--ignore-errors",
    "--no-warnings",
    "--socket-timeout",
    "30",
    "--retries",
    "3",
    "--extractor-retries",
    "3",
    "--playlist-end",
    String(input.metadataLimit),
    "--output-na-placeholder",
    "unknown",
    "-o",
    input.outputTemplate,
    input.url,
  ];
}

export function parseVttTranscript(content: string): string | null {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const parts: string[] = [];
  let skipBlock = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";

    if (!line) {
      skipBlock = false;
      continue;
    }

    if (skipBlock) continue;
    if (index === 0 && line.startsWith("WEBVTT")) continue;
    if (/^(Kind|Language):/i.test(line)) continue;

    if (/^(NOTE|STYLE|REGION)(\s|$)/i.test(line)) {
      skipBlock = true;
      continue;
    }

    if (line.includes("-->")) continue;
    if (/^\d+$/.test(line) && (lines[index + 1] ?? "").includes("-->")) {
      continue;
    }

    const text = cleanVttTextLine(line);
    if (text && text !== parts.at(-1)) {
      parts.push(text);
    }
  }

  return normalizeTranscript(parts.join(" "));
}

export function findSubtitlePathForVideo(
  videoId: string,
  subtitlePaths: string[],
): string | null {
  const matchingPaths = subtitlePaths.filter((subtitlePath) =>
    isSubtitlePathForVideo(videoId, subtitlePath)
  );

  matchingPaths.sort((left, right) => {
    const byScore = subtitleLanguageScore(left) - subtitleLanguageScore(right);
    if (byScore !== 0) return byScore;
    return left.localeCompare(right);
  });

  return matchingPaths[0] ?? null;
}

function isSubtitlePathForVideo(videoId: string, subtitlePath: string): boolean {
  const name = basename(subtitlePath);
  return (
    name.endsWith(".vtt") &&
    (name.includes(`[${videoId}]`) ||
      name.startsWith(`${videoId}.`) ||
      name.includes(`${videoId}.`))
  );
}

function subtitleLanguageScore(subtitlePath: string): number {
  const name = basename(subtitlePath).toLowerCase();
  if (/\.(fra-fr|fr-fr|fra|fr)\.vtt$/.test(name)) return 0;
  if (/\.(eng-us|en-us|eng|en)\.vtt$/.test(name)) return 1;
  return 2;
}

function cleanVttTextLine(line: string): string {
  return decodeHtmlEntities(
    line
      .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function normalizeTranscript(value: string): string | null {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized : null;
}

function basename(value: string): string {
  return value.split(/[\\/]/).at(-1) ?? value;
}
