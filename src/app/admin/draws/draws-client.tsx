"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  Ticket,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  ExternalLink,
  ChevronRight,
  Loader2,
  Users,
  Award,
} from "lucide-react";

interface EntryItem {
  id: string;
  entryNumber: number;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface CampaignItem {
  id: string;
  title: string;
  slug: string;
  entryPrice: number;
  currency: string;
  maxEntries: number;
  endsAt: string;
  status: string;
  imageUrl: string | null;
  prizes: any[];
  validEntriesCount: number;
  pendingPaymentsCount: number;
  isCompleted: boolean;
  isReady: boolean;
  entries: EntryItem[];
  existingDraw?: any;
}

// Sound effects generator using Web Audio API
class SoundFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTick(frequency = 600) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playWin() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        gain.gain.setValueAtTime(0.2, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.6);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

export default function DrawsClient() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  // Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayTicket, setDisplayTicket] = useState<{ ticketNumber: string; userName: string } | null>(null);
  const [winnerResult, setWinnerResult] = useState<any | null>(null);
  const [drawError, setDrawError] = useState("");
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/draws/ready");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
        const readyOne = data.campaigns.find((c: CampaignItem) => c.isReady) || data.campaigns[0] || null;
        setSelectedCampaign(readyOne);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDraw = async () => {
    if (!selectedCampaign || isDrawing) return;
    if (selectedCampaign.validEntriesCount === 0) {
      setDrawError("Cannot draw: No valid tickets purchased for this campaign.");
      return;
    }
    if (selectedCampaign.pendingPaymentsCount > 0) {
      setDrawError(`Cannot draw: There are ${selectedCampaign.pendingPaymentsCount} pending payments waiting for approval.`);
      return;
    }

    setDrawError("");
    setIsDrawing(true);
    setWinnerResult(null);

    // Start visual fast roulette cycling
    const entries = selectedCampaign.entries;
    let speed = 40;
    let elapsed = 0;
    const duration = 4500; // 4.5 seconds

    const spinInterval = () => {
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      setDisplayTicket({
        ticketNumber: randomEntry.ticketNumber,
        userName: randomEntry.userName,
      });
      sfx.playTick(400 + Math.min(600, elapsed / 5));

      elapsed += speed;
      if (elapsed > duration * 0.6) {
        speed += 25; // Gradual deceleration
      } else if (elapsed > duration * 0.8) {
        speed += 60; // Final suspense slow-down
      }

      if (elapsed < duration) {
        timerRef.current = setTimeout(spinInterval, speed);
      }
    };

    spinInterval();

    // Make backend draw execution API call in parallel
    try {
      const res = await fetch("/api/admin/draws/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: selectedCampaign.id }),
      });
      const data = await res.json();

      // Wait for spin animation to finish
      const remainingTime = Math.max(0, duration - elapsed);
      setTimeout(() => {
        clearTimeout(timerRef.current);
        setIsDrawing(false);

        if (data.success && data.winner) {
          setDisplayTicket({
            ticketNumber: data.winner.ticketNumber,
            userName: data.winner.userName,
          });
          setWinnerResult(data.winner);
          sfx.playWin();
          // Update selected campaign status locally
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === selectedCampaign.id
                ? { ...c, status: "COMPLETED", isCompleted: true, isReady: false }
                : c
            )
          );
        } else {
          setDrawError(data.error || "Draw execution failed on server.");
        }
      }, remainingTime);
    } catch (err: any) {
      clearTimeout(timerRef.current);
      setIsDrawing(false);
      setDrawError("Network error occurred during draw.");
    }
  };

  const copyAnnouncementText = () => {
    if (!winnerResult) return;
    const text = `🎉 MILKYTECH DRAW WINNER ANNOUNCEMENT! 🎉\n\n🏆 Winner: ${winnerResult.userName}\n🎟️ Lucky Ticket: ${winnerResult.ticketNumber}\n🎁 Prize: ${winnerResult.prizeTitle}\n🎪 Campaign: ${winnerResult.campaignTitle}\n\n🔒 Provably Fair Verification Hash: ${winnerResult.snapshotHash}\n\nCongratulations to our winner! 🚀`;
    navigator.clipboard.writeText(text);
    setCopiedAnnouncement(true);
    setTimeout(() => setCopiedAnnouncement(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Live Draw Room...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Provably Fair Engine
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Draw Room</h1>
          <p className="text-sm text-slate-500">
            Select an active campaign, verify pre-draw requirements, and conduct a cryptographically verified random draw.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/winners"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Trophy className="w-4 h-4 text-emerald-600" /> View Winners
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Campaign Selection Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Select Campaign</h2>
            <span className="text-xs text-slate-400 font-medium">{campaigns.length} Total</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {campaigns.map((c) => {
              const isSelected = selectedCampaign?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (!isDrawing) {
                      setSelectedCampaign(c);
                      setWinnerResult(null);
                      setDrawError("");
                      setDisplayTicket(null);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                  } ${isDrawing ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{c.title}</h3>
                    {c.isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        COMPLETED
                      </span>
                    ) : c.isReady ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                        READY TO DRAW
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                        IN PROGRESS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.validEntriesCount} Valid Tickets</span>
                    </div>

                    {c.pendingPaymentsCount > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold ml-auto">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{c.pendingPaymentsCount} Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {campaigns.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No active campaigns found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Live Draw Arena */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCampaign ? (
            <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
              
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"></div>

              {/* Top Details & Pre-flight Checklist */}
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                      Selected Campaign
                    </span>
                    <h2 className="text-2xl font-black text-white mt-0.5">{selectedCampaign.title}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Grand Prize</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {selectedCampaign.prizes?.[0]?.title || selectedCampaign.title}
                    </span>
                  </div>
                </div>

                {/* Checklist Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Valid Entries</p>
                      <p className="text-sm font-black text-white">{selectedCampaign.validEntriesCount} Tickets</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      selectedCampaign.pendingPaymentsCount === 0
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {selectedCampaign.pendingPaymentsCount === 0 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Pending Payments</p>
                      <p className={`text-sm font-black ${
                        selectedCampaign.pendingPaymentsCount === 0 ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {selectedCampaign.pendingPaymentsCount === 0 ? "0 (Ready)" : `${selectedCampaign.pendingPaymentsCount} Pending`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Integrity</p>
                      <p className="text-sm font-black text-blue-400">SHA-256 Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Interactive Roulette Stage */}
              <div className="relative z-10 my-8 flex flex-col items-center justify-center text-center">
                
                {/* Winner Card Revealed */}
                {winnerResult ? (
                  <div className="w-full bg-gradient-to-b from-emerald-500/20 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 animate-in zoom-in-95 duration-500 shadow-2xl space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                      <Trophy className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        OFFICIAL WINNER SELECTED
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black text-white mt-3">
                        {winnerResult.userName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {winnerResult.userEmail || winnerResult.userPhone || "Verified MilkyTech User"}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 inline-flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-emerald-400" />
                      <span className="text-xl sm:text-2xl font-mono font-black text-emerald-300">
                        {winnerResult.ticketNumber}
                      </span>
                    </div>

                    {/* Telegram Notification Status */}
                    {winnerResult.telegramNotified && (
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                        <Send className="w-3.5 h-3.5" />
                        <span>Direct Telegram Bot winner notification sent</span>
                      </div>
                    )}

                    {/* Provably Fair Seed / Hash */}
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 text-left bg-slate-950/40 p-3 rounded-xl space-y-1">
                      <p className="text-[10px] text-slate-500 font-sans uppercase font-bold">Audit Proof</p>
                      <p className="truncate">HASH: {winnerResult.snapshotHash}</p>
                      <p className="truncate">SEED: {winnerResult.randomSeed}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                      <button
                        type="button"
                        onClick={copyAnnouncementText}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedAnnouncement ? "Copied to Clipboard!" : "Copy Announcement"}
                      </button>

                      <Link
                        href="/admin/winners"
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Go to Winners Portal
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Roulette Spinning Machine Display */
                  <div className={`w-full max-w-md bg-slate-950/80 rounded-3xl border-2 p-8 transition-all duration-300 ${
                    isDrawing
                      ? "border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/20"
                      : "border-slate-800"
                  }`}>
                    <div className="text-center space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {isDrawing ? "🎰 DRAWING RANDOM TICKET..." : "READY FOR DRAW"}
                      </span>

                      <div className="h-16 flex items-center justify-center overflow-hidden">
                        <span className={`text-3xl sm:text-4xl font-mono font-black transition-all ${
                          isDrawing ? "text-emerald-400 scale-105" : "text-slate-300"
                        }`}>
                          {displayTicket?.ticketNumber || (selectedCampaign.entries[0]?.ticketNumber ? `TKT-...` : "NO TICKETS")}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-400 h-5">
                        {displayTicket?.userName || "Click button below to initiate"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Trigger Controls */}
              <div className="relative z-10 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {drawError && (
                  <div className="text-xs text-red-400 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{drawError}</span>
                  </div>
                )}

                {!winnerResult && (
                  <div className="w-full flex justify-end">
                    {selectedCampaign.isCompleted ? (
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Draw already completed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartDraw}
                        disabled={isDrawing || !selectedCampaign.isReady}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all"
                      >
                        {isDrawing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Selecting Lucky Winner...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-slate-950" />
                            <span>START RANDOM DRAW</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-700">Select a campaign from the left list to begin the draw.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
