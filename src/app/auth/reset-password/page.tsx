"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ArrowLeft, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(data.error || "Reset failed. Please check your code and try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <motion.div custom={1} variants={fadeUp} className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl transition-all group-hover:shadow-lg group-hover:shadow-primary/25">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Tech<span className="text-primary">Serv</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Set New Password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground text-center">Complete the steps below to reset your account</p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Password Reset!</h3>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully updated.
              </p>
              <p className="text-xs text-muted-foreground pt-2">Redirecting to sign in...</p>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/auth/signin">Sign In Now</Link>
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium text-center block">6-Digit Reset Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <InputOTPSlot
                        key={idx}
                        index={idx}
                        className="w-10 h-12 rounded-xl border-2 border-border/40 bg-muted/30 text-lg font-bold transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                Sent to {email || "your email"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <Button variant="ghost" asChild className="w-full h-11 gap-2">
              <Link href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}>
                <ArrowLeft className="h-4 w-4" /> Resend Code
              </Link>
            </Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center grid-pattern px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
