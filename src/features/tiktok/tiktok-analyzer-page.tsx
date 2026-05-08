import { SearchPanel } from "./search-panel";
import { useTikTokAnalyzer } from "./use-tiktok-analyzer";
import { VideosTable } from "./videos-table";

type TikTokAnalyzerPageProps = {
  searchRunId?: string | null;
};

export function TikTokAnalyzerPage({ searchRunId }: TikTokAnalyzerPageProps) {
  const analyzer = useTikTokAnalyzer(searchRunId);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4">
        <SearchPanel
          input={analyzer.input}
          statusText={analyzer.statusText}
          isAnalyzing={analyzer.isAnalyzing}
          isMetadataBusy={analyzer.isMetadataBusy}
          onInputChange={analyzer.setInput}
          onAnalyze={analyzer.analyze}
        />
        <VideosTable
          videos={analyzer.videos}
          queueingVideoIds={analyzer.queueingVideoIds}
          onRequestVideoDownload={analyzer.requestVideoDownload}
        />
      </div>
    </main>
  );
}
