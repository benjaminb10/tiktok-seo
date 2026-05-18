import { BarChart3, Search } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "#/components/ui/button";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group";
import { Progress } from "#/components/ui/progress";
import type { RunStatusView } from "#/lib/tiktok/tiktok.ui";

type SearchPanelProps = {
  input: string;
  statusView: RunStatusView;
  isAnalyzing: boolean;
  isMetadataBusy: boolean;
  onInputChange: (value: string) => void;
  onAnalyze: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function SearchPanel({
  input,
  statusView,
  isAnalyzing,
  isMetadataBusy,
  onInputChange,
  onAnalyze,
  onCancel,
}: SearchPanelProps) {
  return (
    <section className="mx-auto flex w-full flex-col gap-6">
      <form className="flex w-full flex-col gap-4" onSubmit={onAnalyze}>
        <InputGroup className="h-14 text-base shadow-sm">
          <Search className="ml-4 h-5 w-5 text-muted-foreground" />
          <InputGroupInput
            id="tiktok-input"
            aria-label="Pseudo ou lien TikTok"
            placeholder="Entrez un pseudo TikTok (@creator) ou un lien"
            className="pl-2"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2 pr-2">
            {isMetadataBusy && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Arrêter
              </Button>
            )}
            <Button
              type="submit"
              className="h-10"
              disabled={isAnalyzing || isMetadataBusy || !input.trim()}
            >
              {isAnalyzing || isMetadataBusy ? "Analyse..." : "Analyser"}
            </Button>
          </div>
        </InputGroup>
        {statusView.progress ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{statusView.description}</span>
              <span className="font-medium text-primary">{statusView.progress.percentage}%</span>
            </div>
            <Progress value={statusView.progress.percentage} className="h-2" />
          </div>
        ) : (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {statusView.description}
          </p>
        )}
      </form>
    </section>
  );
}
