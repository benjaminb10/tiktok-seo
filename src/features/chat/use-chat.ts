import { useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { sendChatMessageFn } from "#/lib/chat/chat.functions";
import type { ChatMessage, VideoContext } from "./chat.types";

export function useChat(context: VideoContext | null) {
  const sendMessage = useServerFn(sendChatMessageFn);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (content: string) => {
      if (!context || !content.trim()) return;

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendMessage({
          data: {
            message: content,
            context,
            history,
          },
        });

        const aiMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: response.message,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de l'envoi du message";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [context, messages, sendMessage],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    send,
    clear,
    hasContext: !!context,
  };
}
