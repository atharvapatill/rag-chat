"use client";

import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { FileTextIcon } from "lucide-react";

interface MessageListProps {
  messages: ChatMessage[];
  isResponding: boolean;
}

function formatTime(date: Date): string {
  return date
    .toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
    .toLowerCase();
}

const SUGGESTIONS = [
  "Summarize this document",
  "What are the key points?",
  "Explain the main topic",
];

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="relative flex flex-col items-center gap-5">
        <span
          className="pointer-events-none absolute -top-10 size-24 rounded-full bg-aurora opacity-40 blur-2xl"
          aria-hidden="true"
        />
        <span className="relative flex size-14 items-center justify-center rounded-2xl border border-ring/30 bg-accent/60 shadow-sm">
          <FileTextIcon className="size-6 text-accent-foreground" />
        </span>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-xl font-semibold tracking-tight text-foreground">
            Ask about your documents
          </p>
          <p className="max-w-[320px] text-sm leading-relaxed text-muted-foreground">
            Upload a PDF from the sidebar, then ask any question — answers are
            grounded in your sources.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
          Try
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <span
              key={suggestion}
              className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-[12px] text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages, isResponding }: MessageListProps) {
  if (messages.length === 0 && !isResponding) {
    return <EmptyState />;
  }

  return (
    <MessageScrollerProvider>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl px-6 pb-4 pt-8">
            {messages.length > 0 && (
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-border/60" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  {new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>
            )}

            {messages.map((msg, idx) => (
              <MessageScrollerItem key={msg.id}>
                {msg.role === "user" ? (
                  <Message align="end" className="mb-6 docchat-fade-in">
                    <MessageContent>
                      <Bubble variant="default" align="end" className="ml-auto max-w-[78%]">
                        <BubbleContent className="rounded-2xl rounded-br-md border border-primary/20 bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground whitespace-pre-line">
                          {msg.content}
                        </BubbleContent>
                      </Bubble>
                      <MessageHeader className="mt-1.5 justify-end gap-1.5 pr-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
                        <span>You</span>
                        <span aria-hidden>·</span>
                        <time dateTime={msg.createdAt.toISOString()}>
                          {formatTime(msg.createdAt)}
                        </time>
                      </MessageHeader>
                    </MessageContent>
                  </Message>
                ) : (
                  <AssistantMessage
                    msg={msg}
                    showRail={idx === 0 || messages[idx - 1].role !== "assistant"}
                  />
                )}
              </MessageScrollerItem>
            ))}

            {isResponding && (
              <MessageScrollerItem scrollAnchor>
                <Message align="start" className="mb-6">
                  <MessageContent>
                    <div className="flex items-center gap-2 pl-1 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-1.5 rounded-full bg-accent-foreground"
                          style={{ animation: "pulse 1.2s ease-in-out infinite" }}
                        />
                        DocChat
                      </span>
                      <span aria-hidden>·</span>
                      <span>Reading your documents</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2" aria-label="Assistant is thinking" aria-live="polite">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 rounded-full bg-accent-foreground/70"
                          style={{
                            animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

interface AssistantMessageProps {
  msg: ChatMessage;
  showRail: boolean;
}

function AssistantMessage({ msg, showRail }: AssistantMessageProps) {
  return (
    <Message align="start" className="mb-8 docchat-fade-in">
      <MessageContent>
        {showRail && (
          <div className="flex items-center gap-2 pl-1 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
            <span className="flex size-4 items-center justify-center rounded border border-ring/40 bg-accent/50 text-[8px] font-bold text-accent-foreground">
              <FileTextIcon className="size-2.5" />
            </span>
            <span>DocChat</span>
            <span aria-hidden>·</span>
            <time dateTime={msg.createdAt.toISOString()}>
              {formatTime(msg.createdAt)}
            </time>
          </div>
        )}

        <div className={cn("relative pl-4", showRail && "border-l border-border/60")}>
          <span
            className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-ring/40 via-ring/20 to-transparent"
            aria-hidden="true"
          />
          <Bubble variant="ghost" className="max-w-2xl">
            <BubbleContent className="px-0 py-0">
              <MarkdownRenderer content={msg.content} />
            </BubbleContent>
          </Bubble>
        </div>
      </MessageContent>
    </Message>
  );
}
