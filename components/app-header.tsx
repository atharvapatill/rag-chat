"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOutIcon, ChevronDownIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ email: string }>("/auth/me")
      .then((data) => setEmail(data.email))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      localStorage.removeItem("chat_messages");
      toast.success("Signed out.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Sign out failed. Please try again.");
    }
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : "··";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4 opacity-40" />

      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-foreground/80">
          Chat
        </span>
        <span className="size-1 rounded-full bg-ring/50" aria-hidden />
        <span className="hidden text-[13px] text-muted-foreground sm:inline">
          Retrieval-Augmented answers from your PDFs
        </span>
      </div>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="User menu"
            />
          }
        >
          <Avatar className="size-6 ring-1 ring-border">
            <AvatarFallback className="bg-accent/60 text-[11px] font-semibold text-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {email && (
            <span className="hidden max-w-[180px] truncate text-[13px] sm:block">
              {email}
            </span>
          )}
          <ChevronDownIcon className="size-3 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {email && (
            <>
              <div className="px-2 py-1.5">
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {email}
                </p>
              </div>
              <Separator className="my-1" />
            </>
          )}
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOutIcon className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
