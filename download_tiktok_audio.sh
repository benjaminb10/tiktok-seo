#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Download audio from an authorized TikTok video, collection, or user profile.

Usage:
  ./download_tiktok_audio.sh <tiktok-url> [options]

Options:
  -o, --output DIR                 Output directory (default: downloads/tiktok-audio)
  -f, --format FORMAT              Audio format: mp3, m4a, opus, wav, flac (default: mp3)
  -n, --max-items N                Limit how many videos to process from a profile
  --cookies FILE                   Use a Netscape cookies.txt file
  --cookies-from-browser BROWSER   Use browser cookies, e.g. chrome, safari, firefox
  --list                           List available entries without downloading
  -h, --help                       Show this help

Examples:
  ./download_tiktok_audio.sh "https://www.tiktok.com/@account" -n 50
  ./download_tiktok_audio.sh "https://www.tiktok.com/@account" -o audio --cookies-from-browser chrome
  ./download_tiktok_audio.sh "https://www.tiktok.com/@account/video/1234567890" -f m4a
USAGE
}

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "Error: yt-dlp is not installed or not in PATH." >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Error: ffmpeg is required to extract/convert audio." >&2
  exit 1
fi

url=""
outdir="downloads/tiktok-audio"
audio_format="mp3"
max_items=""
cookies_file=""
cookies_browser=""
list_only=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--output)
      outdir="${2:-}"
      shift 2
      ;;
    -f|--format)
      audio_format="${2:-}"
      shift 2
      ;;
    -n|--max-items)
      max_items="${2:-}"
      shift 2
      ;;
    --cookies)
      cookies_file="${2:-}"
      shift 2
      ;;
    --cookies-from-browser)
      cookies_browser="${2:-}"
      shift 2
      ;;
    --list)
      list_only=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -n "$url" ]]; then
        echo "Unexpected argument: $1" >&2
        usage >&2
        exit 1
      fi
      url="$1"
      shift
      ;;
  esac
done

if [[ -z "$url" ]]; then
  usage >&2
  exit 1
fi

case "$audio_format" in
  mp3|m4a|opus|wav|flac) ;;
  *)
    echo "Unsupported audio format: $audio_format" >&2
    exit 1
    ;;
esac

mkdir -p "$outdir"

common_args=(
  --ignore-errors
  --continue
  --no-overwrites
  --download-archive "$outdir/.yt-dlp-archive.txt"
  --sleep-requests 1
  --sleep-interval 5
  --max-sleep-interval 12
  --output-na-placeholder "unknown"
)

if [[ -n "$max_items" ]]; then
  common_args+=(--playlist-end "$max_items")
fi

if [[ -n "$cookies_file" ]]; then
  common_args+=(--cookies "$cookies_file")
fi

if [[ -n "$cookies_browser" ]]; then
  common_args+=(--cookies-from-browser "$cookies_browser")
fi

if [[ "$list_only" -eq 1 ]]; then
  yt-dlp \
    "${common_args[@]}" \
    --flat-playlist \
    --simulate \
    --print "%(playlist_index|unknown)s %(id|unknown)s %(webpage_url|unknown)s %(title|unknown)s" \
    "$url"
  exit 0
fi

yt-dlp \
  "${common_args[@]}" \
  --extract-audio \
  --audio-format "$audio_format" \
  --audio-quality 0 \
  -o "$outdir/%(uploader|unknown)s/%(upload_date|unknown)s - %(title).120s [%(id)s].%(ext)s" \
  "$url"
