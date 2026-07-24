import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { DocumentSidebar } from "@/components/chat/document-sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Chat — DocChat",
  description: "Chat with your uploaded documents.",
};

export default function ChatPage() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        <DocumentSidebar />
        <SidebarInset className="flex min-h-0 min-w-0 flex-col">
          <AppHeader />
          <ChatPanel />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
