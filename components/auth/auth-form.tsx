"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon, ArrowRightIcon } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        toast.success("Account created. Please log in.");
        router.push("/login");
      } else {
        await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        toast.success("Signed in.");
        router.push("/chat");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-aurora" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size="lg" />
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {isSignup ? "Create account" : "Welcome back"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isSignup ? "Start chatting with your PDFs" : "Sign in to DocChat"}
            </h1>
          </div>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-xl shadow-black/5 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSignup
                ? "Enter your details to get started"
                : "Enter your credentials to continue"}
            </CardTitle>
            <CardDescription className="sr-only">
              {isSignup ? "Sign up form" : "Log in form"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 border-destructive/40 bg-destructive/10 text-destructive"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form id="auth-form" onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                {isSignup && (
                  <Field
                    data-invalid={
                      confirmPassword.length > 0 &&
                      confirmPassword !== password
                        ? true
                        : undefined
                    }
                  >
                    <FieldLabel htmlFor="confirm-password">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      aria-invalid={
                        confirmPassword.length > 0 &&
                        confirmPassword !== password
                          ? true
                          : undefined
                      }
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    {confirmPassword.length > 0 &&
                      confirmPassword !== password && (
                        <FieldError>Passwords do not match.</FieldError>
                      )}
                  </Field>
                )}
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              form="auth-form"
              className="group/w-full w-full"
              disabled={loading}
            >
              {loading && (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              )}
              <span>{isSignup ? "Create account" : "Sign in"}</span>
              {!loading && (
                <ArrowRightIcon
                  data-icon="inline-end"
                  className="size-4 transition-transform group-hover/w-[&_svg]:translate-x-0.5"
                />
              )}
            </Button>

            <div className="relative w-full">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                or
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-accent-foreground"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New to DocChat?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-accent-foreground"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Retrieval · Augmented · Generation
        </p>
      </div>
    </div>
  );
}
