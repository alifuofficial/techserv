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
  Plus,
  Landmark,
  X,
  Wallet,
} from "lucide-react";
import { savePlatformSettings } from "./actions";

export interface PaymentMethodItem {
  id: string;
  name: string;
  shortCode: string;
  category: "MOBILE_MONEY" | "BANK_TRANSFER";
  accountName: string;
  accountNumber: string;
  instructions: string;
  enabled: boolean;
  color: string;
}

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

  paymentMethods: PaymentMethodItem[];

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

const BANK_PRESETS = [
  { name: "Awash Bank", shortCode: "AWASH", category: "BANK_TRANSFER" as const, color: "blue", instructions: "Transfer to Awash Bank account and upload screenshot receipt." },
  { name: "Bank of Abyssinia", shortCode: "BOA", category: "BANK_TRANSFER" as const, color: "amber", instructions: "Transfer to Bank of Abyssinia account and upload screenshot receipt." },
  { name: "Dashen Bank", shortCode: "DASHEN", category: "BANK_TRANSFER" as const, color: "blue", instructions: "Transfer to Dashen Bank account and upload screenshot receipt." },
  { name: "Commercial Bank of Ethiopia (CBE)", shortCode: "CBE", category: "BANK_TRANSFER" as const, color: "purple", instructions: "Transfer to CBE account and upload screenshot receipt." },
  { name: "Telebirr Direct", shortCode: "TB", category: "MOBILE_MONEY" as const, color: "blue", instructions: "Transfer to Telebirr phone number and upload screenshot receipt." },
  { name: "CBE Birr", shortCode: "CBE-BIRR", category: "MOBILE_MONEY" as const, color: "purple", instructions: "Transfer via CBE Birr mobile wallet and upload screenshot receipt." },
  { name: "Wegagen Bank", shortCode: "WEGAGEN", category: "BANK_TRANSFER" as const, color: "orange", instructions: "Transfer to Wegagen Bank account and upload screenshot receipt." },
  { name: "Cooperative Bank of Oromia", shortCode: "CBO", category: "BANK_TRANSFER" as const, color: "emerald", instructions: "Transfer to Coopbank account and upload screenshot receipt." },
  { name: "Hibret Bank", shortCode: "HIBRET", category: "BANK_TRANSFER" as const, color: "rose", instructions: "Transfer to Hibret Bank account and upload screenshot receipt." },
  { name: "Nib International Bank", shortCode: "NIB", category: "BANK_TRANSFER" as const, color: "amber", instructions: "Transfer to Nib Bank account and upload screenshot receipt." },
  { name: "Zemen Bank", shortCode: "ZEMEN", category: "BANK_TRANSFER" as const, color: "indigo", instructions: "Transfer to Zemen Bank account and upload screenshot receipt." },
  { name: "Custom Bank / Wallet", shortCode: "BANK", category: "BANK_TRANSFER" as const, color: "emerald", instructions: "Transfer to account and upload receipt." },
];

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

  // Dynamic Payment Method Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentMethodItem>({
    id: "",
    name: "Awash Bank",
    shortCode: "AWASH",
    category: "BANK_TRANSFER",
    accountName: settings.platformName + " PLC",
    accountNumber: "",
    instructions: "Transfer to Awash Bank account and upload screenshot receipt.",
    enabled: true,
    color: "blue",
  });

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const handleTogglePaymentMethod = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
    }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const handleDeletePaymentMethod = (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((m) => m.id !== id),
    }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const handleOpenAddPaymentMethod = () => {
    setEditingMethodId(null);
    setPaymentForm({
      id: "bank_" + Date.now(),
      name: "Awash Bank",
      shortCode: "AWASH",
      category: "BANK_TRANSFER",
      accountName: settings.platformName + " PLC",
      accountNumber: "",
      instructions: "Transfer to Awash Bank account and upload screenshot receipt.",
      enabled: true,
      color: "blue",
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPaymentMethod = (method: PaymentMethodItem) => {
    setEditingMethodId(method.id);
    setPaymentForm({ ...method });
    setShowPaymentModal(true);
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = BANK_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setPaymentForm((prev) => ({
        ...prev,
        name: preset.name,
        shortCode: preset.shortCode,
        category: preset.category,
        color: preset.color,
        instructions: preset.instructions,
      }));
    }
  };

  const handleSavePaymentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.name.trim() || !paymentForm.accountNumber.trim()) {
      alert("Please provide both Bank Name and Account Number.");
      return;
    }

    if (editingMethodId) {
      // Edit existing
      setSettings((prev) => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map((m) =>
          m.id === editingMethodId ? { ...paymentForm } : m
        ),
      }));
    } else {
      // Add new
      const newMethod: PaymentMethodItem = {
        ...paymentForm,
        id: paymentForm.id || "method_" + Date.now(),
      };
      setSettings((prev) => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newMethod],
      }));
    }

    setShowPaymentModal(false);
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      // Find telebirr and cbe in paymentMethods for backward-compatibility
      const tb = settings.paymentMethods.find((m) => m.id === "telebirr" || m.shortCode === "TB");
      const cbe = settings.paymentMethods.find((m) => m.id === "cbe" || m.shortCode === "CBE");

      await savePlatformSettings({
        platform_name: settings.platformName,
        support_email: settings.supportEmail,
        
        web_enabled: settings.webEnabled.toString(),
        telegram_enabled: settings.telegramEnabled.toString(),
        telegram_auth_only: settings.telegramAuthOnly.toString(),

        // Dynamic Payment Methods JSON
        custom_payment_methods: JSON.stringify(settings.paymentMethods),

        telebirr_enabled: (tb ? tb.enabled : settings.telebirrEnabled).toString(),
        telebirr_account_name: tb ? tb.accountName : settings.telebirrAccountName,
        telebirr_account_number: tb ? tb.accountNumber : settings.telebirrAccountNumber,
        telebirr_instructions: tb ? tb.instructions : settings.telebirrInstructions,

        cbe_enabled: (cbe ? cbe.enabled : settings.cbeEnabled).toString(),
        cbe_account_name: cbe ? cbe.accountName : settings.cbeAccountName,
        cbe_account_number: cbe ? cbe.accountNumber : settings.cbeAccountNumber,
        cbe_instructions: cbe ? cbe.instructions : settings.cbeInstructions,

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
      } else {
        setResetResult({ success: false, message: data.error || "Reset failed" });
      }
    } catch (e) {
      setResetResult({ success: false, message: "Network error during reset" });
    } finally {
      setIsResetting(false);
    }
  };

  const getMethodBadgeColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-600 text-white";
      case "purple":
        return "bg-purple-600 text-white";
      case "emerald":
        return "bg-emerald-600 text-white";
      case "amber":
        return "bg-amber-600 text-white";
      case "rose":
        return "bg-rose-600 text-white";
      case "indigo":
        return "bg-indigo-600 text-white";
      case "cyan":
        return "bg-cyan-600 text-white";
      case "orange":
        return "bg-orange-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-600" /> Platform Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure platform branding, multi-bank payment gateways, access toggles, SMTP, and referrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === "saved" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" /> Changes Saved
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 animate-in fade-in">
              Failed to save
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 active:scale-95 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm space-y-1 h-fit">
          {[
            { id: "general", label: "General & Branding", icon: Globe },
            { id: "access", label: "Platform Access", icon: Laptop },
            { id: "payments", label: "Payment Gateways & Banks", icon: CreditCard },
            { id: "api", label: "API & Integrations", icon: Key },
            { id: "smtp", label: "Email & SMTP", icon: Mail },
            { id: "referrals", label: "Referrals & Growth", icon: Users },
            { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? tab.danger
                      ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
                      : "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
                    : tab.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body Area */}
        <div className="md:col-span-3 space-y-6">

          {/* SECTION 1: GENERAL & BRANDING */}
          {activeSection === "general" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">General Branding</h2>
                  <p className="text-xs text-slate-500">Configure your platform identity and support email.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Platform Title</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => updateSetting("platformName", e.target.value)}
                    placeholder="MilkyTech"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">Displayed in headers, notifications, and customer emails.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Support Contact Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting("supportEmail", e.target.value)}
                    placeholder="support@milkytech.online"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">Recipient address for user support requests and system notices.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ACCESS & AVAILABILITY */}
          {activeSection === "access" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Platform Availability</h2>
                  <p className="text-xs text-slate-500">Toggle public access between Web application and Telegram Mini App.</p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Web Access Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Web App Access</div>
                      <div className="text-xs text-slate-500">Enable public website navigation and ticket purchase on Desktop/Mobile web.</div>
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

                {/* Telegram Mini App Access Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center font-bold">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Telegram Mini App Access</div>
                      <div className="text-xs text-slate-500">Enable Telegram Bot Mini App endpoints and automated member sign-in.</div>
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
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Telegram-Only Authentication</div>
                      <div className="text-xs text-slate-500">Redirect all regular web logins directly to Telegram bot authentication.</div>
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

          {/* SECTION 3: PAYMENT GATEWAYS & BANKS */}
          {activeSection === "payments" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Payment Gateways & Ethiopian Banks</h2>
                    <p className="text-xs text-slate-500">Configure, add, or edit payment methods (Telebirr, CBE, Awash, Abyssinia, Dashen, etc.).</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddPaymentMethod}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Bank / Payment Method
                </button>
              </div>

              {/* Payment Methods Cards List */}
              <div className="space-y-4">
                {settings.paymentMethods?.map((method) => (
                  <div
                    key={method.id}
                    className={`p-5 border rounded-2xl space-y-3 transition-all ${
                      method.enabled ? "bg-slate-50/60 border-slate-200" : "bg-slate-100/50 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl font-black flex items-center justify-center text-xs shadow-sm uppercase ${getMethodBadgeColor(method.color)}`}>
                          {method.shortCode || "PAY"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{method.name}</h4>
                            <span className="text-[10px] font-bold uppercase bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full">
                              {method.category === "MOBILE_MONEY" ? "Mobile Wallet" : "Bank Transfer"}
                            </span>
                          </div>
                          <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                            {method.accountNumber} <span className="text-slate-400 font-sans font-normal">({method.accountName})</span>
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                          {method.enabled ? "Active" : "Disabled"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentMethod(method.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                            method.enabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditPaymentMethod(method)}
                          className="p-2 hover:bg-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {method.id !== "telebirr" && method.id !== "cbe" && (
                          <button
                            type="button"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="p-2 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Method"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Instructions:</span>
                      <span className="truncate">{method.instructions}</span>
                    </div>
                  </div>
                ))}

                {settings.paymentMethods?.length === 0 && (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 space-y-2">
                    <Landmark className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No payment methods configured</p>
                    <p className="text-xs text-slate-400">Click &ldquo;Add Bank / Payment Method&rdquo; to add your bank accounts.</p>
                  </div>
                )}
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
                  <p className="text-xs text-slate-500">Configure Telegram Bot credentials and third-party verification APIs.</p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Telegram Bot Token */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Telegram Bot Token</label>
                  <div className="relative">
                    <input
                      type={showBotToken ? "text" : "password"}
                      value={settings.telegramBotToken}
                      onChange={(e) => updateSetting("telegramBotToken", e.target.value)}
                      placeholder="8773395225:AAEMXnznyGqIR2pn..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Used for Telegram WebApp HMAC verification and sending automated notifications.</p>
                </div>

                {/* Telegram Bot Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Telegram Bot Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">@</span>
                    <input
                      type="text"
                      value={settings.telegramBotUsername}
                      onChange={(e) => updateSetting("telegramBotUsername", e.target.value)}
                      placeholder="milkytechonlinebot"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Used to generate dynamic referral and bot deep-links.</p>
                </div>

                {/* Verify.et API Key */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verify.et Automated Slip API Key (Optional)</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.verifyEtApiKey}
                      onChange={(e) => updateSetting("verifyEtApiKey", e.target.value)}
                      placeholder="api_live_..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Used for automatic OCR verification of Telebirr and CBE payment slips.</p>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 5: EMAIL & SMTP */}
          {activeSection === "smtp" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Email SMTP Configuration</h2>
                  <p className="text-xs text-slate-500">Configure outbound SMTP mail server for user alerts, password resets, and receipts.</p>
                </div>
              </div>

              <div className="space-y-4">
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SMTP Server Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => updateSetting("smtpHost", e.target.value)}
                      placeholder="smtp.gmail.com or mail.milkytech.online"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SMTP Port</label>
                    <input
                      type="text"
                      value={settings.smtpPort}
                      onChange={(e) => updateSetting("smtpPort", e.target.value)}
                      placeholder="587"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SMTP Username / Email</label>
                    <input
                      type="text"
                      value={settings.smtpUser}
                      onChange={(e) => updateSetting("smtpUser", e.target.value)}
                      placeholder="support@milkytech.online"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SMTP Password</label>
                    <div className="relative">
                      <input
                        type={showSmtpPass ? "text" : "password"}
                        value={settings.smtpPass}
                        onChange={(e) => updateSetting("smtpPass", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sender From Name</label>
                    <input
                      type="text"
                      value={settings.smtpFromName}
                      onChange={(e) => updateSetting("smtpFromName", e.target.value)}
                      placeholder="MilkyTech Support"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sender From Email</label>
                    <input
                      type="email"
                      value={settings.smtpFromEmail}
                      onChange={(e) => updateSetting("smtpFromEmail", e.target.value)}
                      placeholder="support@milkytech.online"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* SMTP Test Tool */}
                <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Send className="w-3.5 h-3.5 text-blue-600" /> Send Test Email
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
                      Deletes all campaigns, prizes, tickets, draws, payments, ledger transactions, and test users. Preserves admin login accounts and system settings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(true);
                      setResetResult(null);
                      setResetConfirmInput("");
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shrink-0 shadow-md shadow-red-600/20 active:scale-95 transition-all"
                  >
                    Reset Platform Data
                  </button>
                </div>

                {resetResult && (
                  <div className={`p-4 rounded-xl text-xs font-semibold ${
                    resetResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {resetResult.success ? "✅ " : "❌ "}
                    {resetResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD / EDIT PAYMENT METHOD MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingMethodId ? "Edit Payment Method" : "Add New Bank / Payment Method"}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure bank details shown to users during deposits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentForm} className="space-y-4">
              
              {/* Preset Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Bank Preset</label>
                <select
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  value={paymentForm.name}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  {BANK_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Method Name</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.name}
                    onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                    placeholder="e.g. Awash Bank"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Short Badge Code</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.shortCode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, shortCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. AWASH"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
                  <select
                    value={paymentForm.category}
                    onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MOBILE_MONEY">Mobile Wallet / Birr</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Badge Color</label>
                  <select
                    value={paymentForm.color}
                    onChange={(e) => setPaymentForm({ ...paymentForm, color: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="amber">Amber Gold</option>
                    <option value="rose">Rose Red</option>
                    <option value="indigo">Indigo</option>
                    <option value="orange">Orange</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={paymentForm.accountName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                  placeholder="e.g. MilkyTech PLC"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Number / Phone</label>
                <input
                  type="text"
                  required
                  value={paymentForm.accountNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                  placeholder="e.g. 01320876543200"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transfer Instructions</label>
                <textarea
                  rows={2}
                  value={paymentForm.instructions}
                  onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                  placeholder="e.g. Transfer to account and upload receipt screenshot."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md shadow-slate-900/20 active:scale-95 transition-all"
                >
                  {editingMethodId ? "Update Method" : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                This action is <b>permanent and cannot be undone</b>. It will wipe all campaigns, prizes, tickets, draws, payments, and test users.
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
                placeholder="Type RESET"
                className="w-full text-center px-4 py-2.5 border-2 border-red-200 rounded-xl text-base font-mono font-black text-red-600 focus:outline-none focus:border-red-500 uppercase"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting || resetConfirmInput !== "RESET"}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 active:scale-95 transition-all"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Wipe Platform</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
