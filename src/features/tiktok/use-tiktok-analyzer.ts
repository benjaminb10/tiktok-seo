import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  cancelRunFn,
  continueMetadataRunFn,
  createMetadataRunFn,
  createVideoDownloadJobFn,
  getRunDetailsFn,
} from "#/lib/tiktok/tiktok.functions";
import type { RunDetails, RunVideoRow } from "#/lib/tiktok/tiktok.types";
import {
  getLocalVideoUrl,
  getRunStatusView,
  hasPendingVideoWork,
  shouldPollRunDetails,
} from "#/lib/tiktok/tiktok.ui";

export type QuotaExceededInfo = {
  used: number;
  limit: number;
};

export function useTikTokAnalyzer(searchRunId?: string | null, initialInput?: string | null) {
  const navigate = useNavigate({ from: "/app" });
  const createRun = useServerFn(createMetadataRunFn);
  const getRunDetails = useServerFn(getRunDetailsFn);
  const createVideoDownloadJob = useServerFn(createVideoDownloadJobFn);
  const cancelRunServer = useServerFn(cancelRunFn);
  const continueRun = useServerFn(continueMetadataRunFn);
  const [input, setInput] = useState(initialInput ?? "");
  const [runId, setRunId] = useState<string | null>(() => {
    if (searchRunId) return searchRunId;
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("tiktok:lastRunId");
  });
  const [details, setDetails] = useState<RunDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [queueingVideoIds, setQueueingVideoIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededInfo | null>(null);

  const refreshRun = useCallback(
    async (nextRunId: string) => {
      const next = await getRunDetails({ data: { runId: nextRunId } });
      if (!next) {
        throw new Error(`Run ${nextRunId} introuvable.`);
      }
      setDetails(next);
      return next;
    },
    [getRunDetails],
  );

  const shouldPoll = shouldPollRunDetails(details, runId);
  const videos = details?.videos ?? [];
  const isVideoWorkBusy = hasPendingVideoWork(details);
  const isMetadataBusy =
    details?.run.status === "queued" || details?.run.status === "running";
  const canLoadMore =
    details?.run.status === "completed" &&
    details.run.totalDiscovered > 0 &&
    details.run.totalDiscovered % 500 === 0;
  const statusView = getRunStatusView(details, runId);
  const statusText = error ?? statusView.description;
  const statusViewWithError = error ? { ...statusView, description: error } : statusView;

  useEffect(() => {
    if (!searchRunId) return;
    if (searchRunId !== runId) {
      setRunId(searchRunId);
      setDetails(null);
      setError(null);
    }
    window.sessionStorage.setItem("tiktok:lastRunId", searchRunId);
  }, [runId, searchRunId]);

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;
    const refresh = async () => {
      try {
        const next = await getRunDetails({ data: { runId } });
        if (!next) {
          // Run not found - clean up and reset
          if (!cancelled) {
            setError(`Analysis not found. It may have been deleted.`);
            setRunId(null);
            setDetails(null);
            window.sessionStorage.removeItem("tiktok:lastRunId");
            void navigate({ to: "/app", search: {}, replace: true });
          }
          return;
        }
        if (!cancelled) setDetails(next);
      } catch (caught) {
        if (!cancelled) {
          const message = errorMessage(caught);
          // If run not found, clean up
          if (message.includes("introuvable") || message.includes("not found")) {
            setRunId(null);
            setDetails(null);
            window.sessionStorage.removeItem("tiktok:lastRunId");
            void navigate({ to: "/app", search: {}, replace: true });
          }
          setError(message);
        }
      }
    };

    void refresh();

    if (!shouldPoll) {
      return () => {
        cancelled = true;
      };
    }

    const interval = window.setInterval(refresh, 2_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [getRunDetails, runId, shouldPoll, navigate]);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setQuotaExceeded(null);
    setIsAnalyzing(true);
    try {
      const result = await createRun({ data: { input } });

      // Handle quota exceeded error
      if (!result.success) {
        if (result.error === "QUOTA_EXCEEDED") {
          setQuotaExceeded({ used: result.used, limit: result.limit });
          return;
        }
        setError(result.message);
        return;
      }

      setDetails(null);
      setRunId(result.runId);
      window.sessionStorage.setItem("tiktok:lastRunId", result.runId);
      void navigate({ to: "/app", search: { runId: result.runId }, replace: true });
      await refreshRun(result.runId);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsAnalyzing(false);
    }
  }

  function clearQuotaExceeded() {
    setQuotaExceeded(null);
  }

  async function requestVideoDownload(video: RunVideoRow) {
    if (!details || !shouldRequestVideoDownload(video)) return;

    setError(null);
    setQueueingVideoIds((current) => new Set(current).add(video.id));
    try {
      await createVideoDownloadJob({
        data: { runId: details.run.id, videoId: video.id },
      });
      await refreshRun(details.run.id);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setQueueingVideoIds((current) => {
        const next = new Set(current);
        next.delete(video.id);
        return next;
      });
    }
  }

  async function cancelRun() {
    if (!runId) return;

    setError(null);
    try {
      await cancelRunServer({ data: { runId } });
      await refreshRun(runId);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function loadMore() {
    if (!runId || !canLoadMore) return;

    setError(null);
    try {
      await continueRun({ data: { runId } });
      await refreshRun(runId);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  function clearResults() {
    setRunId(null);
    setDetails(null);
    setError(null);
    setInput("");
    window.sessionStorage.removeItem("tiktok:lastRunId");
  }

  function newAnalysis() {
    clearResults();
    void navigate({ to: "/app", search: {}, replace: true });
  }

  return {
    input,
    videos,
    statusText,
    statusView: statusViewWithError,
    isAnalyzing,
    isMetadataBusy,
    isVideoWorkBusy,
    canLoadMore,
    queueingVideoIds,
    currentRunId: details?.run.id ?? null,
    currentHandle: details?.run.handle ?? null,
    avatarUrl: details?.run.avatarUrl ?? null,
    hasResults: videos.length > 0,
    quotaExceeded,
    setInput,
    analyze,
    cancelRun,
    loadMore,
    newAnalysis,
    requestVideoDownload,
    clearQuotaExceeded,
  };
}

function shouldRequestVideoDownload(video: RunVideoRow): boolean {
  if (video.videoStatus === "idle" || video.videoStatus === "failed") {
    return true;
  }

  return video.videoStatus === "downloaded" && !getLocalVideoUrl(video);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
