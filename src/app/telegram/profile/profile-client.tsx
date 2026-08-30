"use client";

import { useEffect, useState } from "react";
import { User, LogOut, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signIn, useSession, signOut } from "next-auth/react";
import { updateProfile } from "./actions";
import { getTelegramProfileData } from "../actions";

export default function ProfileClient({ dbUser: initialUser, telegramId: initialTelegramId }: { dbUser: any, telegramId: string }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(initialUser);
  const [telegramId, setTelegramId] = useState<string>(initialTelegramId || "");
  const [name, setName] = useState<string>(initialUser?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(!initialUser);

  useEffect(() => {
    if (status === "unauthenticated") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        tg.ready();
        tg.expand();
        signIn("telegram", { initData: tg.initData, redirect: false });
      }
    }

    if (status === "authenticated" && !initialUser) {
      setIsLoadingProfile(true);
      getTelegramProfileData()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
            setName(res.user.name || "");
            setTelegramId(res.user.telegramId || "");
          }
        })
        .catch(console.error)
        .finally(() => {
          setIsLoadingProfile(false);
        });
    }
  }, [status, initialUser]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Full name cannot be blank.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await updateProfile({ name });
      if (res.success) {
        setSuccess(true);
        if (res.name) {
          setName(res.name);
          setUser((prev: any) => ({ ...prev, name: res.name }));
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = name || user?.name || (telegramId ? "User " + telegramId : "User");

  return (
    <>
      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-6 mt-4 flex flex-col items-center relative overflow-hidden shadow-xl">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-inner">
          <User className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1 text-center">
          {isLoadingProfile ? (
            <span className="inline-flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </span>
          ) : (
            displayName
          )}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">{user?.email || (telegramId ? `telegram_${telegramId}@milkytech.online` : "")}</p>
        <span className="mt-3 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-full uppercase tracking-widest border border-emerald-500/30">
          VERIFIED
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Full Name
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full real name"
              className="flex-1 bg-[#121826] border border-slate-700/80 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              onClick={handleSave}
              disabled={isSaving || !name.trim() || name === (user?.name || "")}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white p-3.5 rounded-xl transition-all flex items-center justify-center shrink-0 w-13 shadow-lg shadow-emerald-500/20"
              title="Save Name"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 mt-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Telegram ID</p>
          <p className="text-white font-mono font-bold text-base">{telegramId || "Connected"}</p>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/telegram" })}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold py-4 rounded-2xl active:scale-95 transition-all border border-red-500/20 mt-8 text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </>
  );
}
