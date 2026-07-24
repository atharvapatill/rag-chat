import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in — RAG Chat",
  description: "Log in to your RAG Chat account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
