"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloudIcon, FileTextIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  progress: number;
  uploadingName: string | null;
  compact?: boolean;
}

export function UploadZone({
  onUpload,
  uploading,
  progress,
  uploadingName,
  compact = false,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") return;
      onUpload(file);
    },
    [onUpload],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  if (compact) {
    return (
      <>
        <button
          type="button"
          aria-label="Upload PDF"
          disabled={uploading}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border border-dashed border-sidebar-border text-muted-foreground transition-colors hover:border-ring/60 hover:bg-sidebar-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            uploading && "pointer-events-none opacity-50",
          )}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <UploadCloudIcon className="size-4" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={onInputChange}
          aria-label="Select PDF file"
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF — click or drag and drop"
        className={cn(
          "group relative flex cursor-pointer flex-col items-center gap-2.5 overflow-hidden rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent/30 px-4 py-5 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-ring/60 hover:bg-sidebar-accent/70",
          isDragging &&
            "border-ring bg-sidebar-accent ring-2 ring-ring/40 scale-[0.99]",
          uploading && "pointer-events-none opacity-50",
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <span
          className={cn(
            "absolute inset-0 bg-aurora opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100",
            isDragging && "opacity-100",
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "relative flex size-8 items-center justify-center rounded-md border border-sidebar-border bg-sidebar transition-all duration-200",
            isDragging && "border-ring/50 bg-ring/10",
          )}
        >
          <UploadCloudIcon
            className={cn(
              "size-4 text-muted-foreground transition-colors",
              isDragging && "text-accent-foreground",
            )}
          />
        </div>
        <div className="relative flex flex-col gap-0.5">
          <p className="text-xs font-medium text-sidebar-foreground">
            Drop PDF here
          </p>
          <p className="text-[11px] text-muted-foreground">
            or{" "}
            <span className="text-accent-foreground underline underline-offset-2">
              click to browse
            </span>
          </p>
        </div>
        <p className="relative font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          PDF · max 50 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={onInputChange}
        aria-label="Select PDF file"
      />

      {uploading && uploadingName && (
        <div
          className="flex flex-col gap-1.5 rounded-md border border-sidebar-border bg-sidebar px-3 py-2.5"
          aria-live="polite"
          aria-label={`Uploading ${uploadingName}`}
        >
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-3.5 shrink-0 text-accent-foreground" />
            <span className="max-w-[150px] truncate text-[11px] font-medium text-sidebar-foreground">
              {uploadingName}
            </span>
            <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-0.5" />
        </div>
      )}
    </div>
  );
}
