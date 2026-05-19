import { useState, useCallback } from "react";
import { SearchPanel } from "./search-panel";
import { useTikTokAnalyzer } from "./use-tiktok-analyzer";
import { VideoDialog } from "./video-dialogs";
import { UnifiedStatsCards } from "#/features/analysis/unified-stats-cards";
import { RecentVideosPreview } from "#/features/analysis/recent-videos-preview";
import { UnifiedVideosTable } from "#/features/analysis/unified-videos-table";
import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";

type TikTokAnalyzerPageProps = {
  searchRunId?: string | null;
};

export function TikTokAnalyzerPage({ searchRunId }: TikTokAnalyzerPageProps) {
  const analyzer = useTikTokAnalyzer(searchRunId);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

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
          onAnalyze={analyzer.analyze}
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
    </main>
  );
}
