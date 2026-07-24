"use client";

import { useState } from "react";
import { FileTextIcon, Trash2Icon } from "lucide-react";

import type { Document } from "@/types/document";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onDelete: (doc: Document) => Promise<void>;
  collapsed?: boolean;
}

export function DocumentList({
  documents,
  loading,
  onDelete,
  collapsed = false,
}: DocumentListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className={cn("py-1", collapsed ? "px-1" : "px-2")}>
        {loading ? (
          <div className="flex flex-col gap-1.5 px-1 py-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          !collapsed && (
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
              <div className="flex size-8 items-center justify-center rounded-md border border-dashed border-sidebar-border bg-sidebar">
                <FileTextIcon className="size-4 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground/70">
                No documents yet
              </p>
              <p className="max-w-[180px] font-mono text-[10px] uppercase tracking-wider text-muted-foreground/40">
                Drop a PDF above to start
              </p>
            </div>
          )
        ) : (
          <SidebarMenu>
            {documents.map((doc) => (
              <DocumentListItem key={doc.file_id} doc={doc} onDelete={onDelete} />
            ))}
          </SidebarMenu>
        )}
      </div>
    </ScrollArea>
  );
}

interface DocumentListItemProps {
  doc: Document;
  onDelete: (doc: Document) => Promise<void>;
}

function DocumentListItem({ doc, onDelete }: DocumentListItemProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await onDelete(doc);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={doc.filename}
        className={cn(
          "group/item h-9 gap-2.5 rounded-md text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active]:bg-sidebar-accent data-[active]:text-sidebar-foreground",
          deleting && "pointer-events-none opacity-40",
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded border border-sidebar-border bg-sidebar text-sidebar-foreground/70">
          <FileTextIcon className="size-3" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] leading-tight">
            {doc.filename}
          </span>
          <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
            {formatDate(doc.uploaded_at)}
          </span>
        </span>
      </SidebarMenuButton>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <SidebarMenuAction
              showOnHover
              className="text-muted-foreground/0 transition-colors group-hover/item:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/50"
              disabled={deleting}
              aria-label={`Delete ${doc.filename}`}
            >
              <Trash2Icon className="size-3.5" />
            </SidebarMenuAction>
          }
        />
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">{doc.filename}</span>{" "}
              and all its indexed data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
