"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TelegramLogin } from "@/components/telegram-login";

function TelegramLoginWrapper() {
  const [botName, setBotName] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/public");
        const data = await res.json();
        if (data.telegram_bot_username) {
          setBotName(data.telegram_bot_username.replace("@", ""));
        }
        setIsEnabled(data.telegram_enabled === "true");
      } catch (error) {
        console.error("Failed to load telegram settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleAuth = async (user: any) => {
    setError(null);
    try {
      const result = await signIn("telegram", {
        ...user,
        redirect: false,
      });
      if (result?.ok) {
        const params = new URLSearchParams(window.location.search);
        window.location.href = params.get("callbackUrl") || "/dashboard";
      } else if (result?.error) {
        setError("Telegram login failed. Please try again.");
        console.error("Telegram auth error:", result.error);
      }
    } catch (error) {
      setError("Telegram login failed. Please try again.");
      console.error("Telegram auth failed:", error);
    }
  };

  if (isLoading || !isEnabled || !botName) return null;

  return (
    <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <TelegramLogin botName={botName} onAuth={handleAuth} />
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || "/dashboard");
    }
  }, [status, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      // Fetch session to determine role for redirect
      const response = await fetch("/api/auth/[...nextauth]");
      // Fallback: redirect based on credential check
      // Since redirect: false, check the result
      if (!result?.error) {
        // We need to get the session to check role
        // Use a simple approach - fetch session data
        try {
          const sessionRes = await fetch("/api/auth/session");
          const session = await sessionRes.json();
          const callbackUrl = searchParams.get("callbackUrl");
          if (callbackUrl) {
            router.push(callbackUrl);
            return;
          }
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch {
          const callbackUrl = searchParams.get("callbackUrl");
          router.push(callbackUrl || "/dashboard");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center grid-pattern px-4 py-12">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-8"
        >
          {/* Logo */}
          <motion.div custom={1} variants={fadeUp} className="mb-8 flex flex-col items-center">
            <Link href="/" className="mb-6 flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl transition-all group-hover:shadow-lg group-hover:shadow-primary/25">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Tech<span className="text-primary">Serv</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account</p>
          </motion.div>

          {/* Form */}
          <motion.form custom={2} variants={fadeUp} onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </motion.form>

          {/* Footer Links */}
          <motion.div custom={3} variants={fadeUp} className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <TelegramLoginWrapper />

            <p className="text-center text-sm text-muted-foreground pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href={searchParams.get("callbackUrl") ? `/auth/signup?callbackUrl=${encodeURIComponent(searchParams.get("callbackUrl")!)}` : "/auth/signup"}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </motion.div>

          {/* Terms */}
          <motion.div custom={4} variants={fadeUp}>
            <p className="mt-6 text-center text-xs text-muted-foreground/70">
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer hover:text-muted-foreground transition-colors">
                Terms of Service
              </span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
