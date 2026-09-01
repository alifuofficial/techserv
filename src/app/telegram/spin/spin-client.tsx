"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Gift,
  Trophy,
  Coins,
  Ticket,
  Percent,
  Smile,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface SpinPrizeSlice {
  id: string;
  title: string;
  type: string;
  value: number;
  weight: number;
  color: string;
  icon?: string;
}

interface SpinStatusData {
  enabled: boolean;
  eligible: boolean;
  cooldownHours: number;
  nextSpinInSeconds: number;
  lastSpinAt: string | null;
  prizes: SpinPrizeSlice[];
  user?: {
    id: string;
    name: string;
    balance: number;
  };
}

export default function LuckySpinClient() {
  const [data, setData] = useState<SpinStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState<SpinPrizeSlice | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Fetch initial eligibility & prize slices
  const loadSpinStatus = async () => {
    try {
      const res = await fetchTelegramApi("/api/telegram/spin/status");
      if (res.ok && res.data.success) {
        setData(res.data);
        setCountdown(res.data.nextSpinInSeconds || 0);
        if (res.data.user?.balance !== undefined) {
          setWalletBalance(res.data.user.balance);
        }
      }
    } catch (e) {
      console.error("Failed to load spin status:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpinStatus();
  }, []);

  // 2. Countdown timer for cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          loadSpinStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const prizes = data?.prizes || [];

  // 3. Draw the Lucky Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 14;
    const numSlices = prizes.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, size, size);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#0D1424";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#10B981";
    ctx.stroke();

    // Slices
    prizes.forEach((prize, i) => {
      const angle = i * sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = prize.color || "#10B981";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0B0F19";
      ctx.stroke();

      // Text and Icon
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(prize.title, radius - 20, 5);
      ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#0F172A";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#F59E0B";
    ctx.stroke();

    // Center Gold Star
    ctx.beginPath();
    ctx.arc(center, center, 14, 0, 2 * Math.PI);
    ctx.fillStyle = "#F59E0B";
    ctx.fill();
  }, [prizes]);

  // 4. Handle Free Spin Trigger
  const handleSpin = async () => {
    if (spinning || !data?.eligible || countdown > 0) return;

    setSpinning(true);
    setWonPrize(null);

    // Haptic feedback for Telegram Mini App
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("heavy");
    }

    try {
      const res = await fetchTelegramApi("/api/telegram/spin/execute", {
        method: "POST",
      });

      if (!res.ok || !res.data.success) {
        throw new Error(res.data?.error || "Spin failed");
      }

      const { sliceIndex, prize, newBalance } = res.data;
      const numSlices = prizes.length;
      const sliceAngleDeg = 360 / numSlices;

      // The indicator is at the top (270 deg or -90 deg).
      // Calculate rotation so target slice lands at the top needle:
      const sliceCenterDeg = sliceIndex * sliceAngleDeg + sliceAngleDeg / 2;
      const targetDeg = 270 - sliceCenterDeg;
      const fullRotations = 360 * 5; // 5 full spins
      const finalAngle = fullRotations + targetDeg;

      setRotationAngle(finalAngle);

      // Wait for 4.5s spin animation
      setTimeout(() => {
        setSpinning(false);
        setWonPrize(prize);
        setShowWinModal(true);
        if (newBalance !== undefined) {
          setWalletBalance(newBalance);
        }
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred("success");
        }
        loadSpinStatus();
      }, 4500);
    } catch (err: any) {
      alert(err.message || "Failed to spin. Please try again.");
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-white pb-24 selection:bg-emerald-500/30">
      
      {/* Background Cyber Ambient Lights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* Header */}
        <div className="px-5 pt-12 pb-3 flex justify-between items-center sticky top-0 bg-[#070A11]/85 backdrop-blur-xl z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link
              href="/telegram"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all shadow-inner"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> 100% Free Daily Gift
                </span>
              </div>
              <h1 className="text-base font-extrabold text-white leading-tight mt-0.5">
                Daily Lucky Spin
              </h1>
            </div>
          </div>

          {/* User Vault Balance Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              {walletBalance.toFixed(2)} ETB
            </span>
          </div>
        </div>

        <div className="px-5 space-y-6 mt-4">
          
          {/* Wheel Hero Container */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            
            {/* Top Indicator Needle */}
            <div className="absolute top-0 z-30 flex flex-col items-center">
              <div className="w-6 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-b-full shadow-xl shadow-amber-500/50 border-2 border-white transform -translate-y-1"></div>
            </div>

            {/* Rotating Wheel Canvas */}
            <div className="relative w-80 h-80 sm:w-88 sm:h-88 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                className="w-full h-full rounded-full shadow-2xl shadow-emerald-950/80 transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0.95,0.3,1.0)]"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                }}
              />
            </div>

            {/* Glowing Spin Button / Cooldown HUD */}
            <div className="w-full max-w-sm mt-6">
              {data?.eligible && countdown <= 0 ? (
                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-500 hover:to-orange-600 text-slate-950 shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-300/60 disabled:opacity-75"
                >
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>{spinning ? "Spinning Wheel..." : "SPIN FOR FREE (1 Daily)"}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Next Free Spin Available In</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-300 tracking-wider">
                    {formatTime(countdown)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Come back tomorrow for your next guaranteed free bonus credit!
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Prize Pool Highlights */}
          <div className="bg-[#0D1424] border border-slate-800 rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" /> Daily Prize Slices
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Guaranteed Fair
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {prizes.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2.5"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {p.type === "BONUS_CREDIT" ? "Direct Wallet ETB" : p.type === "FREE_TICKET" ? "Free Draw Ticket" : "Daily Reward"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instant Mini Draws Callout */}
          <Link
            href="/telegram/instant"
            className="block p-4 bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-purple-950/60 rounded-3xl border border-purple-500/30 shadow-lg shadow-purple-950/40 group active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 fill-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>⚡ Play Instant 5-Minute Draws</span>
                    <span className="text-[9px] font-black bg-purple-500 text-white px-1.5 py-0.2 rounded uppercase">HOT</span>
                  </h4>
                  <p className="text-[11px] text-purple-200/80 mt-0.5">
                    Use your bonus credits for fast 100-ticket cash drops!
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* 5. Win Celebration Modal */}
      {showWinModal && wonPrize && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-gradient-to-b from-[#111A2E] to-[#0A0F1D] border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-amber-500/20 animate-in zoom-in-95 relative overflow-hidden">
            
            {/* Ambient gold glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                🎉 LUCKY SPIN REWARD
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                {wonPrize.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {wonPrize.value > 0
                  ? `+${wonPrize.value} ETB credited to your Vault Balance!`
                  : "Thanks for playing! Come back in 24 hours for your next free spin."}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/telegram/instant"
                onClick={() => setShowWinModal(false)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-emerald-400" />
                <span>Enter Instant Mini Draw</span>
              </Link>
              <button
                onClick={() => setShowWinModal(false)}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs transition-colors"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
