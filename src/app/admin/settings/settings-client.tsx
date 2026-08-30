"use client";

import { useState } from "react";
import {
  Globe,
  Server,
  CreditCard,
  Key,
  Users,
  Save,
  Check,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Shield,
  Sparkles,
  ExternalLink,
  Lock,
  Mail,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { savePlatformSettings } from "./actions";

interface SettingsData {
  webEnabled: boolean;
  telegramEnabled: boolean;
  telebirrEnabled: boolean;
  cbeEnabled: boolean;
  verifyEtApiKey: string;
  telegramBotToken: string;
  telegramBotUsername: string;
  telegramAuthOnly: boolean;
  platformName: string;
  supportEmail: string;
}

export default function AdminSettingsClient({ initialSettings }: { initialSettings: SettingsData }) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [activeSection, setActiveSection] = useState<"general" | "access" | "payments" | "api" | "referrals">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [referralEnabled, setReferralEnabled] = useState(true);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await savePlatformSettings({
        web_enabled: settings.webEnabled.toString(),
        telegram_enabled: settings.telegramEnabled.toString(),
        telebirr_enabled: settings.telebirrEnabled.toString(),
        cbe_enabled: settings.cbeEnabled.toString(),
        verify_et_api_key: settings.verifyEtApiKey,
        telegram_bot_token: settings.telegramBotToken,
        telegram_bot_username: settings.telegramBotUsername,
        telegram_auth_only: settings.telegramAuthOnly.toString(),
        platform_name: settings.platformName,
        support_email: settings.supportEmail,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: "general", label: "General", icon: Globe, desc: "Platform branding & contact" },
    { id: "access", label: "Availability & Access", icon: Server, desc: "Web & Telegram platforms" },
    { id: "payments", label: "Payment Methods", icon: CreditCard, desc: "Telebirr, CBE & Gateways" },
    { id: "api", label: "API Keys & Integrations", icon: Key, desc: "Verify.ET & Telegram bot" },
    { id: "referrals", label: "Referrals & Growth", icon: Users, desc: "Invite rewards engine" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure platform branding, client availability, payment methods, and external APIs.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3">
          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Changes Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              Failed to save
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigation + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 sticky top-6 space-y-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Categories
          </div>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight">{item.label}</div>
                  <div className={`text-xs mt-0.5 truncate ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: GENERAL */}
          {activeSection === "general" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">General Information</h2>
                  <p className="text-xs text-slate-500">Configure core platform identity and customer contact.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => updateSetting("platformName", e.target.value)}
                    placeholder="e.g. MilkyTech"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">Displayed in headers, notifications, and metadata.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Official Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting("supportEmail", e.target.value)}
                    placeholder="e.g. support@milkytech.online"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">Where users reach out for transaction and prize assistance.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ACCESS & PLATFORMS */}
          {activeSection === "access" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Platform Availability</h2>
                  <p className="text-xs text-slate-500">Control public access across web browsers and Telegram.</p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Web Platform Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Web Browser Access</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Allow users to view campaigns and register directly in web browsers.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("webEnabled", !settings.webEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.webEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                {/* Telegram Mini App Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-100/60 text-sky-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Telegram Mini App</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Allow users to open MilkyTech inside Telegram Mini App.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("telegramEnabled", !settings.telegramEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.telegramEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                {/* Telegram Auth Only Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100/60 text-purple-600 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Telegram Auth Only (Web)</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Restrict web authentication to Telegram widget only (disables manual email forms).
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("telegramAuthOnly", !settings.telegramAuthOnly)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.telegramAuthOnly ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 3: PAYMENT GATEWAYS */}
          {activeSection === "payments" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Payment Methods</h2>
                  <p className="text-xs text-slate-500">Enable or disable checkout and deposit payment methods.</p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Telebirr */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-xs shadow-sm">
                      TB
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Telebirr</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Allow deposits & ticket checkouts via Telebirr transfer.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("telebirrEnabled", !settings.telebirrEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.telebirrEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                {/* CBE Birr */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                      CBE
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Commercial Bank of Ethiopia (CBE)</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Allow deposits & ticket checkouts via CBE bank account transfer.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("cbeEnabled", !settings.cbeEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.cbeEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 4: API KEYS & INTEGRATIONS */}
          {activeSection === "api" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">API Keys & Integrations</h2>
                  <p className="text-xs text-slate-500">Configure third-party payment verifiers and Telegram bot tokens.</p>
                </div>
              </div>

              <div className="space-y-5">
                
                {/* Verify.ET API Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Verify.ET API Key</span>
                    <span className="text-[11px] text-slate-400 font-normal">Automated Receipt Verifier</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.verifyEtApiKey}
                      onChange={(e) => updateSetting("verifyEtApiKey", e.target.value)}
                      placeholder="sk_live_..."
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Telegram Bot Token */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Telegram Bot Token</span>
                    <span className="text-[11px] text-slate-400 font-normal">From @BotFather</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showBotToken ? "text" : "password"}
                      value={settings.telegramBotToken}
                      onChange={(e) => updateSetting("telegramBotToken", e.target.value)}
                      placeholder="123456789:ABCDefghIJKLmnopQRSTuvwxyz"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Telegram Bot Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Telegram Bot Username</span>
                    <span className="text-[11px] text-slate-400 font-normal">Without '@'</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      value={settings.telegramBotUsername}
                      onChange={(e) => updateSetting("telegramBotUsername", e.target.value.replace(/^@/, ""))}
                      placeholder="milkytechonlinebot"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 5: REFERRALS */}
          {activeSection === "referrals" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Referral Program</h2>
                  <p className="text-xs text-slate-500">Enable or disable user invite referral tracking and rewards.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-slate-900">Enable Referral Rewards</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Allow users to generate referral invite links and earn bonus rewards upon friend signups.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReferralEnabled(!referralEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    referralEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
