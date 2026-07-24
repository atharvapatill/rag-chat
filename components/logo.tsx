"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ showText = true, className, size = "sm" }: LogoProps) {
  const sizeClass = size === "lg" ? "size-10" : size === "md" ? "size-7" : "size-6";
  const iconSize =
    size === "lg" ? 18 : size === "md" ? 15 : 13;
  const textSize =
    size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-[15px]";

  return (
    <div className={cn("flex items-center gap-2.5 overflow-hidden", className)}>
      <span
        className={cn(
          "relative grid shrink-0 place-items-center rounded-[0.4em] border border-ring/40 bg-accent/60 text-accent-foreground transition-all duration-200",
          sizeClass,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 16 16"
          width={iconSize}
          height={iconSize}
          fill="none"
          className="text-accent-foreground"
        >
          <path
            d="M3.2 2.6h6.2l3.4 3.4v7.4a0.8 0.8 0 0 1-0.8 0.8H3.2a0.8 0.8 0 0 1-0.8-0.8V3.4a0.8 0.8 0 0 1 0.8-0.8Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M9 2.7v3.1h3.4"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M5 9h6M5 11h4"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {showText && (
        <span
          className={cn(
            "flex items-baseline gap-[1px] whitespace-nowrap font-semibold tracking-tight text-foreground",
            textSize,
          )}
        >
          <span>Doc</span>
          <span className="font-medium text-muted-foreground">chat</span>
        </span>
      )}
    </div>
  );
}
