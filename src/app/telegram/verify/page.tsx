"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Binary,
  Hash,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Cpu,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { calculateProvablyFairWinner, ProvablyFairCalculationResult } from "@/lib/provably-fair";

function TelegramVerifierContent() {
  const searchParams = useSearchParams();
  const initialDrawParam = searchParams.get("draw") || "";

  const [recentDraws, setRecentDraws] = useState<any[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>(initialDrawParam);
  const [snapshotHash, setSnapshotHash] = useState<string>("");
  const [randomSeed, setRandomSeed] = useState<string>("");
  const [totalEntries, setTotalEntries] = useState<number>(100);
  const [targetEntryNumber, setTargetEntryNumber] = useState<number>(0);
  const [targetTicket, setTargetTicket] = useState<string>("");

  const [calcResult, setCalcResult] = useState<ProvablyFairCalculationResult | null>(null);

  useEffect(() => {
    async function loadRecent() {
      try {
        const res = await fetch("/api/draws/verify");
        const data = await res.json();
        if (data.success && data.recentDraws) {
          setRecentDraws(data.recentDraws);
          if (initialDrawParam) {
            const found = data.recentDraws.find(
              (d: any) => d.id === initialDrawParam || d.campaignId === initialDrawParam
            );
            if (found) {
              loadDrawDetails(found);
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

  const loadDrawDetails = (draw: any) => {
    setSelectedDrawId(draw.id);
    setSnapshotHash(draw.snapshotHash || "");
    setRandomSeed(draw.randomSeed || "");
    setTotalEntries(draw.totalEntries || 100);
    setTargetEntryNumber(draw.winningEntryNumber || 1);
    setTargetTicket(draw.winningTicketNumber || "");

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
    if (!snapshotHash.trim() || !randomSeed.trim() || totalEntries <= 0) return;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 px-4 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <Link
          href="/telegram"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
          <ShieldCheck className="w-4 h-4" /> Provably Fair
        </div>
      </div>

      <div className="space-y-4">
        {/* Header Title */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 text-center space-y-1">
          <h1 className="text-lg font-black text-white">Provably Fair Draw Verifier</h1>
          <p className="text-[11px] text-slate-400">
            Verify winning ticket numbers mathematically with SHA-256 HMAC cryptographic hashing.
          </p>
        </div>

        {/* Draw Picker */}
        {recentDraws.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Completed Draw
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {recentDraws.map((d) => {
                const isSelected = selectedDrawId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => loadDrawDetails(d)}
                    type="button"
                    className={`shrink-0 px-3 py-2 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500 text-white font-bold"
                        : "bg-slate-900 border-white/10 text-slate-400"
                    }`}
                  >
                    <div className="truncate max-w-[140px]">{d.campaignTitle}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{d.winningTicketNumber}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3 text-cyan-400" /> Snapshot Hash (SHA-256)
            </label>
            <input
              type="text"
              value={snapshotHash}
              onChange={(e) => setSnapshotHash(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-400" /> Public Random Seed
            </label>
            <input
              type="text"
              value={randomSeed}
              onChange={(e) => setRandomSeed(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 font-mono text-[11px] text-purple-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Total Tickets
              </label>
              <input
                type="number"
                min={1}
                value={totalEntries}
                onChange={(e) => setTotalEntries(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 font-mono text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Winner Entry #
              </label>
              <input
                type="text"
                readOnly
                value={targetTicket ? `${targetTicket}` : `#${targetEntryNumber}`}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 font-mono text-slate-400 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualCalculate}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" /> Re-Calculate Math
          </button>
        </div>

        {/* Verification Result Card */}
        {calcResult && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-3">
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                isVerifiedMatch
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">
                  {isVerifiedMatch ? "100% Mathematically Verified!" : "Calculated"}
                </div>
                <div className="text-[10px] text-slate-300">
                  Winning Entry: <b>#{calcResult.winningEntryNumber}</b> of {calcResult.totalEntries}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-white/5 font-mono text-[10px] space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500">Hash Prefix:</span>
                <div className="text-cyan-400 break-all">{calcResult.combinedHash.substring(0, 13)}</div>
              </div>
              <div>
                <span className="text-slate-500">Decimal Value:</span>
                <div className="text-white font-bold">{calcResult.hashDecimal}</div>
              </div>
              <div>
                <span className="text-slate-500">Result:</span>
                <div className="text-emerald-400 font-bold">
                  ({calcResult.hashDecimal} % {calcResult.totalEntries}) + 1 = Entry #{calcResult.winningEntryNumber}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TelegramProvablyFairVerifierPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold text-xs">Loading Verifier...</div>}>
      <TelegramVerifierContent />
    </Suspense>
  );
}
