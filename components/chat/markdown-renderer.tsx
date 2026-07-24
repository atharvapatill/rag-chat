"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckIcon, CopyIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
}

function normalizeLLMContent(raw: string): string {
  const lines = raw.split("\n");

  const processed = lines.map((line) => {
    const isTableRow = /^\s*\|/.test(line) || /\|\s*$/.test(line);
    if (isTableRow) {
      return line.replace(/<br\s*\/?>/gi, " · ");
    }
    return line.replace(/<br\s*\/?>/gi, "\n\n");
  });

  return processed.join("\n").replace(/\\n/g, "\n");
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const normalized = normalizeLLMContent(content);

  return (
    <div className="text-sm leading-relaxed text-foreground/90 space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-4 mb-2 text-lg font-semibold tracking-tight text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-3 mb-1.5 text-base font-semibold tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-2.5 mb-1 text-sm font-semibold text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-0 text-sm leading-relaxed text-foreground/90 whitespace-pre-line first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-0.5 space-y-1 pl-5 list-disc text-foreground/90 marker:text-muted-foreground/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-0.5 space-y-1 pl-5 list-decimal text-foreground/90 marker:font-mono marker:text-muted-foreground/60">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-foreground underline underline-offset-4 hover:text-accent-foreground/70 transition-colors"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-accent-foreground/60 bg-accent/30 py-1.5 pr-3 pl-3 rounded-r-md italic text-muted-foreground">
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="my-3 w-full overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/30 text-foreground">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-muted/20">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top text-[13px] leading-relaxed text-foreground/85">
              {children}
            </td>
          ),

          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[12px] text-accent-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, "")}
              />
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

interface CodeBlockProps {
  language: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn(
        "relative my-3 overflow-hidden rounded-lg border border-border bg-background/80 font-mono text-[13px] leading-relaxed",
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="size-3 text-accent-foreground" />
              <span className="text-accent-foreground">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-foreground/90">
        <code>{value}</code>
      </pre>
    </div>
  );
}
