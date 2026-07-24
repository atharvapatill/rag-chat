"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Document } from "@/types/document";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "@/components/chat/upload-zone";
import { DocumentList } from "@/components/chat/document-list";
import { useDocuments } from "@/hooks/use-documents";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";

export function DocumentSidebar() {
  const { documents, loading, reload } = useDocuments();
  const { state } = useSidebar();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress(0);
      setUploadingName(file.name);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 85));
      }, 200);

      try {
        const formData = new FormData();
        formData.append("file", file);

        await apiFetch("/files/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);
        toast.success(`${file.name} uploaded.`);
        await reload();
      } catch (err) {
        clearInterval(progressInterval);
        toast.error(
          err instanceof Error ? err.message : "Upload failed. Please try again.",
        );
      } finally {
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setUploadingName(null);
        }, 600);
      }
    },
    [reload],
  );

  const handleDelete = useCallback(
    async (doc: Document) => {
      try {
        await apiFetch(`/files/${doc.file_id}`, { method: "DELETE" });
        toast.success(`${doc.filename} deleted.`);
        await reload();
      } catch {
        toast.error("Failed to delete document.");
      }
    },
    [reload],
  );

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "h-14 flex-row items-center border-b border-sidebar-border transition-all",
          isCollapsed ? "justify-center px-0" : "justify-start px-3",
        )}
      >
        <Logo showText={!isCollapsed} size="sm" className="text-sidebar-foreground" />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <div className={isCollapsed ? "flex justify-center p-2" : "p-3"}>
          <UploadZone
            onUpload={handleUpload}
            uploading={uploading}
            progress={uploadProgress}
            uploadingName={uploadingName}
            compact={isCollapsed}
          />
        </div>

        {!isCollapsed && <SidebarSeparator className="mx-0" />}

        <SidebarGroup className="p-0">
          {!isCollapsed && (
            <SidebarGroupLabel className="flex h-9 items-center justify-between px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
              <span>Library</span>
              <Badge
                variant="secondary"
                className="h-4 rounded-full px-1.5 font-mono text-[10px] tabular-nums"
              >
                {documents.length}
              </Badge>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <DocumentList
              documents={documents}
              loading={loading}
              onDelete={handleDelete}
              collapsed={isCollapsed}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
