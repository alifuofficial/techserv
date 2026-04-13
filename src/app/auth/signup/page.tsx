"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Users,
  Send,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Check,
  X,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const steps = [
  { id: 1, title: "Account", icon: User },
  { id: 2, title: "Telegram", icon: MessageCircle },
  { id: 3, title: "Confirm", icon: CheckCircle2 },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-emerald-500 text-white"
                  : currentStep === step.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${currentStep > step.id ? "bg-emerald-500" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ data, onChange, onNext }: { data: any; onChange: (d: any) => void; onNext: () => void }) {
  const [showPassword, setShowPassword] = useState(false);

  const canProceed = data.name && data.email && validateEmail(data.email) && data.password.length >= 6 && data.password === data.confirmPassword;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Account Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Let's start with the basics</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="pl-10 h-12 rounded-xl bg-muted/30 border-border/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="john@example.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="pl-10 h-12 rounded-xl bg-muted/30 border-border/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="pl-10 pr-10 h-12 rounded-xl bg-muted/30 border-border/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Repeat your password"
              value={data.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              className={`pl-10 h-12 rounded-xl bg-muted/30 border-border/40 ${
                data.confirmPassword && data.password !== data.confirmPassword ? "border-red-500/50" : ""
              }`}
            />
          </div>
          {data.confirmPassword && data.password !== data.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
          )}
        </div>
      </div>

      <Button onClick={onNext} disabled={!canProceed} className="w-full h-12 rounded-xl font-semibold mt-6">
        Continue <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );
}

