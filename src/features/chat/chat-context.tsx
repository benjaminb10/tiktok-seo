import { createContext, useContext, useState, type ReactNode } from "react";
import type { VideoContext } from "./chat.types";

type ChatContextValue = {
  videoContext: VideoContext | null;
  setVideoContext: (context: VideoContext | null) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [videoContext, setVideoContext] = useState<VideoContext | null>(null);

  return (
    <ChatContext.Provider value={{ videoContext, setVideoContext }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
}
