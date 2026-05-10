import { useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { getLocalVideoUrl } from "#/lib/tiktok/tiktok.ui";
import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";

type VideoActionProps = {
  video: RunVideoRow;
  isRequestingDownload: boolean;
  onView: (video: RunVideoRow) => void;
};

export function VideoAction({
  video,
  isRequestingDownload,
  onView,
}: VideoActionProps) {
  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      disabled={isRequestingDownload}
      onClick={() => onView(video)}
    >
      Voir
    </Button>
  );
}

type VideoDialogProps = {
  video: RunVideoRow | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function VideoDialog({
  video,
  isOpen,
  onOpenChange,
}: VideoDialogProps) {
  const localVideoUrl = video ? getLocalVideoUrl(video) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {video ? (
          <>
            <DialogHeader>
              <DialogTitle>Video TikTok</DialogTitle>
              <DialogDescription>{video.title ?? video.id}</DialogDescription>
            </DialogHeader>
            {localVideoUrl ? (
              <video
                title={video.title ?? `TikTok ${video.id}`}
                src={localVideoUrl}
                className="h-[70vh] w-full"
                controls
                preload="metadata"
              />
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                Vidéo en cours de récupération...
              </p>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function DescriptionCell({ video }: { video: RunVideoRow }) {
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
    <div className="w-[280px]">
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
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}

export function TranscriptCell({ video }: { video: RunVideoRow }) {
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
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
