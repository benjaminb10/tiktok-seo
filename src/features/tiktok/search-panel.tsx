import { BarChart3, Search } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "#/components/ui/button";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group";

type SearchPanelProps = {
  input: string;
  statusText: string;
  isAnalyzing: boolean;
  isMetadataBusy: boolean;
  onInputChange: (value: string) => void;
  onAnalyze: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function SearchPanel({
  input,
  statusText,
  isAnalyzing,
  isMetadataBusy,
  onInputChange,
  onAnalyze,
  onCancel,
}: SearchPanelProps) {
  return (
    <section className="mx-auto flex w-full flex-col items-center gap-8 pt-16">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">
            TikTok{" "}
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Analyzer
            </span>
          </h1>
        </div>
        <p className="text-muted-foreground">
          Analysez les performances de n'importe quel compte TikTok
        </p>
      </div>

      <form className="flex w-full max-w-lg flex-col items-center gap-4" onSubmit={onAnalyze}>
        <InputGroup className="h-16 text-2xl">
          <InputGroupInput
            id="tiktok-input"
            aria-label="Pseudo ou lien TikTok"
            placeholder="@creator ou lien TikTok"
            className="!text-2xl placeholder:!text-2xl pl-4"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2 pr-2">
            {isMetadataBusy && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                Arrêter
              </Button>
            )}
            <Button
              type="submit"
              className="h-12 px-6"
              disabled={isAnalyzing || isMetadataBusy || !input.trim()}
            >
              <Search className="h-5 w-5" />
              {isAnalyzing || isMetadataBusy ? "Analyse..." : "Analyser"}
            </Button>
          </div>
        </InputGroup>
        <p aria-live="polite">{statusText}</p>
      </form>
    </section>
  );
}
