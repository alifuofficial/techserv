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
  Trash2,
  AlertTriangle,
  Send,
  Loader2,
  RefreshCw,
  Edit3,
  DollarSign,
} from "lucide-react";
import { savePlatformSettings } from "./actions";

export interface SettingsData {
  platformName: string;
  supportEmail: string;
  
  webEnabled: boolean;
  telegramEnabled: boolean;
  telegramAuthOnly: boolean;

  telebirrEnabled: boolean;
  telebirrAccountName: string;
  telebirrAccountNumber: string;
  telebirrInstructions: string;

  cbeEnabled: boolean;
  cbeAccountName: string;
  cbeAccountNumber: string;
  cbeInstructions: string;

  verifyEtApiKey: string;
  telegramBotToken: string;
  telegramBotUsername: string;

  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFromName: string;
  smtpFromEmail: string;
  smtpSecure: boolean;

  referralEnabled: boolean;
  referralBonusAmount: string;
  referralCurrency: string;
  referralCustomText: string;
}

export default function AdminSettingsClient({ initialSettings }: { initialSettings: SettingsData }) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [activeSection, setActiveSection] = useState<"general" | "access" | "payments" | "api" | "smtp" | "referrals" | "danger">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  
  // Visibility toggles
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // SMTP Test state
  const [testEmailRecipient, setTestEmailRecipient] = useState(settings.supportEmail || "");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset Platform state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await savePlatformSettings({
        platform_name: settings.platformName,
        support_email: settings.supportEmail,
        
        web_enabled: settings.webEnabled.toString(),
        telegram_enabled: settings.telegramEnabled.toString(),
        telegram_auth_only: settings.telegramAuthOnly.toString(),

        telebirr_enabled: settings.telebirrEnabled.toString(),
        telebirr_account_name: settings.telebirrAccountName,
        telebirr_account_number: settings.telebirrAccountNumber,
        telebirr_instructions: settings.telebirrInstructions,

        cbe_enabled: settings.cbeEnabled.toString(),
        cbe_account_name: settings.cbeAccountName,
        cbe_account_number: settings.cbeAccountNumber,
        cbe_instructions: settings.cbeInstructions,

        verify_et_api_key: settings.verifyEtApiKey,
        telegram_bot_token: settings.telegramBotToken,
        telegram_bot_username: settings.telegramBotUsername,

        smtp_host: settings.smtpHost,
        smtp_port: settings.smtpPort,
        smtp_user: settings.smtpUser,
        smtp_pass: settings.smtpPass,
        smtp_from_name: settings.smtpFromName,
        smtp_from_email: settings.smtpFromEmail,
        smtp_secure: settings.smtpSecure.toString(),

        referral_enabled: settings.referralEnabled.toString(),
        referral_bonus_amount: settings.referralBonusAmount,
        referral_currency: settings.referralCurrency,
        referral_custom_text: settings.referralCustomText,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      alert("Please fill in SMTP Host, User, and Password first.");
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch("/api/admin/settings/smtp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settings.smtpHost,
          port: settings.smtpPort,
          user: settings.smtpUser,
          pass: settings.smtpPass,
          secure: settings.smtpSecure,
          fromEmail: settings.smtpFromEmail,
          fromName: settings.smtpFromName,
          testRecipient: testEmailRecipient,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSmtpTestResult({ success: true, message: data.message });
      } else {
        setSmtpTestResult({ success: false, message: data.error || "SMTP test failed" });
      }
    } catch (e: any) {
      setSmtpTestResult({ success: false, message: "Network error sending test email" });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleExecuteReset = async () => {
    if (resetConfirmInput !== "RESET") {
      alert("You must type 'RESET' to confirm.");
      return;
    }

    setIsResetting(true);
    setResetResult(null);

    try {
      const res = await fetch("/api/admin/system/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: resetConfirmInput }),
      });

      const data = await res.json();
      if (data.success) {
        setResetResult({ success: true, message: data.message });
        setResetConfirmInput("");
        setTimeout(() => {
          setShowResetModal(false);
        }, 2500);
      } else {
        setResetResult({ success: false, message: data.error || "Reset failed" });
      }
    } catch (e) {
      setResetResult({ success: false, message: "Network error during reset" });
    } finally {
      setIsResetting(false);
    }
  };

  const navItems = [
    { id: "general", label: "General", icon: Globe, desc: "Platform branding & contact" },
    { id: "access", label: "Availability & Access", icon: Server, desc: "Web & Telegram platforms" },
    { id: "payments", label: "Payment Methods", icon: CreditCard, desc: "Telebirr, CBE numbers & names" },
    { id: "api", label: "API Keys & Integrations", icon: Key, desc: "Verify.ET & Telegram bot" },
    { id: "smtp", label: "Email & SMTP", icon: Mail, desc: "Mail server configuration" },
    { id: "referrals", label: "Referrals & Growth", icon: Users, desc: "Invite reward bonus amount" },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, desc: "Platform data wipe & reset" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure platform branding, payment account details, SMTP, and referral bonuses.
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
            const isDanger = item.id === "danger";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? isDanger
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-slate-900 text-white shadow-sm"
                    : isDanger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${
                  isActive ? "text-white" : isDanger ? "text-red-500" : "text-slate-400"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight">{item.label}</div>
                  <div className={`text-xs mt-0.5 truncate ${
                    isActive ? "text-slate-200" : isDanger ? "text-red-400" : "text-slate-400"
                  }`}>
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

          {/* SECTION 3: PAYMENT GATEWAYS & ACCOUNTS */}
          {activeSection === "payments" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Payment Account Settings</h2>
                  <p className="text-xs text-slate-500">Edit transfer account numbers, recipient names, and instructions.</p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Telebirr Settings Card */}
                <div className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-xs shadow-sm">
                        TB
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Telebirr Account Details</h4>
                        <p className="text-xs text-slate-500">Displayed to users during deposits and checkouts</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {settings.telebirrEnabled ? "Enabled" : "Disabled"}
                      </span>
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
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Account / Merchant Name</label>
                      <input
                        type="text"
                        value={settings.telebirrAccountName}
                        onChange={(e) => updateSetting("telebirrAccountName", e.target.value)}
                        placeholder="e.g. MilkyTech Online"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Telebirr Phone / Account Number</label>
                      <input
                        type="text"
                        value={settings.telebirrAccountNumber}
                        onChange={(e) => updateSetting("telebirrAccountNumber", e.target.value)}
                        placeholder="e.g. 0911000000"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Transfer Instructions</label>
                    <input
                      type="text"
                      value={settings.telebirrInstructions}
                      onChange={(e) => updateSetting("telebirrInstructions", e.target.value)}
                      placeholder="e.g. Transfer to 0911000000 and enter your transaction ID."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* CBE Settings Card */}
                <div className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                        CBE
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Commercial Bank of Ethiopia (CBE) Details</h4>
                        <p className="text-xs text-slate-500">Displayed to users during deposits and checkouts</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {settings.cbeEnabled ? "Enabled" : "Disabled"}
                      </span>
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

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Account Holder Name</label>
                      <input
                        type="text"
                        value={settings.cbeAccountName}
                        onChange={(e) => updateSetting("cbeAccountName", e.target.value)}
                        placeholder="e.g. MilkyTech PLC"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Bank Account Number</label>
                      <input
                        type="text"
                        value={settings.cbeAccountNumber}
                        onChange={(e) => updateSetting("cbeAccountNumber", e.target.value)}
                        placeholder="e.g. 1000123456789"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Transfer Instructions</label>
                    <input
                      type="text"
                      value={settings.cbeInstructions}
                      onChange={(e) => updateSetting("cbeInstructions", e.target.value)}
                      placeholder="e.g. Transfer to CBE account 1000123456789 and enter transaction ID."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
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

          {/* SECTION 5: EMAIL & SMTP CONFIGURATION */}
          {activeSection === "smtp" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Email & SMTP Configuration</h2>
                  <p className="text-xs text-slate-500">Configure SMTP server for outgoing emails, password resets, and receipts.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">SMTP Server / Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => updateSetting("smtpHost", e.target.value)}
                      placeholder="e.g. smtp.gmail.com or mail.milkytech.online"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">SMTP Port</label>
                    <input
                      type="text"
                      value={settings.smtpPort}
                      onChange={(e) => updateSetting("smtpPort", e.target.value)}
                      placeholder="587 / 465"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">SMTP Username / Email</label>
                    <input
                      type="text"
                      value={settings.smtpUser}
                      onChange={(e) => updateSetting("smtpUser", e.target.value)}
                      placeholder="e.g. support@milkytech.online"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">SMTP Password</label>
                    <div className="relative">
                      <input
                        type={showSmtpPass ? "text" : "password"}
                        value={settings.smtpPass}
                        onChange={(e) => updateSetting("smtpPass", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">From Name</label>
                    <input
                      type="text"
                      value={settings.smtpFromName}
                      onChange={(e) => updateSetting("smtpFromName", e.target.value)}
                      placeholder="e.g. MilkyTech Support"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">From Email Address</label>
                    <input
                      type="email"
                      value={settings.smtpFromEmail}
                      onChange={(e) => updateSetting("smtpFromEmail", e.target.value)}
                      placeholder="e.g. support@milkytech.online"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-slate-900">SSL / TLS Secure Connection</div>
                    <div className="text-[11px] text-slate-500">Enable for Port 465 (SMTPS) or SSL enforced hosts</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("smtpSecure", !settings.smtpSecure)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.smtpSecure ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                {/* SMTP Test Widget */}
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Test SMTP Connection</h4>
                      <p className="text-[11px] text-slate-500">Send an instant test email to verify delivery.</p>
                    </div>
                  </div>

                  <form onSubmit={handleTestSmtp} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="Enter recipient email..."
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isTestingSmtp}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                    >
                      {isTestingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Test</span>
                    </button>
                  </form>

                  {smtpTestResult && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      smtpTestResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {smtpTestResult.success ? "✅ " : "❌ "}
                      {smtpTestResult.message}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* SECTION 6: REFERRALS & GROWTH */}
          {activeSection === "referrals" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Referral Program Configuration</h2>
                  <p className="text-xs text-slate-500">Configure how much bonus users earn for each friend they invite (syncs dynamically to Telegram Mini App).</p>
                </div>
              </div>

              <div className="space-y-5">
                
                {/* Enable Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Enable Referral Rewards</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Allow users to generate referral invite links and earn bonus rewards.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("referralEnabled", !settings.referralEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.referralEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                {/* Reward Configuration */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Reward Amount Per Referral
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={settings.referralBonusAmount}
                        onChange={(e) => updateSetting("referralBonusAmount", e.target.value)}
                        placeholder="10"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                        {settings.referralCurrency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Users receive this bonus in their wallet for each successful friend sign-up.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={settings.referralCurrency}
                      onChange={(e) => updateSetting("referralCurrency", e.target.value)}
                      placeholder="ETB"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Custom Promo Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Telegram Referral Headline
                  </label>
                  <input
                    type="text"
                    value={settings.referralCustomText}
                    onChange={(e) => updateSetting("referralCustomText", e.target.value)}
                    placeholder="Earn bonus for every friend who joins MilkyTech using your link!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Live dynamic preview in Telegram Mini App: &ldquo;Earn <b>{settings.referralBonusAmount || 10} {settings.referralCurrency || 'ETB'}</b> bonus for every friend who joins MilkyTech using your link!&rdquo;
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 7: DANGER ZONE (PLATFORM WIPE / RESET) */}
          {activeSection === "danger" && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-red-100">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
                  <p className="text-xs text-slate-500">Irreversible platform management actions.</p>
                </div>
              </div>

              <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Wipe & Reset Platform Data</h4>
                    <p className="text-xs text-red-700 mt-1 max-w-md leading-relaxed">
                      Deletes all tickets, draws, payments, ledger transaction histories, and test users. Preserves admin accounts, campaigns, prizes, and settings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(true);
                      setResetResult(null);
                      setResetConfirmInput("");
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shrink-0 shadow-md shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" /> Reset Platform Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CONFIRMATION MODAL FOR RESET */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action is <b>permanent and cannot be undone</b>. It will wipe all tickets, draws, payments, and user balances.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 text-center">
                Type <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">RESET</span> below to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="Type RESET here"
                className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 uppercase"
              />
            </div>

            {resetResult && (
              <div className={`p-3 rounded-xl text-xs font-semibold text-center ${
                resetResult.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}>
                {resetResult.message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting || resetConfirmInput !== "RESET"}
                onClick={handleExecuteReset}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-red-500/20"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Wiping Data...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Wipe Platform
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
