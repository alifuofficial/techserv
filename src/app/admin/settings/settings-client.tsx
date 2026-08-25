"use client";

import { useState } from "react";
import { Shield, CreditCard, Save, Globe, Users, Server, Smartphone, Laptop } from "lucide-react";
import { savePlatformSettings } from "./actions";

export default function AdminSettingsClient({
  initialWebEnabled,
  initialTelegramEnabled,
}: {
  initialWebEnabled: boolean;
  initialTelegramEnabled: boolean;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [referralEnabled, setReferralEnabled] = useState(true);
  
  const [webEnabled, setWebEnabled] = useState(initialWebEnabled);
  const [telegramEnabled, setTelegramEnabled] = useState(initialTelegramEnabled);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePlatformSettings(webEnabled, telegramEnabled);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage global configurations and policies.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all w-full sm:w-auto justify-center"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="space-y-10">

        {/* Platform Availability */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Platform Availability</h2>
              <p className="text-sm text-slate-500">Enable or disable access to specific platforms.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Web Version */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Web Version</h4>
                  <p className="text-sm text-slate-500">Allow users to access the platform via web browser.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input type="checkbox" checked={webEnabled} onChange={(e) => setWebEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Telegram Mini App */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Telegram Mini App</h4>
                  <p className="text-sm text-slate-500">Allow users to access the platform via Telegram.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input type="checkbox" checked={telegramEnabled} onChange={(e) => setTelegramEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </section>
        
        {/* Referral System */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Referral System</h2>
              <p className="text-sm text-slate-500">Configure how users earn rewards for inviting others.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
            <div>
              <h4 className="font-bold text-slate-900">Enable Referrals</h4>
              <p className="text-sm text-slate-500 mt-1">Allow users to generate codes and invite friends.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={referralEnabled} onChange={(e) => setReferralEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </section>

      </div>
    </div>
  );
}
