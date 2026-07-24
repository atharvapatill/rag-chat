"use client";

import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import { useChat } from "@/hooks/use-chat";

export function ChatPanel() {
  const { messages, isResponding, sendMessage } = useChat();

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <MessageList messages={messages} isResponding={isResponding} />
      <Composer onSend={sendMessage} disabled={isResponding} />
    </section>
  );
}
