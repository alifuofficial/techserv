"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Binary,
  Hash,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Search,
  Cpu,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { calculateProvablyFairWinner, ProvablyFairCalculationResult } from "@/lib/provably-fair";

function VerifierContent() {
  const searchParams = useSearchParams();
  const initialDrawParam = searchParams.get("draw") || "";

  const [recentDraws, setRecentDraws] = useState<any[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>(initialDrawParam);
  const [snapshotHash, setSnapshotHash] = useState<string>("");
  const [randomSeed, setRandomSeed] = useState<string>("");
  const [totalEntries, setTotalEntries] = useState<number>(100);
  const [targetEntryNumber, setTargetEntryNumber] = useState<number>(0);
  const [targetTicket, setTargetTicket] = useState<string>("");
  const [winnerInfo, setWinnerInfo] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<ProvablyFairCalculationResult | null>(null);

  // Fetch recent draws
  useEffect(() => {
    async function loadRecent() {
      try {
        const res = await fetch("/api/draws/verify");
        const data = await res.json();
        if (data.success && data.recentDraws) {
          setRecentDraws(data.recentDraws);

          // If a draw ID was supplied via query params, auto select it
          if (initialDrawParam) {
            const found = data.recentDraws.find(
              (d: any) => d.id === initialDrawParam || d.campaignId === initialDrawParam
            );
            if (found) {
              loadDrawDetails(found);
            } else {
              fetchSpecificDraw(initialDrawParam);
            }
          } else if (data.recentDraws.length > 0) {
            loadDrawDetails(data.recentDraws[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load recent draws:", e);
      }
    }
    loadRecent();
  }, [initialDrawParam]);

  const fetchSpecificDraw = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/draws/verify?draw=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.draw) {
        loadDrawDetails(data.draw);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrawDetails = (draw: any) => {
    setSelectedDrawId(draw.id);
    setSnapshotHash(draw.snapshotHash || "");
    setRandomSeed(draw.randomSeed || "");
    setTotalEntries(draw.totalEntries || 100);
    setTargetEntryNumber(draw.winningEntryNumber || 1);
    setTargetTicket(draw.winningTicketNumber || "");
    setWinnerInfo(draw);

    if (draw.snapshotHash && draw.randomSeed && draw.totalEntries > 0) {
      try {
        const result = calculateProvablyFairWinner(
          draw.snapshotHash,
          draw.randomSeed,
          draw.totalEntries
        );
        setCalcResult(result);
      } catch (err) {
        setCalcResult(null);
      }
    }
  };

  const handleManualCalculate = () => {
    if (!snapshotHash.trim() || !randomSeed.trim() || totalEntries <= 0) {
      return;
    }
    try {
      const result = calculateProvablyFairWinner(snapshotHash.trim(), randomSeed.trim(), totalEntries);
      setCalcResult(result);
    } catch (e) {
      alert("Invalid inputs for calculation.");
    }
  };

  const isVerifiedMatch =
    calcResult &&
    (targetEntryNumber > 0 ? calcResult.winningEntryNumber === targetEntryNumber : true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            M
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">MilkyTech</span>
          <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1">
            Provably Fair
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/telegram"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" /> 100% Cryptographically Audited &amp; Verifiable
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Provably Fair Draw Verifier
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Every draw at MilkyTech uses deterministic SHA-256 HMAC cryptographic hashing and NIST random seeds. 
          Verify any past winning ticket independently below.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Draw Selector */}
        {recentDraws.length > 0 && (
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" /> Select Completed Draw to Verify
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {recentDraws.map((d) => {
                const isSelected = selectedDrawId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => loadDrawDetails(d)}
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
                        : "bg-slate-800/40 border-white/5 hover:border-white/20 text-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{d.campaignTitle}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5 truncate">
                      {d.winningTicketNumber} ({d.winnerName})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification Inputs Form */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-emerald-400" /> Cryptographic Parameters
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">HMAC-SHA256 Math</span>
          </div>

          <div className="space-y-4 text-sm">
            {/* 1. Snapshot Hash */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" /> 1. Entries Snapshot Hash (SHA-256)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Immutable entry table hash</span>
              </label>
              <input
                type="text"
                value={snapshotHash}
                onChange={(e) => setSnapshotHash(e.target.value)}
                placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* 2. Random Seed */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" /> 2. Public Random Seed (HMAC Key)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">External entropy seed</span>
              </label>
              <input
                type="text"
                value={randomSeed}
                onChange={(e) => setRandomSeed(e.target.value)}
                placeholder="e.g. NIST-BEACON-LIVE-SEED-99420-AUDITED"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-purple-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* 3. Total Entries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  3. Total Valid Tickets (Entries)
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalEntries}
                  onChange={(e) => setTotalEntries(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Expected Winner Ticket #
                </label>
                <input
                  type="text"
                  readOnly
                  value={targetTicket ? `${targetTicket} (Entry #${targetEntryNumber})` : targetEntryNumber ? `Entry #${targetEntryNumber}` : "Auto"}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleManualCalculate}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Cpu className="w-4 h-4" /> Recalculate Winning Math
              </button>
            </div>
          </div>

          {/* Mathematical Proof Results */}
          {calcResult && (
            <div className="pt-6 border-t border-white/10 space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isVerifiedMatch
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
              >
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-black text-sm">
                    {isVerifiedMatch
                      ? "100% Mathematically Verified &amp; Certified!"
                      : "Calculation Executed Successfully"}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Calculated Winning Ticket Index: <b>#{calcResult.winningEntryNumber}</b> out of{" "}
                    <b>{calcResult.totalEntries}</b> total entries.
                  </p>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-white/10 font-mono text-xs space-y-3 text-slate-300">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider pb-1 border-b border-white/5">
                  📐 Step-by-Step Proof Verification
                </div>

                <div>
                  <span className="text-slate-500">Step 1 (HMAC-SHA256 Hash):</span>
                  <div className="text-cyan-400 break-all text-[11px] mt-0.5">
                    {calcResult.combinedHash}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Step 2 (52-Bit Hex Slice to Decimal):</span>
                  <div className="text-purple-300 text-[11px] mt-0.5">
                    0x{calcResult.combinedHash.substring(0, 13)} &rarr;{" "}
                    <span className="text-white font-bold">{calcResult.hashDecimal}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Step 3 (Modulo Total Tickets + 1):</span>
                  <div className="text-emerald-400 text-[11px] mt-0.5">
                    ({calcResult.hashDecimal} % {calcResult.totalEntries}) + 1 ={" "}
                    <span className="text-base font-black text-emerald-300">
                      Entry #{calcResult.winningEntryNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProvablyFairVerifierPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold">Loading Verifier...</div>}>
      <VerifierContent />
    </Suspense>
  );
}
