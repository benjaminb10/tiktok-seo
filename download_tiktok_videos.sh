#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Download several videos from a public or authorized TikTok account.

Usage:
  ./download_tiktok_videos.sh <tiktok-account-url-or-handle> [options]

Options:
  -n, --max-items N                Maximum number of videos to download (default: 5)
  -o, --output DIR                 Output root directory (default: downloads/tiktok-videos)
  --cookies-from-browser BROWSER   Use browser cookies, e.g. chrome, safari, firefox
  --cookies FILE                   Use a Netscape cookies.txt file
  -h, --help                       Show this help

Examples:
  ./download_tiktok_videos.sh "https://www.tiktok.com/@account" -n 5
  ./download_tiktok_videos.sh "@account" -n 3
  ./download_tiktok_videos.sh "account" -n 3 --cookies-from-browser chrome
USAGE
}

die() {
  echo "Error: $*" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    die "$1 is not installed or not in PATH."
  fi
}

is_positive_int() {
  [[ "$1" =~ ^[1-9][0-9]*$ ]]
}

normalize_tiktok_input() {
  local input="$1"
  if [[ "$input" == http://* || "$input" == https://* ]]; then
    printf '%s\n' "$input"
    return
  fi

  input="${input#@}"
  [[ -n "$input" ]] || die "TikTok handle cannot be empty."
  printf 'https://www.tiktok.com/@%s\n' "$input"
}

derive_account_slug() {
  local input="$1"
  local slug=""

  if [[ "$input" =~ tiktok\.com/@([^/?#]+) ]]; then
    slug="${BASH_REMATCH[1]}"
  elif [[ "$input" =~ ^@?([A-Za-z0-9._-]+)$ ]]; then
    slug="${BASH_REMATCH[1]}"
  fi

  if [[ -z "$slug" ]]; then
    slug="unknown-account"
  fi

  printf '%s\n' "$slug" | tr '/ :' '___'
}

input=""
max_items="5"
out_root="downloads/tiktok-videos"
cookies_browser=""
cookies_file=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--max-items)
      [[ $# -ge 2 ]] || die "$1 requires a value."
      max_items="$2"
      shift 2
      ;;
    -o|--output)
      [[ $# -ge 2 ]] || die "$1 requires a value."
      out_root="$2"
      shift 2
      ;;
    --cookies-from-browser)
      [[ $# -ge 2 ]] || die "$1 requires a value."
      cookies_browser="$2"
      shift 2
      ;;
    --cookies)
      [[ $# -ge 2 ]] || die "$1 requires a value."
      cookies_file="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      die "Unknown option: $1"
      ;;
    *)
      if [[ -n "$input" ]]; then
        die "Unexpected argument: $1"
      fi
      input="$1"
      shift
      ;;
  esac
done

[[ -n "$input" ]] || {
  usage >&2
  exit 1
}

is_positive_int "$max_items" || die "--max-items must be a positive integer."

require_command yt-dlp
require_command ffmpeg

url="$(normalize_tiktok_input "$input")"
account_slug="$(derive_account_slug "$input")"
out_dir="$out_root/$account_slug"
archive_file="$out_dir/.yt-dlp-archive.txt"

mkdir -p "$out_dir"

args=(
  --playlist-end "$max_items"
  --write-info-json
  --download-archive "$archive_file"
  --continue
  --ignore-errors
  --no-overwrites
  --sleep-requests 1
  --sleep-interval 2
  --max-sleep-interval 6
  --output-na-placeholder "unknown"
  --merge-output-format mp4
  -o "$out_dir/%(upload_date|unknown)s - %(title).120s [%(id)s].%(ext)s"
)

if [[ -n "$cookies_browser" ]]; then
  args+=(--cookies-from-browser "$cookies_browser")
fi

if [[ -n "$cookies_file" ]]; then
  args+=(--cookies "$cookies_file")
fi

echo "Input: $url"
echo "Output: $out_dir"
echo "Limit: $max_items video(s)"

if ! yt-dlp "${args[@]}" "$url"; then
  die "yt-dlp failed. If the account is public but blocked, retry with --cookies-from-browser chrome/safari/firefox."
fi

video_count="$(
  find "$out_dir" -maxdepth 1 -type f \
    \( -name '*.mp4' -o -name '*.mov' -o -name '*.mkv' -o -name '*.webm' \) \
    | wc -l \
    | tr -d ' '
)"

metadata_count="$(
  find "$out_dir" -maxdepth 1 -type f -name '*.info.json' \
    | wc -l \
    | tr -d ' '
)"

if [[ "$video_count" -eq 0 ]]; then
  die "No videos were downloaded. The account may be empty, unavailable, private, rate-limited, or unsupported."
fi

echo "Done: found $video_count video file(s) and $metadata_count metadata file(s) in $out_dir"
