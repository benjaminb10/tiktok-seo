import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  isRequestingDownload: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function VideoDialog({
  video,
  isOpen,
  isRequestingDownload,
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
              <p>{videoDownloadMessage(video, isRequestingDownload)}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="link"
                render={
                  <a href={video.webpageUrl} target="_blank" rel="noreferrer" />
                }
              >
                Ouvrir sur TikTok
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function videoDownloadMessage(
  video: RunVideoRow,
  isRequestingDownload: boolean,
): string {
  if (isRequestingDownload || video.videoStatus === "queued") {
    return "La vidéo est ajoutée à la file de récupération.";
  }

  if (video.videoStatus === "downloading") {
    return "La vidéo est en cours de récupération.";
  }

  if (video.videoStatus === "failed") {
    return "La récupération a échoué. Clique sur Voir pour relancer.";
  }

  return "La vidéo va s’afficher ici dès qu’elle sera récupérée.";
}

export function DescriptionAction({ video }: { video: RunVideoRow }) {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" variant="secondary" size="sm" />}
      >
        Description
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Description</DialogTitle>
          <DialogDescription>{video.title ?? video.id}</DialogDescription>
        </DialogHeader>
        <p>{video.description || "Aucune description."}</p>
      </DialogContent>
    </Dialog>
  );
}

export function TranscriptCell({ video }: { video: RunVideoRow }) {
  if (!video.transcriptText) return "Non fourni";

  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" variant="secondary" size="sm" />}
      >
        Lire
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transcript</DialogTitle>
          <DialogDescription>
            Fourni par TikTok, sans analyse audio.
          </DialogDescription>
        </DialogHeader>
        <p>{video.transcriptText}</p>
      </DialogContent>
    </Dialog>
  );
}
