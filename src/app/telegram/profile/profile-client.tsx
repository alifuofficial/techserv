"use client";

import { useState } from "react";
import { User, LogOut, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { updateProfile } from "./actions";

export default function ProfileClient({ dbUser, telegramId }: { dbUser: any, telegramId: string }) {
  const [name, setName] = useState(dbUser.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      await updateProfile({ name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-6 mt-4 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
          <User className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{name || "User " + telegramId}</h2>
        <p className="text-slate-400 text-sm">{dbUser.email}</p>
        <span className="mt-3 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest">VERIFIED</span>
      </div>

      <div className="mt-8 space-y-4">
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">{error}</div>}
        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Profile updated successfully</div>}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your real name"
              className="flex-1 bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              onClick={handleSave}
              disabled={isSaving || name === (dbUser.name || "")}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex items-center justify-center shrink-0 w-12"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 mt-4">
          <p className="text-slate-400 text-sm mb-1">Telegram ID</p>
          <p className="text-white font-mono">{telegramId}</p>
        </div>
        
        <Link href="/api/auth/signout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl active:bg-red-500/20 transition-colors border border-red-500/20 mt-8">
          <LogOut className="w-5 h-5" /> Sign Out
        </Link>
      </div>
    </>
  );
}
