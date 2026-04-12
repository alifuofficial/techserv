"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, CheckCircle2, UserPlus, ShieldAlert, Users, Send } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TelegramLogin } from "@/components/telegram-login";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
      if (result?.ok && result?.url) {
        window.location.href = "/dashboard";
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
    <div className="flex flex-col items-center gap-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <TelegramLogin botName={botName} onAuth={handleAuth} />
    </div>
  );
}

function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({
    registration_enabled: "true",
    referral_system_enabled: "true"
  });

  useEffect(() => {
    // Check initial ref code from URL
    const urlRef = searchParams.get("ref");
    if (urlRef) setRefCode(urlRef);

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load public settings", err);
      } finally {
        setSettingsLoading(false);
      }
    }
    fetchSettings();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          referralCode: refCode || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      if (data.requiresVerification) {
        setShowOtp(true);
        toast({
          title: "Verification required",
          description: "We've sent a 6-digit code to your email.",
        });
        return;
      }

      toast({
        title: "Account created successfully!",
        description: "Please sign in to continue.",
      });

      router.push("/auth/signin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center grid-pattern px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-[440px] rounded-[32px] border border-border/40 bg-card/60 p-8 shadow-2xl backdrop-blur-2xl sm:p-10"
        >
          <div className="mb-10 text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Verify Email</h1>
            <p className="text-sm text-muted-foreground font-medium">We sent a 6-digit code to <span className="text-foreground font-bold">{email}</span></p>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            if (otp.length !== 6) {
              setError("Please enter a 6-digit code.");
              return;
            }
            try {
              setOtpLoading(true);
              const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Verification failed");
              
              toast({
                title: "Email verified!",
                description: "Your account is now active. Please sign in.",
              });
              router.push("/auth/signin");
            } catch (err: any) {
              setError(err.message);
            } finally {
              setOtpLoading(false);
            }
          }} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2 text-center">
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-16 text-center text-3xl font-black tracking-[10px] rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                disabled={otpLoading}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Code</p>
            </div>

            <Button
              type="submit"
              disabled={otpLoading}
              className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Activate"}
            </Button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  toast({ title: "OTP Resent", description: "Please check your inbox again." });
                  // Add logic here to trigger resend API if needed
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Resend code
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Registration Disabled State
  if (settings.registration_enabled === "false") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight italic">Registration Closed</h2>
            <p className="text-muted-foreground text-sm">
              New user registration is currently disabled by the administrator. Please check back later or contact support if you believe this is an error.
            </p>
          </div>
          <div className="pt-4">
            <Button asChild className="w-full rounded-xl h-11 font-bold">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center grid-pattern px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-[440px]"
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          className="rounded-[32px] border border-border/40 bg-card/60 p-8 shadow-2xl shadow-primary/5 backdrop-blur-2xl sm:p-10"
        >
          {/* Header */}
          <div className="mb-10 text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl transition-all group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-primary/20">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <span className="text-3xl font-black tracking-tighter">
                Tech<span className="text-primary italic">Serv</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground font-medium">Join our premium service marketplace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive flex items-center gap-2"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative group">
                    <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input
                      id="name"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="h-12 pl-10 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Identity</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                  />
                </div>

                {/* Optional Referral Code */}
                {settings.referral_system_enabled === "true" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="refCode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Referral Code</Label>
                      <span className="text-[9px] font-bold text-primary/60 italic">Optional</span>
                    </div>
                    <div className="relative group">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50" />
                      <Input
                        id="refCode"
                        placeholder="REF-XXXX"
                        value={refCode}
                        onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                        disabled={isLoading}
                        className="h-12 pl-10 rounded-xl bg-emerald-500/5 border-emerald-500/10 focus:border-emerald-500/30 transition-all font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Join Platform"
              )}
            </Button>
          </form>

          {/* Social / Alternatives */}
          <div className="mt-8 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-card px-3 text-muted-foreground">Alternative Access</span>
              </div>
            </div>

            <TelegramLoginWrapper />

            <div className="text-center">
              <p className="text-sm text-muted-foreground font-medium">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-black text-primary hover:text-primary/80 transition-all"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
            By joining, you agree to our <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
