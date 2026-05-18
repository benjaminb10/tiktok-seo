import { SearchPanel } from "./search-panel";
import { StatsCards } from "./stats-cards";
import { useTikTokAnalyzer } from "./use-tiktok-analyzer";
import { VideosTable } from "./videos-table";

type TikTokAnalyzerPageProps = {
  searchRunId?: string | null;
};

export function TikTokAnalyzerPage({ searchRunId }: TikTokAnalyzerPageProps) {
  const analyzer = useTikTokAnalyzer(searchRunId);

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
          <StatsCards videos={analyzer.videos} />
        )}
        {analyzer.videos.length > 0 && (
          <VideosTable
            videos={analyzer.videos}
            canLoadMore={analyzer.canLoadMore}
            onRequestVideoDownload={analyzer.requestVideoDownload}
            onLoadMore={analyzer.loadMore}
            onNewAnalysis={analyzer.newAnalysis}
          />
        )}
      </div>
    </main>
  );
}
