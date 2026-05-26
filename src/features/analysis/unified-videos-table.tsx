import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Lock, Music, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Progress } from "#/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
} from "#/features/tiktok/formatters";
import { VideoLimitBanner } from "#/features/paywall/video-limit-banner";
import { useQuota } from "#/lib/stripe/quota-context";
import type { UnifiedVideo, UnifiedVideoExtended } from "./types";

function engagementRate(video: UnifiedVideo): number | null {
  if (!video.viewCount) return null;
  const interactions =
    (video.likeCount ?? 0) + (video.commentCount ?? 0) + (video.repostCount ?? 0);
  return interactions / video.viewCount;
}

function exportToCSV(videos: UnifiedVideo[], filename: string) {
  const headers = [
    "ID",
    "URL",
    "Description",
    "Views",
    "Engagement",
    "Likes",
    "Date",
    "Comments",
    "Reposts",
    "Duration (s)",
    "Tags",
    "Transcript",
    "Audio",
  ];

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value == null) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = videos.map((video) => {
    const engagement = video.viewCount
      ? ((video.likeCount ?? 0) + (video.commentCount ?? 0) + (video.repostCount ?? 0)) / video.viewCount
      : null;

    return [
      video.id,
      video.webpageUrl,
      video.description || video.title,
      video.viewCount,
      engagement != null ? `${(engagement * 100).toFixed(1)}%` : "",
      video.likeCount,
      video.publishedAt ? formatDate(video.publishedAt) : "",
      video.commentCount,
      video.repostCount,
      video.durationSeconds,
      video.tags.join(", "),
      video.transcriptText,
      [video.audioTrack, video.audioAuthor].filter(Boolean).join(" - "),
    ].map(escapeCSV).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

type UnifiedVideosTableProps<T extends UnifiedVideo> = {
  videos: T[];
  // Optional features for app page
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  onNewAnalysis?: () => void;
  onVideoClick?: (video: T) => void;
  // Configuration
  exportFilename?: string;
  title?: string;
  // Paywall props
  videoLimit?: number;
  onExportBlocked?: () => void;
};

export function UnifiedVideosTable<T extends UnifiedVideo>({
  videos,
  canLoadMore = false,
  onLoadMore,
  onNewAnalysis,
  onVideoClick,
  exportFilename = "viewlify-export.csv",
  title = "Available videos",
  videoLimit,
  onExportBlocked,
}: UnifiedVideosTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { quota, canExport, getVideoLimit } = useQuota();

  // Use prop limit or get from quota context
  const effectiveLimit = videoLimit ?? getVideoLimit();
  const isLimitedView = effectiveLimit !== Infinity && videos.length > effectiveLimit;
  const visibleVideos = isLimitedView ? videos.slice(0, effectiveLimit) : videos;
  const hiddenCount = isLimitedView ? videos.length - effectiveLimit : 0;

  // Export handling with paywall check
  const handleExport = useCallback(() => {
    if (!canExport()) {
      onExportBlocked?.();
      return;
    }
    exportToCSV(visibleVideos, exportFilename);
  }, [canExport, visibleVideos, exportFilename, onExportBlocked]);

  const handleThumbnailClick = useCallback((video: T) => {
    if (onVideoClick) {
      onVideoClick(video);
    } else {
      window.open(video.webpageUrl, "_blank", "noopener,noreferrer");
    }
  }, [onVideoClick]);

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
      {
        id: "thumbnail",
        header: "Video",
        size: 50,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleThumbnailClick(row.original)}
            className="cursor-pointer"
          >
            {row.original.thumbnailUrl ? (
              <img
                src={row.original.thumbnailUrl}
                alt=""
                className="h-12 w-12 rounded object-cover hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="h-12 w-12 rounded bg-muted hover:bg-muted/80 transition-colors" />
            )}
          </button>
        ),
      },
      {
        id: "description",
        header: "Description",
        size: 180,
        cell: ({ row }) => <DescriptionCell video={row.original} />,
      },
      {
        accessorKey: "viewCount",
        header: sortableHeader("Views"),
        cell: ({ row }) => formatNumber(row.original.viewCount),
      },
      {
        id: "engagement",
        header: sortableHeader("Engagement"),
        accessorFn: (row) => engagementRate(row),
        cell: ({ row }) => {
          const rate = engagementRate(row.original);
          const progressValue =
            rate != null ? Math.min((rate / 0.15) * 100, 100) : 0;
          return (
            <div className="flex items-center gap-2 min-w-[100px]">
              <Progress value={progressValue} className="h-2 w-16" />
              <span className="text-sm">{formatPercent(rate)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "likeCount",
        header: sortableHeader("Likes"),
        cell: ({ row }) => formatNumber(row.original.likeCount),
      },
      {
        accessorKey: "publishedAt",
        header: sortableHeader("Date"),
        cell: ({ row }) => formatDate(row.original.publishedAt),
      },
      {
        accessorKey: "commentCount",
        header: sortableHeader("Comments"),
        cell: ({ row }) => formatNumber(row.original.commentCount),
      },
      {
        accessorKey: "repostCount",
        header: sortableHeader("Reposts"),
        cell: ({ row }) => formatNumber(row.original.repostCount),
      },
      {
        id: "transcript",
        header: "Transcript",
        size: 200,
        cell: ({ row }) => <TranscriptCell video={row.original} />,
      },
      {
        accessorKey: "durationSeconds",
        header: sortableHeader("Duration"),
        cell: ({ row }) => formatDuration(row.original.durationSeconds),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        size: 150,
        cell: ({ row }) => {
          const tags = row.original.tags.slice(0, 3);
          if (tags.length === 0) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: "audio",
        header: "Audio",
        size: 200,
        cell: ({ row }) => {
          const audioText = [row.original.audioTrack, row.original.audioAuthor]
            .filter(Boolean)
            .join(" - ");

          if (!audioText) {
            return <span className="text-muted-foreground">-</span>;
          }

          return (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Music className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.original.audioTrack || "Untitled"}</p>
                {row.original.audioAuthor && (
                  <p className="truncate text-xs text-muted-foreground">{row.original.audioAuthor}</p>
                )}
              </div>
            </div>
          );
        },
      },
    ],
    [handleThumbnailClick],
  );

  const table = useReactTable({
    data: visibleVideos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportDisabled = !canExport();

  return (
    <section className="grid gap-4">
      <div className="flex items-center gap-4">
        <h2>
          {title} ({visibleVideos.length}
          {hiddenCount > 0 && (
            <span className="text-muted-foreground"> / {videos.length}</span>
          )}
          )
        </h2>
        {canLoadMore && onLoadMore && (
          <Button type="button" variant="outline" onClick={onLoadMore}>
            Load more videos
          </Button>
        )}
        {videos.length > 0 && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              className={exportDisabled ? "opacity-75" : ""}
            >
              {exportDisabled ? (
                <Lock className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
              {exportDisabled && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Pro
                </Badge>
              )}
            </Button>
            {onNewAnalysis && (
              <Button type="button" variant="outline" onClick={onNewAnalysis}>
                <Plus className="h-4 w-4 mr-2" />
                New analysis
              </Button>
            )}
          </>
        )}
      </div>
      <div className="rounded-md border overflow-auto max-w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={
                      header.column.getSize() !== 150
                        ? { width: header.column.getSize() }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="odd:bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={
                        cell.column.getSize() !== 150
                          ? { width: cell.column.getSize() }
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  No videos yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hiddenCount > 0 && (
        <VideoLimitBanner
          hiddenCount={hiddenCount}
          tier={quota?.tier ?? "free"}
        />
      )}
      {canLoadMore && onLoadMore && !isLimitedView && (
        <div className="flex justify-start">
          <Button type="button" variant="outline" onClick={onLoadMore}>
            Load more videos
          </Button>
        </div>
      )}
    </section>
  );
}

function sortableHeader(label: string) {
  return ({
    column,
  }: {
    column: { toggleSorting: () => void; getIsSorted: () => false | "asc" | "desc" };
  }) => {
    const sorted = column.getIsSorted();
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className={`justify-start px-0 ${sorted ? "text-primary" : ""}`}
      >
        {label}
        {sorted === "asc" ? (
          <ArrowUp className="ml-1 h-4 w-4" />
        ) : sorted === "desc" ? (
          <ArrowDown className="ml-1 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-1 h-4 w-4" />
        )}
      </Button>
    );
  };
}

// Inline DescriptionCell and TranscriptCell to avoid circular dependencies
function DescriptionCell({ video }: { video: UnifiedVideo }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const text = video.description || video.title;

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [text]);

  if (!text) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="w-[180px]">
      <p
        ref={textRef}
        className={`${expanded ? "" : "line-clamp-3"} text-sm leading-snug whitespace-normal`}
      >
        {text}
      </p>
      {(isTruncated || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline mt-1"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function TranscriptCell({ video }: { video: UnifiedVideo }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [video.transcriptText]);

  if (!video.transcriptText) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="w-[280px]">
      <p
        ref={textRef}
        className={`${expanded ? "" : "line-clamp-3"} text-sm leading-snug whitespace-normal`}
      >
        {video.transcriptText}
      </p>
      {(isTruncated || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline mt-1"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
