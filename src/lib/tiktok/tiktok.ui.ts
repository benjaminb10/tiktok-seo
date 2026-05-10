import type { RunDetails, RunVideoRow } from "./tiktok.types";

type VideoStatus = RunDetails["videos"][number]["videoStatus"];

type RunStatusView = {
  title: string;
  description: string;
  isBusy: boolean;
};

export function getRunStatusView(
  details: RunDetails | null,
  requestedRunId?: string | null,
): RunStatusView {
  if (!details) {
    if (requestedRunId) {
      return {
        title: "Chargement des résultats",
        description: "On récupère les vidéos déjà analysées.",
        isBusy: true,
      };
    }

    return {
      title: "Prêt",
      description: "Colle un pseudo ou un lien TikTok pour commencer.",
      isBusy: false,
    };
  }

  if (details.run.status === "queued") {
    return {
      title: "Analyse en cours",
      description: "On prépare la liste des vidéos.",
      isBusy: true,
    };
  }

  if (details.run.status === "running") {
    if (details.videos.length > 0) {
      return {
        title: "Analyse en cours",
        description: `${details.videos.length} vidéos disponibles. L'analyse continue.`,
        isBusy: true,
      };
    }

    return {
      title: "Analyse en cours",
      description: "Les vidéos arrivent automatiquement.",
      isBusy: true,
    };
  }

  if (hasPendingVideoWork(details)) {
    return {
      title: "Récupération en cours",
      description: "Les vidéos se récupèrent. Le tableau se met à jour automatiquement.",
      isBusy: true,
    };
  }

  if (details.run.status === "failed") {
    return {
      title: "Analyse impossible",
      description: "Impossible d'analyser ce compte pour le moment.",
      isBusy: false,
    };
  }

  if (details.run.status === "cancelled") {
    return {
      title: "Analyse annulée",
      description: "L'analyse a été arrêtée.",
      isBusy: false,
    };
  }

  return {
    title: `${details.videos.length} vidéos trouvées`,
    description: "",
    isBusy: false,
  };
}

export function shouldPollRunDetails(
  details: RunDetails | null,
  requestedRunId?: string | null,
): boolean {
  if (!requestedRunId) return false;
  if (!details) return true;
  if (hasPendingVideoWork(details)) return true;
  return details.run.status === "queued" || details.run.status === "running";
}

export function hasPendingVideoWork(details: RunDetails | null): boolean {
  return details?.videos.some((video) =>
    video.videoStatus === "queued" || video.videoStatus === "downloading"
  ) ?? false;
}

export function getVideoStatusLabel(
  status: VideoStatus,
  hasPlayableFile = true,
): string {
  if (status === "downloaded" && !hasPlayableFile) return "À récupérer";

  switch (status) {
    case "idle":
      return "Disponible";
    case "queued":
      return "En attente";
    case "downloading":
      return "Récupération";
    case "downloaded":
      return "Récupérée";
    case "failed":
      return "Erreur";
  }
}

export function getTikTokEmbedUrl(
  video: Pick<RunVideoRow, "id" | "webpageUrl">,
): string | null {
  const match = video.webpageUrl.match(/\/video\/(\d+)/);
  const videoId = match?.[1] ?? (/^\d+$/.test(video.id) ? video.id : null);
  if (!videoId) return null;
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

export function getLocalVideoUrl(
  video: Pick<RunVideoRow, "id" | "localPath" | "videoStatus">,
): string | null {
  if (video.videoStatus !== "downloaded" || !video.localPath) return null;

  const normalizedPath = video.localPath.replaceAll("\\", "/");
  const publicMarker = "/public/";
  const publicIndex = normalizedPath.lastIndexOf(publicMarker);
  if (publicIndex >= 0) {
    return encodePublicPath(
      `/${normalizedPath.slice(publicIndex + publicMarker.length)}`,
    );
  }

  if (normalizedPath.startsWith("public/")) {
    return encodePublicPath(`/${normalizedPath.slice("public/".length)}`);
  }

  const videosMarker = "tiktok-videos/";
  const videosIndex = normalizedPath.lastIndexOf(videosMarker);
  if (videosIndex >= 0) {
    return encodePublicPath(`/${normalizedPath.slice(videosIndex)}`);
  }

  return null;
}

function encodePublicPath(value: string): string {
  return value
    .split("/")
    .map((segment, index) => (index === 0 ? "" : encodeURIComponent(segment)))
    .join("/");
}
