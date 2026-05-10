import { describe, expect, it } from "vitest";
import {
  getRunStatusView,
  getLocalVideoUrl,
  getTikTokEmbedUrl,
  getVideoStatusLabel,
  shouldPollRunDetails,
} from "./tiktok.ui";
import type { RunDetails } from "./tiktok.types";

describe("getRunStatusView", () => {
  it("explique l'etat initial", () => {
    expect(getRunStatusView(null, null)).toMatchObject({
      title: "Prêt",
      isBusy: false,
    });
  });

  it("reste comprehensible quand une analyse existante charge", () => {
    const view = getRunStatusView(null, "run_123");

    expect(view.title).toBe("Chargement des résultats");
    expect(view.description).not.toContain("run_123");
    expect(view.isBusy).toBe(true);
  });

  it("masque les details techniques quand une analyse attend", () => {
    const view = getRunStatusView(makeRunDetails("queued"));

    expect(view.title).toBe("Analyse en cours");
    expect(view.description).not.toContain("sidecar");
    expect(view.description).not.toContain("APP_URL");
    expect(view.isBusy).toBe(true);
  });

  it("explique l'analyse en cours avec des mots utilisateur", () => {
    const view = getRunStatusView(makeRunDetails("running"));

    expect(view.description).toContain("vidéos");
    expect(view.description).not.toContain("D1");
    expect(view.isBusy).toBe(true);
  });

  it("affiche le nombre de videos deja disponibles pendant l'analyse", () => {
    const view = getRunStatusView({
      ...makeRunDetails("running"),
      videos: [
        makeRunVideo("a"),
        makeRunVideo("b"),
      ],
    });

    expect(view.description).toContain("2 vidéos disponibles");
  });

  it("explique le resultat completed", () => {
    const view = getRunStatusView({
      ...makeRunDetails("completed"),
      videos: [makeRunVideo("a"), makeRunVideo("b")],
    });

    expect(view.title).toBe("2 vidéos trouvées");
    expect(view.description).toContain("trier");
    expect(view.isBusy).toBe(false);
  });

  it("explique la recuperation video apres l'analyse", () => {
    const view = getRunStatusView({
      ...makeRunDetails("completed"),
      videos: [makeRunVideo("a", "queued")],
    });

    expect(view.description).toContain("tableau");
    expect(view.isBusy).toBe(true);
  });
});

describe("getVideoStatusLabel", () => {
  it("rend les etats video comprehensibles pour un utilisateur", () => {
    expect(getVideoStatusLabel("idle")).toBe("Disponible");
    expect(getVideoStatusLabel("queued")).toBe("En attente");
    expect(getVideoStatusLabel("downloading")).toBe("Récupération");
    expect(getVideoStatusLabel("downloaded")).toBe("Récupérée");
    expect(getVideoStatusLabel("downloaded", false)).toBe("À récupérer");
    expect(getVideoStatusLabel("failed")).toBe("Erreur");
  });
});

describe("shouldPollRunDetails", () => {
  it("continue pendant la recuperation des videos", () => {
    expect(
      shouldPollRunDetails(
        {
          ...makeRunDetails("completed"),
          videos: [makeRunVideo("a", "downloading")],
        },
        "run_123",
      ),
    ).toBe(true);
  });

  it("s'arrete quand l'analyse et les videos sont terminees", () => {
    expect(
      shouldPollRunDetails(
        {
          ...makeRunDetails("completed"),
          videos: [makeRunVideo("a", "downloaded")],
        },
        "run_123",
      ),
    ).toBe(false);
  });
});

describe("getTikTokEmbedUrl", () => {
  it("cree l'URL de lecture modale depuis un lien TikTok", () => {
    expect(getTikTokEmbedUrl(makeRunVideo("123"))).toBe(
      "https://www.tiktok.com/embed/v2/123",
    );
    expect(
      getTikTokEmbedUrl({
        ...makeRunVideo("local-id"),
        webpageUrl: "https://www.tiktok.com/@creator/video/1234567890",
      }),
    ).toBe("https://www.tiktok.com/embed/v2/1234567890");
  });

  it("refuse les identifiants non integrables", () => {
    expect(
      getTikTokEmbedUrl({
        ...makeRunVideo("local-id"),
        webpageUrl: "https://www.tiktok.com/@creator",
      }),
    ).toBeNull();
  });
});

describe("getLocalVideoUrl", () => {
  it("cree une URL de lecture seulement quand la video est recuperee", () => {
    expect(
      getLocalVideoUrl({
        ...makeRunVideo("123", "downloaded"),
        localPath: "public/tiktok-videos/creator/video.mp4",
      }),
    ).toBe("/tiktok-videos/creator/video.mp4");
    expect(
      getLocalVideoUrl({
        ...makeRunVideo("123", "downloaded"),
        localPath:
          "/Users/me/app/downloads/tiktok-videos/creator/video one.mp4",
      }),
    ).toBe("/tiktok-videos/creator/video%20one.mp4");
    expect(getLocalVideoUrl(makeRunVideo("123", "idle"))).toBeNull();
    expect(getLocalVideoUrl(makeRunVideo("123", "downloaded"))).toBeNull();
  });
});

function makeRunDetails(status: RunDetails["run"]["status"]): RunDetails {
  return {
    run: {
      id: "run_123",
      input: "creator",
      normalizedUrl: "https://www.tiktok.com/@creator",
      kind: "profile",
      handle: "creator",
      videoId: null,
      status,
      totalDiscovered: status === "completed" ? 100 : 0,
      totalSelected: status === "completed" ? 100 : 0,
      metadataProcessed: status === "completed" ? 100 : 0,
      videoJobsTotal: 0,
      videoJobsCompleted: 0,
      videoJobsFailed: 0,
      error: status === "failed" ? "Boom" : null,
      createdAt: 1,
      updatedAt: 1,
    },
    videos: [],
  };
}

function makeRunVideo(
  id: string,
  videoStatus: RunDetails["videos"][number]["videoStatus"] = "idle",
): RunDetails["videos"][number] {
  return {
    id,
    handle: "creator",
    webpageUrl: `https://www.tiktok.com/@creator/video/${id}`,
    thumbnailUrl: null,
    title: `Video ${id}`,
    description: `Description ${id}`,
    publishedAt: "2026-05-07T00:00:00.000Z",
    uploadDate: "20260507",
    durationSeconds: 12,
    viewCount: 100,
    likeCount: 10,
    repostCount: 1,
    commentCount: 2,
    tags: [],
    audioTrack: null,
    audioAuthor: null,
    transcriptText: null,
    source: "recent",
    rank: 1,
    videoStatus,
    localPath: null,
  };
}
