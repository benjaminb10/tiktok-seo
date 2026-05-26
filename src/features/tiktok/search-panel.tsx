import { Search, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group";
import { Progress } from "#/components/ui/progress";
import { QuotaBadge } from "#/features/paywall/quota-badge";
import { useQuotaDisplay } from "#/lib/stripe/quota-context";
import type { RunStatusView } from "#/lib/tiktok/tiktok.ui";

type SearchPanelProps = {
  input: string;
  statusView: RunStatusView;
  isAnalyzing: boolean;
  isMetadataBusy: boolean;
  currentHandle?: string | null;
  avatarUrl?: string | null;
  hasResults: boolean;
  onInputChange: (value: string) => void;
  onAnalyze: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onNewAnalysis: () => void;
};

export function SearchPanel({
  input,
  statusView,
  isAnalyzing,
  isMetadataBusy,
  currentHandle,
  avatarUrl,
  hasResults,
  onInputChange,
  onAnalyze,
  onCancel,
  onNewAnalysis,
}: SearchPanelProps) {
  const quotaDisplay = useQuotaDisplay();

  const getInitials = (handle: string) => {
    const cleaned = handle.replace(/^@/, "").trim();
    return cleaned.slice(0, 2).toUpperCase();
  };

  return (
    <section className="mx-auto flex w-full flex-col gap-6">
      {currentHandle && hasResults && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={avatarUrl || undefined} alt={currentHandle} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-violet-500 text-white font-semibold">
                {getInitials(currentHandle)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{currentHandle}</h2>
              <p className="text-sm text-muted-foreground">Analysis in progress</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onNewAnalysis}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New analysis
          </Button>
        </div>
      )}
      <form className="flex w-full flex-col gap-4" onSubmit={onAnalyze}>
        <InputGroup className="h-14 text-base shadow-sm">
          <Search className="ml-4 h-5 w-5 text-muted-foreground" />
          <InputGroupInput
            id="tiktok-input"
            aria-label="TikTok username or link"
            placeholder="Enter a TikTok username (@creator) or link"
            className="pl-2"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2 pr-2">
            {!quotaDisplay.analyses.isUnlimited && (
              <QuotaBadge
                used={quotaDisplay.analyses.used}
                limit={quotaDisplay.analyses.limit}
                label="Analyses"
              />
            )}
            {isMetadataBusy && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Stop
              </Button>
            )}
            <Button
              type="submit"
              className="h-10"
              disabled={isAnalyzing || isMetadataBusy || !input.trim()}
            >
              {isAnalyzing || isMetadataBusy ? "Analyzing..." : "Analyze"}
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
