import { Search } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "#/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";

type SearchPanelProps = {
  input: string;
  statusText: string;
  isAnalyzing: boolean;
  isMetadataBusy: boolean;
  onInputChange: (value: string) => void;
  onAnalyze: (event: FormEvent<HTMLFormElement>) => void;
};

export function SearchPanel({
  input,
  statusText,
  isAnalyzing,
  isMetadataBusy,
  onInputChange,
  onAnalyze,
}: SearchPanelProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 pt-16">
      <div className="flex flex-col items-center gap-2">
        <h1>TikTok Analyzer</h1>
      </div>

      <form className="flex w-full flex-col items-center gap-4" onSubmit={onAnalyze}>
        <InputGroup className="h-12">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            id="tiktok-input"
            aria-label="Pseudo ou lien TikTok"
            placeholder="@creator ou https://www.tiktok.com/@creator"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
          />
        </InputGroup>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            disabled={isAnalyzing || isMetadataBusy || !input.trim()}
          >
            {isAnalyzing || isMetadataBusy
              ? "Analyse..."
              : "Analyser le compte"}
          </Button>
        </div>
        <p aria-live="polite">{statusText}</p>
      </form>
    </section>
  );
}
