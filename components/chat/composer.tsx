"use client";

import { useState } from "react";
import { ArrowUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ComposerProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function Composer({ onSend, disabled }: ComposerProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuery(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  const isEmpty = !query.trim();

  return (
    <div className="border-t border-border bg-background/80 px-4 pb-4 pt-3 backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border bg-card px-2 py-2 transition-all duration-150",
          focused
            ? "border-ring/40 ring-2 ring-ring/30"
            : "border-border/60 hover:border-border",
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/40">
          <span className="size-1.5 rounded-full bg-accent-foreground/50" aria-hidden="true" />
        </div>

        <textarea
          placeholder="Ask a question about your documents…"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          rows={1}
          className={cn(
            "min-h-7 flex-1 resize-none bg-transparent py-1.5 text-sm leading-6 text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label="Chat input"
        />

        <Button
          size="icon"
          variant="default"
          className={cn(
            "mb-0.5 size-7 shrink-0 rounded-lg transition-all",
            isEmpty && "pointer-events-none opacity-40",
          )}
          onClick={handleSubmit}
          disabled={isEmpty || disabled}
          aria-label="Send message"
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
      </div>

      <p className="mx-auto mt-2 max-w-3xl text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/40">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
