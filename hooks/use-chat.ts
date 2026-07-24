"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

import { apiFetch, ApiError } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

interface ChatQueryResponse {
  answer: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chat_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const formatted = parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
        setMessages(formatted);
      } catch (e) {
        console.error("Failed to parse saved chat messages:", e);
      }
    }
    setHasLoaded(true);
  }, []);

  // Save to localStorage when messages change (after initial load)
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages, hasLoaded]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date(),
      };

      // 1. Append user message immediately
      setMessages((prev) => [...prev, userMessage]);

      // 2. Show loading state
      setIsResponding(true);

      try {
        // 3. Build history from current state via functional updater snapshot
        const backendHistory = messages.slice(-4).map((m) => m.content);

        // 4. Send request
        const data = await apiFetch<ChatQueryResponse>("/chat/query", {
          method: "POST",
          body: JSON.stringify({
            query: content,
            history: backendHistory,
          }),
        });

        // 5. Append assistant response
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorText =
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";

        // Keep the user message — append a failed assistant message instead
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ ${errorText}`,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);

        // Also show a toast with a retry action (skip for 401 — handled globally)
        if (!(err instanceof ApiError && err.status === 401)) {
          toast.error(errorText, {
            action: {
              label: "Retry",
              onClick: () => sendMessage(content),
            },
          });
        }
      } finally {
        setIsResponding(false);
      }
    },
    [messages],
  );

  return { messages, isResponding, sendMessage };
}
