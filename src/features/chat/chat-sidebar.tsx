import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useChat } from "./use-chat";
import { useChatContext } from "./chat-context";
import { ChatMessage } from "./chat-message";
import { QuotaBadge } from "#/features/paywall/quota-badge";
import { AiQuotaModal } from "#/features/paywall/ai-quota-modal";
import { useQuotaDisplay } from "#/lib/stripe/quota-context";

export function ChatSidebar() {
  const { videoContext } = useChatContext();
  const { messages, isLoading, error, quotaExceeded, send, clear, clearQuotaExceeded, hasContext } = useChat(videoContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const quotaDisplay = useQuotaDisplay();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    send(input);
    setInput("");
  };

  return (
    <div className="flex h-full w-[400px] flex-col border-l bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Assistant</span>
          {!quotaDisplay.aiInsights.isUnlimited && (
            <QuotaBadge
              used={quotaDisplay.aiInsights.used}
              limit={quotaDisplay.aiInsights.limit}
              label=""
            />
          )}
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="h-7 w-7 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="flex flex-col gap-3">
          {!hasContext ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">
                Run an analysis to chat with AI
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8" />
              <p className="text-sm">
                Ask a question about your TikTok videos
              </p>
              <div className="mt-2 space-y-1.5">
                <SuggestedQuestion
                  text="What are my best performing videos?"
                  onClick={() => send("What are my best performing videos?")}
                />
                <SuggestedQuestion
                  text="Which hashtags work best?"
                  onClick={() => send("Which hashtags work best?")}
                />
                <SuggestedQuestion
                  text="How can I improve my engagement?"
                  onClick={() => send("How can I improve my engagement?")}
                />
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1].content === "" && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-t bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasContext ? "Ask a question..." : "Run an analysis first"}
            disabled={!hasContext || isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!hasContext || !input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* AI Quota Modal */}
      <AiQuotaModal
        open={quotaExceeded !== null}
        onOpenChange={(open) => {
          if (!open) clearQuotaExceeded();
        }}
        used={quotaExceeded?.used ?? 0}
        limit={quotaExceeded?.limit ?? 1}
      />
    </div>
  );
}

function SuggestedQuestion({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border bg-card px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
    >
      {text}
    </button>
  );
}
