import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign up — RAG Chat",
  description: "Create a new RAG Chat account.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
