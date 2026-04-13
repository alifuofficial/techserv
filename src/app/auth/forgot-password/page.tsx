"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, Zap, Send, Smartphone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [step, setStep] = useState<"email" | "transport">("email");
  const [transport, setTransport] = useState<"email" | "telegram">("email");

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, step: "check" }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.hasTelegram) {
          setHasTelegram(true);
          setStep("transport");
        } else {
          // No telegram, go straight to sending email OTP
          await handleSendCode("email");
        }
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (selectedTransport?: "email" | "telegram") => {
    const finalTransport = selectedTransport || transport;
    setError("");
    
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, transport: finalTransport }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 5000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center grid-pattern px-4 py-12">
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
          <motion.div custom={1} variants={fadeUp} className="mb-8 flex flex-col items-center">
            <Link href="/" className="mb-6 flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl transition-all group-hover:shadow-lg group-hover:shadow-primary/25">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Tech<span className="text-primary">Serv</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reset Password</h1>
            <p className="mt-1.5 text-sm text-muted-foreground text-center">Enter your email and we'll send you a reset code</p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                {transport === "telegram" ? (
                  <Send className="h-8 w-8 text-emerald-500" />
                ) : (
                  <Mail className="h-8 w-8 text-emerald-500" />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Code Sent Successfully</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent a 6-digit reset code to your {transport === "telegram" ? "Telegram Bot" : "Email Address"}.
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-50/50">
                    {transport === "telegram" ? "TELEGRAM_DELIVERY" : "EMAIL_DELIVERY"}
                  </Badge>
                </div>
              </div>
              <Button asChild className="w-full mt-2 h-11 rounded-xl shadow-lg shadow-primary/20">
                <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
                  Enter Code Manually
                </Link>
              </Button>
            </motion.div>
          ) : step === "transport" ? (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">Where should we send your code?</p>
                <p className="text-xs text-muted-foreground">We detected a linked Telegram account.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setTransport("email")}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    transport === "email"
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-border/40 hover:border-border/80 bg-muted/20"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${transport === "email" ? "bg-primary/20" : "bg-muted"}`}>
                    <Mail className={`h-5 w-5 ${transport === "email" ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Send to Email</p>
                    <p className="text-[10px] text-muted-foreground">{email.replace(/(.{3})(.*)(@.*)/, "$1***$3")}</p>
                  </div>
                </button>

                <button
                  onClick={() => setTransport("telegram")}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    transport === "telegram"
                      ? "border-sky-500 bg-sky-500/5 ring-4 ring-sky-500/10"
                      : "border-border/40 hover:border-border/80 bg-muted/20"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${transport === "telegram" ? "bg-sky-500/20" : "bg-muted"}`}>
                    <Send className={`h-5 w-5 ${transport === "telegram" ? "text-sky-500" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Send to Telegram Bot</p>
                    <p className="text-[10px] text-muted-foreground">MilkyTech.Online Bot</p>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("email")} className="flex-1 h-11 rounded-xl">
                  Back
                </Button>
                <Button onClick={() => handleSendCode()} disabled={isLoading} className="flex-1 h-11 rounded-xl font-bold">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-medium text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className="h-12 pl-10 rounded-xl bg-muted/30 border-border/40 focus:border-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Account...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <div className="pt-2">
                <Button variant="ghost" asChild className="w-full h-11 gap-2 rounded-xl text-muted-foreground hover:text-foreground">
                  <Link href="/auth/signin">
                    <ArrowLeft className="h-4 w-4" /> Back to Sign In
                  </Link>
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
