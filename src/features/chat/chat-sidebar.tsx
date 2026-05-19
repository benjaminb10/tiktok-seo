import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useChat } from "./use-chat";
import { useChatContext } from "./chat-context";
import { ChatMessage } from "./chat-message";

export function ChatSidebar() {
  const { videoContext } = useChatContext();
  const { messages, isLoading, error, send, clear, hasContext } = useChat(videoContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <span className="font-medium text-sm">Assistant IA</span>
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
                Lancez une analyse pour discuter avec l'IA
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8" />
              <p className="text-sm">
                Posez une question sur vos vidéos TikTok
              </p>
              <div className="mt-2 space-y-1.5">
                <SuggestedQuestion
                  text="Quelles sont mes meilleures vidéos ?"
                  onClick={() => send("Quelles sont mes meilleures vidéos ?")}
                />
                <SuggestedQuestion
                  text="Quels hashtags fonctionnent le mieux ?"
                  onClick={() => send("Quels hashtags fonctionnent le mieux ?")}
                />
                <SuggestedQuestion
                  text="Comment améliorer mon engagement ?"
                  onClick={() => send("Comment améliorer mon engagement ?")}
                />
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && (
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
            placeholder={hasContext ? "Posez une question..." : "Lancez d'abord une analyse"}
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
