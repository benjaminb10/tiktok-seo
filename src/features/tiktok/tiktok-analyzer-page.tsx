import { useState, useCallback, useEffect } from "react";
import { SearchPanel } from "./search-panel";
import { useTikTokAnalyzer } from "./use-tiktok-analyzer";
import { VideoDialog } from "./video-dialogs";
import { UnifiedStatsCards } from "#/features/analysis/unified-stats-cards";
import { RecentVideosPreview } from "#/features/analysis/recent-videos-preview";
import { UnifiedVideosTable } from "#/features/analysis/unified-videos-table";
import { useChatContext } from "#/features/chat/chat-context";
import { buildVideoContext } from "#/features/chat/chat.utils";
import { AnalysisLimitModal } from "#/features/paywall/analysis-limit-modal";
import { ExportPaywallModal } from "#/features/paywall/export-paywall-modal";
import { useQuota } from "#/lib/stripe/quota-context";
import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";

type TikTokAnalyzerPageProps = {
  searchRunId?: string | null;
};

export function TikTokAnalyzerPage({ searchRunId }: TikTokAnalyzerPageProps) {
  const analyzer = useTikTokAnalyzer(searchRunId);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { setVideoContext } = useChatContext();
  const { isAuthenticated, quota, getVideoLimit, canPerformAction, incrementAnonUsage, refetch } = useQuota();
  const videoLimit = getVideoLimit();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Wrap analyze to check quota for anonymous users
  const handleAnalyze = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // For anonymous users, check quota client-side
      if (!isAuthenticated) {
        if (!canPerformAction("analysis")) {
          setShowLimitModal(true);
          return;
        }
        // Increment anonymous usage before analysis
        incrementAnonUsage("analysis");
      }

      // Create a synthetic event to pass to the original analyze
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;

      await analyzer.analyze(syntheticEvent);

      // Refetch quota after analysis (for authenticated users)
      if (isAuthenticated) {
        await refetch();
      }
    },
    [isAuthenticated, canPerformAction, incrementAnonUsage, analyzer, refetch]
  );

  // Update chat context when videos or handle change
  useEffect(() => {
    if (analyzer.currentHandle && analyzer.videos.length > 0) {
      const context = buildVideoContext(analyzer.currentHandle, analyzer.videos);
      setVideoContext(context);
    } else {
      setVideoContext(null);
    }
  }, [analyzer.currentHandle, analyzer.videos, setVideoContext]);

  const selectedVideo = analyzer.videos.find((v) => v.id === selectedVideoId) ?? null;

  const handleVideoClick = useCallback((video: RunVideoRow) => {
    setSelectedVideoId(video.id);
    void analyzer.requestVideoDownload(video);
  }, [analyzer]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
        <SearchPanel
          input={analyzer.input}
          statusView={analyzer.statusView}
          isAnalyzing={analyzer.isAnalyzing}
          isMetadataBusy={analyzer.isMetadataBusy}
          currentHandle={analyzer.currentHandle}
          avatarUrl={analyzer.avatarUrl}
          hasResults={analyzer.hasResults}
          onInputChange={analyzer.setInput}
          onAnalyze={handleAnalyze}
          onCancel={analyzer.cancelRun}
          onNewAnalysis={analyzer.newAnalysis}
        />
        {analyzer.videos.length > 0 && (
          <UnifiedStatsCards videos={analyzer.videos} />
        )}
        {analyzer.videos.length > 0 && (
          <RecentVideosPreview
            videos={analyzer.videos}
            maxVideos={6}
            onVideoClick={handleVideoClick}
          />
        )}
        {analyzer.videos.length > 0 && (
          <UnifiedVideosTable
            videos={analyzer.videos}
            canLoadMore={analyzer.canLoadMore}
            onLoadMore={analyzer.loadMore}
            onNewAnalysis={analyzer.newAnalysis}
            onVideoClick={handleVideoClick}
            exportFilename="viewlify-export.csv"
            videoLimit={videoLimit}
            onExportBlocked={() => setShowExportModal(true)}
          />
        )}
      </div>
      <VideoDialog
        video={selectedVideo}
        isOpen={selectedVideo !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedVideoId(null);
        }}
      />
      <AnalysisLimitModal
        open={analyzer.quotaExceeded !== null || showLimitModal}
        onOpenChange={(open) => {
          if (!open) {
            analyzer.clearQuotaExceeded();
            setShowLimitModal(false);
          }
        }}
        used={analyzer.quotaExceeded?.used ?? quota?.usage.analyses.used ?? 0}
        limit={analyzer.quotaExceeded?.limit ?? quota?.usage.analyses.limit ?? 1}
        isAuthenticated={isAuthenticated}
      />
      <ExportPaywallModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
      />
    </main>
  );
}
