"use client";

import { useState } from "react";
import { Shield, CreditCard, Save, Globe, Users, Server, Smartphone, Laptop, Key } from "lucide-react";
import { savePlatformSettings } from "./actions";

export default function AdminSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [referralEnabled, setReferralEnabled] = useState(true);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePlatformSettings({
        web_enabled: settings.webEnabled.toString(),
        telegram_enabled: settings.telegramEnabled.toString(),
        telebirr_enabled: settings.telebirrEnabled.toString(),
        cbe_enabled: settings.cbeEnabled.toString(),
        verify_et_api_key: settings.verifyEtApiKey,
        telegram_bot_token: settings.telegramBotToken,
        platform_name: settings.platformName,
        support_email: settings.supportEmail,
      });
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
          <p className="text-sm text-slate-500 font-medium mt-1">Manage global configurations, payments, and APIs.</p>
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

        {/* General Configuration */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">General Configuration</h2>
              <p className="text-sm text-slate-500">Core details about your platform.</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Platform Name</label>
              <input 
                type="text" 
                value={settings.platformName} 
                onChange={(e) => updateSetting('platformName', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Support Email Address</label>
              <input 
                type="email" 
                value={settings.supportEmail} 
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
              />
            </div>
          </div>
        </section>

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
                <input type="checkbox" checked={settings.webEnabled} onChange={(e) => updateSetting('webEnabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

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
                <input type="checkbox" checked={settings.telegramEnabled} onChange={(e) => updateSetting('telegramEnabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* API Configurations */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">API Configurations</h2>
              <p className="text-sm text-slate-500">Manage 3rd party API keys and webhook tokens.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>Verify.ET API Key</span>
                <span className="text-slate-400 font-normal">For automated payment verification</span>
              </label>
              <input 
                type="password" 
                placeholder="sk_live_..."
                value={settings.verifyEtApiKey} 
                onChange={(e) => updateSetting('verifyEtApiKey', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>Telegram Bot Token</span>
                <span className="text-slate-400 font-normal">For Telegram Mini App Auth</span>
              </label>
              <input 
                type="password" 
                placeholder="123456789:ABCDefghIJKLmnopQRSTuvwxyz"
                value={settings.telegramBotToken} 
                onChange={(e) => updateSetting('telegramBotToken', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono" 
              />
            </div>
          </div>
        </section>

        {/* Payment Gateways */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Payment Gateways</h2>
                <p className="text-sm text-slate-500">Enable or disable checkout methods.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg shrink-0">TB</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Telebirr</h4>
                  <p className="text-sm text-slate-500">Manual Transfer (0911234567)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input type="checkbox" checked={settings.telebirrEnabled} onChange={(e) => updateSetting('telebirrEnabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-lg shrink-0">CBE</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">CBE Birr</h4>
                  <p className="text-sm text-slate-500">Manual Transfer (1000123456789)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input type="checkbox" checked={settings.cbeEnabled} onChange={(e) => updateSetting('cbeEnabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            <button className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-slate-600 font-bold text-sm transition-all flex items-center justify-center gap-2">
              + Add New Gateway
            </button>
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