function Step2({ data, onChange, onNext, onBack }: { data: any; onChange: (d: any) => void; onNext: () => void; onBack: () => void }) {
  const [hasTelegram, setHasTelegram] = useState<boolean | null>(data.hasTelegram);

  const handleTelegramChoice = (has: boolean) => {
    setHasTelegram(has);
    onChange({ hasTelegram: has, telegram: has ? data.telegram : "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Telegram Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Connect your Telegram for faster updates</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-center">Do you have a Telegram account?</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTelegramChoice(true)}
            className={`p-4 rounded-xl border-2 transition-all ${
              hasTelegram === true
                ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                : "border-border/40 bg-muted/30 hover:border-border"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${hasTelegram === true ? "bg-sky-500/20" : "bg-muted"}`}>
                <Send className={`h-5 w-5 ${hasTelegram === true ? "text-sky-500" : "text-muted-foreground"}`} />
              </div>
              <span className="font-semibold text-sm">Yes, I do</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTelegramChoice(false)}
            className={`p-4 rounded-xl border-2 transition-all ${
              hasTelegram === false
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border/40 bg-muted/30 hover:border-border"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${hasTelegram === false ? "bg-emerald-500/20" : "bg-muted"}`}>
                <X className={`h-5 w-5 ${hasTelegram === false ? "text-emerald-500" : "text-muted-foreground"}`} />
              </div>
              <span className="font-semibold text-sm">No, skip</span>
            </div>
          </button>
        </div>

        <AnimatePresence>
          {hasTelegram === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <Label className="text-xs font-semibold text-muted-foreground">Telegram Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                <Input
                  placeholder="username"
                  value={data.telegram.replace("@", "")}
                  onChange={(e) => onChange({ telegram: "@" + e.target.value.replace("@", "") })}
                  className="pl-8 h-12 rounded-xl bg-muted/30 border-border/40 font-mono"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">We'll use this to send order updates</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} disabled={hasTelegram === null} className="flex-1 h-12 rounded-xl font-semibold">
          Continue <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function StepOtp({ 
  email, 
  value, 
  onChange, 
  onVerify, 
  onBack, 
  isLoading 
}: { 
  email: string; 
  value: string; 
  onChange: (v: string) => void; 
  onVerify: () => void; 
  onBack: () => void; 
  isLoading: boolean 
}) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast({ title: "Code Resent", description: "A new code has been sent to your email." });
        setCountdown(60);
        setCanResend(false);
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to resend code.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold italic tracking-tight uppercase">Verify Humanity</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit synchronization code sent to <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 py-4">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={onChange}
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
        
        <p className="text-xs text-muted-foreground text-center">
          Didn't receive the code?{" "}
          <button 
            onClick={handleResend}
            disabled={!canResend}
            className={`font-semibold transition-colors ${canResend ? "text-primary hover:underline cursor-pointer" : "text-muted-foreground/50 cursor-not-allowed"}`}
          >
            {canResend ? "Resend Code" : `Resend in ${countdown}s`}
          </button>
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1 h-12 rounded-xl">
          Go Back
        </Button>
        <Button 
          onClick={onVerify} 
          disabled={value.length !== 6 || isLoading} 
          className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
        </Button>
      </div>
    </motion.div>
  );
}

function Step3({ data, onChange, onBack, onSubmit, isLoading }: { data: any; onChange: (d: any) => void; onBack: () => void; onSubmit: () => void; isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Almost There!</h2>
        <p className="text-sm text-muted-foreground mt-1">Review your details</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-sm text-muted-foreground">Name</span>
          <span className="text-sm font-semibold">{data.name}</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="text-sm font-semibold">{data.email}</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-sm text-muted-foreground">Telegram</span>
          <span className="text-sm font-semibold">{data.hasTelegram && data.telegram ? data.telegram : "Not provided"}</span>
        </div>
      </div>

      {data.referralCode && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-600 dark:text-emerald-400">Referral Code</span>
            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{data.referralCode}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} className="flex-1 h-12 rounded-xl font-semibold">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </div>
    </motion.div>
  );
}

function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [direction, setDirection] = useState(1);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    hasTelegram: null as boolean | null,
    telegram: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [linkData, setLinkData] = useState<{ deepLink: string; botUsername: string } | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({
    registration_enabled: "true",
    referral_system_enabled: "true",
  });

  useEffect(() => {
    const urlRef = searchParams.get("ref");
    if (urlRef) setFormData((prev) => ({ ...prev, referralCode: urlRef }));

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load public settings", err);
      }
    }
    fetchSettings();
  }, [searchParams]);
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const updateData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          telegram: formData.hasTelegram ? formData.telegram : null,
          referralCode: formData.referralCode || null,
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
          title: "Verification Required",
          description: "Please enter the code sent to your email.",
        });
        return;
      }

      toast({
        title: "Account created!",
        description: "Please sign in to continue.",
      });

      const callbackUrl = searchParams.get("callbackUrl");
      const signInUrl = callbackUrl ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/signin";
      router.push(signInUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed.");
        return;
      }

      toast({
        title: "Verified!",
        description: "Your account is now active.",
      });

      // Instead of redirecting, show success and linking options
      try {
        const linkRes = await fetch("/api/user/telegram-link");
        if (linkRes.ok) {
          const lData = await linkRes.json();
          setLinkData(lData);
        }
      } catch (err) {
        console.error("Failed to generate link", err);
      }

      setShowSuccess(true);
      setShowOtp(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification error.");
    } finally {
      setVerifying(false);
    }
  };

  if (settings.registration_enabled === "false") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border/40 bg-card">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Registration Closed</h2>
            <p className="text-sm text-muted-foreground">New user registration is currently disabled. Please check back later.</p>
          </div>
          <Button asChild className="w-full rounded-xl h-11">
            <Link href="/">Return to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border/40 bg-card/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          {/* Logo as Title */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Milky<span className="text-primary">Tech.Online</span>
              </span>
            </Link>
          </div>

          <StepIndicator currentStep={step} />

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold italic tracking-tight">VAMOS!</h2>
                  <p className="text-sm text-muted-foreground">Your account is active. One final (and highly recommended) step:</p>
                </div>

                <div className="p-5 rounded-2xl bg-sky-500/5 border border-sky-500/20 text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Send className="h-3 w-3 text-sky-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-sky-500">Connect Telegram Bot</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Receive instant order updates, secure OTPs, and fast password recovery.</p>
                    </div>
                  </div>

                  <Button 
                    asChild
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl h-11 shadow-lg shadow-sky-500/20"
                  >
                    <a href={linkData?.deepLink} target="_blank" rel="noopener noreferrer">
                      <Send className="h-4 w-4 mr-2" />
                      Connect @{linkData?.botUsername || "MilkyTechBot"}
                    </a>
                  </Button>
                </div>

                <div className="pt-2">
                  <Button variant="ghost" asChild className="text-muted-foreground text-xs hover:text-foreground">
                    <Link href={searchParams.get("callbackUrl") || "/auth/signin"}>
                      {searchParams.get("callbackUrl") ? "Continue to Order" : "Skip and Sign In"}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : showOtp ? (
              <StepOtp 
                key="otp" 
                email={formData.email} 
                value={otp} 
                onChange={setOtp} 
                onVerify={handleVerifyOtp} 
                onBack={() => setShowOtp(false)}
                isLoading={verifying}
              />
            ) : (
              <>
                {step === 1 && <Step1 key="step1" data={formData} onChange={updateData} onNext={nextStep} />}
                {step === 2 && <Step2 key="step2" data={formData} onChange={updateData} onNext={nextStep} onBack={prevStep} />}
                {step === 3 && <Step3 key="step3" data={formData} onChange={updateData} onBack={prevStep} onSubmit={handleSubmit} isLoading={isLoading} />}
              </>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            By joining, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
