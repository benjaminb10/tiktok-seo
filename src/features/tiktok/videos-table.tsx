import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { ScrollArea, ScrollBar } from "#/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { getLocalVideoUrl, getVideoStatusLabel } from "#/lib/tiktok/tiktok.ui";
import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";
import {
  engagementRate,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatProvidedNumber,
} from "./formatters";
import {
  DescriptionAction,
  TranscriptCell,
  VideoAction,
  VideoDialog,
} from "./video-dialogs";

type VideosTableProps = {
  videos: RunVideoRow[];
  queueingVideoIds: Set<string>;
  onRequestVideoDownload: (video: RunVideoRow) => Promise<void>;
};

export function VideosTable({
  videos,
  queueingVideoIds,
  onRequestVideoDownload,
}: VideosTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const selectedVideo =
    videos.find((video) => video.id === selectedVideoId) ?? null;

  const handleViewVideo = useCallback((video: RunVideoRow) => {
    setSelectedVideoId(video.id);
    void onRequestVideoDownload(video);
  }, [onRequestVideoDownload]);

  const columns = useMemo<ColumnDef<RunVideoRow>[]>(
    () => [
      {
        id: "status",
        header: "Etat",
        cell: ({ row }) =>
          getVideoStatusLabel(
            row.original.videoStatus,
            Boolean(getLocalVideoUrl(row.original)),
          ),
      },
      {
        id: "video",
        header: "Video",
        cell: ({ row }) => row.original.title ?? row.original.id,
      },
      {
        id: "link",
        header: "Lien",
        cell: ({ row }) => (
          <VideoAction
            video={row.original}
            isRequestingDownload={queueingVideoIds.has(row.original.id)}
            onView={handleViewVideo}
          />
        ),
      },
      {
        accessorKey: "publishedAt",
        header: sortableHeader("Date"),
        cell: ({ row }) => formatDate(row.original.publishedAt),
      },
      {
        accessorKey: "viewCount",
        header: sortableHeader("Vues"),
        cell: ({ row }) => formatNumber(row.original.viewCount),
      },
      {
        accessorKey: "likeCount",
        header: sortableHeader("Likes"),
        cell: ({ row }) => formatNumber(row.original.likeCount),
      },
      {
        accessorKey: "favoriteCount",
        header: sortableHeader("Favoris"),
        cell: ({ row }) => formatProvidedNumber(row.original.favoriteCount),
      },
      {
        accessorKey: "repostCount",
        header: sortableHeader("Reposts"),
        cell: ({ row }) => formatNumber(row.original.repostCount),
      },
      {
        accessorKey: "commentCount",
        header: sortableHeader("Com."),
        cell: ({ row }) => formatNumber(row.original.commentCount),
      },
      {
        accessorKey: "durationSeconds",
        header: sortableHeader("Duree"),
        cell: ({ row }) => formatDuration(row.original.durationSeconds),
      },
      {
        id: "engagement",
        header: sortableHeader("Eng."),
        accessorFn: (row) => engagementRate(row),
        cell: ({ row }) => formatPercent(engagementRate(row.original)),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => row.original.tags.slice(0, 4).join(", ") || "-",
      },
      {
        id: "audio",
        header: "Audio",
        cell: ({ row }) =>
          [row.original.audioTrack, row.original.audioAuthor]
            .filter(Boolean)
            .join(" - ") || "-",
      },
      {
        id: "transcript",
        header: "Transcript",
        cell: ({ row }) => <TranscriptCell video={row.original} />,
      },
      {
        id: "details",
        header: "Details",
        cell: ({ row }) => <DescriptionAction video={row.original} />,
      },
    ],
    [handleViewVideo, queueingVideoIds],
  );

  const table = useReactTable({
    data: videos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <section className="grid gap-4">
        <h2>Vidéos disponibles ({videos.length})</h2>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    Aucune video pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
      <VideoDialog
        video={selectedVideo}
        isOpen={selectedVideo !== null}
        isRequestingDownload={
          selectedVideo ? queueingVideoIds.has(selectedVideo.id) : false
        }
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedVideoId(null);
        }}
      />
    </>
  );
}

function sortableHeader(label: string) {
  return ({ column }: { column: { toggleSorting: () => void } }) => (
    <Button type="button" variant="ghost" onClick={() => column.toggleSorting()}>
      {label}
      <ArrowUpDown />
    </Button>
  );
}
