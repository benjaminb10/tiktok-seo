import { useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";
import type { ChatMessage, VideoContext } from "./chat.types";

export type QuotaExceededState = {
  used: number;
  limit: number;
} | null;

export function useChat(context: VideoContext | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededState>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (content: string) => {
      if (!context || !content.trim()) return;

      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const aiMessageId = nanoid();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: aiMessageId, role: "assistant", content: "", timestamp: Date.now() },
      ]);
      setIsLoading(true);
      setError(null);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            context,
            history,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as {
            error?: string;
            used?: number;
            limit?: number;
          };

          // Handle quota exceeded error
          if (errorData.error === "AI_QUOTA_EXCEEDED") {
            setQuotaExceeded({
              used: errorData.used ?? 0,
              limit: errorData.limit ?? 1,
            });
            // Remove the empty AI message
            setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
            setIsLoading(false);
            return;
          }

          throw new Error(errorData.error || `Erreur: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream non disponible");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);

                // Handle content_block_delta events
                if (event.type === "content_block_delta" && event.delta?.text) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId ? { ...m, content: m.content + event.delta.text } : m,
                    ),
                  );
                }

                // Handle errors
                if (event.type === "error") {
                  throw new Error(event.error?.message || "Erreur du stream");
                }
              } catch (parseError) {
                // Ignore parse errors for non-JSON lines
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de l'envoi du message";
        setError(errorMessage);

        // Remove the empty AI message on error
        setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [context, messages],
  );

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setQuotaExceeded(null);
  }, []);

  const clearQuotaExceeded = useCallback(() => {
    setQuotaExceeded(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    quotaExceeded,
    send,
    clear,
    clearQuotaExceeded,
    hasContext: !!context,
  };
}
