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
  ArrowDownToLine,
  Gift,
  Flame,
  Clock,
  Zap,
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

export interface WithdrawalMethodItem {
  id: string;
  name: string;
  shortCode: string;
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

  // Withdrawal Settings
  withdrawalMinAmount: string;
  withdrawalMaxDailyAmount: string;
  withdrawalFeePercent: string;
  withdrawalMethods: WithdrawalMethodItem[];

  // Welcome Registration Bonus
  welcomeBonusEnabled: boolean;
  welcomeBonusAmount: string;
  welcomeBonusCurrency: string;

  // Lucky Spin & Cooldown
  dailySpinCooldownHours: string;
  spinReminderDmEnabled: boolean;

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
  referralUnlockCondition: string;
  referralMinDepositAmount: string;
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
  const [activeSection, setActiveSection] = useState<
    "general" | "access" | "payments" | "withdrawals" | "welcome" | "spin" | "api" | "smtp" | "referrals" | "danger"
  >("general");
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

  // Lucky Spin Reminder Trigger state
  const [isTriggeringSpinReminders, setIsTriggeringSpinReminders] = useState(false);
  const [spinReminderResult, setSpinReminderResult] = useState<string | null>(null);

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

  const handleToggleWithdrawalMethod = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      withdrawalMethods: (prev.withdrawalMethods || []).map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
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
      setSettings((prev) => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map((m) =>
          m.id === editingMethodId ? { ...paymentForm } : m
        ),
      }));
    } else {
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
      const tb = settings.paymentMethods.find((m) => m.id === "telebirr" || m.shortCode === "TB");
      const cbe = settings.paymentMethods.find((m) => m.id === "cbe" || m.shortCode === "CBE");

      await savePlatformSettings({
        platform_name: settings.platformName,
        support_email: settings.supportEmail,
        
        web_enabled: settings.webEnabled.toString(),
        telegram_enabled: settings.telegramEnabled.toString(),
        telegram_auth_only: settings.telegramAuthOnly.toString(),

        custom_payment_methods: JSON.stringify(settings.paymentMethods),

        telebirr_enabled: (tb ? tb.enabled : settings.telebirrEnabled).toString(),
        telebirr_account_name: tb ? tb.accountName : settings.telebirrAccountName,
        telebirr_account_number: tb ? tb.accountNumber : settings.telebirrAccountNumber,
        telebirr_instructions: tb ? tb.instructions : settings.telebirrInstructions,

        cbe_enabled: (cbe ? cbe.enabled : settings.cbeEnabled).toString(),
        cbe_account_name: cbe ? cbe.accountName : settings.cbeAccountName,
        cbe_account_number: cbe ? cbe.accountNumber : settings.cbeAccountNumber,
        cbe_instructions: cbe ? cbe.instructions : settings.cbeInstructions,

        // Withdrawal settings
        withdrawal_min_amount: settings.withdrawalMinAmount || "100",
        withdrawal_max_daily_amount: settings.withdrawalMaxDailyAmount || "25000",
        withdrawal_fee_percent: settings.withdrawalFeePercent || "0",
        withdrawal_methods: JSON.stringify(settings.withdrawalMethods || []),

        // Welcome registration bonus
        welcome_bonus_enabled: settings.welcomeBonusEnabled.toString(),
        welcome_bonus_amount: settings.welcomeBonusAmount || "5",
        welcome_bonus_currency: settings.welcomeBonusCurrency || "ETB",

        // Lucky Spin & Cooldown
        daily_spin_cooldown_hours: settings.dailySpinCooldownHours || "24",
        spin_reminder_dm_enabled: settings.spinReminderDmEnabled.toString(),

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
        referral_unlock_condition: settings.referralUnlockCondition || "ON_FIRST_DEPOSIT",
        referral_min_deposit_amount: settings.referralMinDepositAmount || "50",
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

  const handleTriggerSpinReminders = async () => {
    setIsTriggeringSpinReminders(true);
    setSpinReminderResult(null);
    try {
      const res = await fetch("/api/admin/spin/remind", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSpinReminderResult(`✅ ${data.message}`);
      } else {
        setSpinReminderResult(`❌ ${data.error || "Failed to trigger reminders"}`);
      }
    } catch (e) {
      setSpinReminderResult("❌ Network error triggering reminders");
    } finally {
      setIsTriggeringSpinReminders(false);
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
            Configure platform branding, withdrawal limits, welcome gifts, daily spin cooldown, and referrals.
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
            { id: "payments", label: "Deposit Gateways", icon: CreditCard },
            { id: "withdrawals", label: "Withdrawals & Daily Limits", icon: ArrowDownToLine },
            { id: "welcome", label: "Welcome Bonus Incentive", icon: Gift },
            { id: "spin", label: "Lucky Spin & Reminders", icon: Flame },
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
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.danger ? "text-red-500" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* SECTION 1: GENERAL */}
          {activeSection === "general" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">General Branding & Information</h2>
                  <p className="text-xs text-slate-500">Platform identity, support email, and primary business details.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Platform Title / Brand</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => updateSetting("platformName", e.target.value)}
                    placeholder="MilkyTech"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Public Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting("supportEmail", e.target.value)}
                    placeholder="support@milkytech.online"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PLATFORM ACCESS */}
          {activeSection === "access" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Platform Access & Channels</h2>
                  <p className="text-xs text-slate-500">Enable or disable Web Application and Telegram Mini App endpoints.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Telegram Mini App Access</div>
                    <div className="text-xs text-slate-500 mt-0.5">Enable access through Telegram Mini App bot</div>
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

                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Web Portal Access</div>
                    <div className="text-xs text-slate-500 mt-0.5">Allow web browser users to browse campaigns and checkout</div>
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
              </div>
            </div>
          )}

          {/* SECTION 3: DEPOSIT GATEWAYS */}
          {activeSection === "payments" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Deposit Payment Gateways</h2>
                    <p className="text-xs text-slate-500">Configure bank accounts and mobile money options for player deposits.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddPaymentMethod}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Payment Method
                </button>
              </div>

              <div className="space-y-3">
                {settings.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 ${getMethodBadgeColor(method.color)}`}>
                        {method.shortCode}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{method.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${method.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                            {method.enabled ? "ACTIVE" : "DISABLED"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono mt-0.5">
                          {method.accountName} • <b>{method.accountNumber}</b>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(method.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          method.enabled ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                      >
                        {method.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditPaymentMethod(method)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 bg-white border border-slate-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: WITHDRAWALS & DAILY LIMITS */}
          {activeSection === "withdrawals" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Withdrawal Rules & Daily Limits</h2>
                  <p className="text-xs text-slate-500">Configure minimum payouts, maximum 24h daily user caps, and allowed payout channels.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Minimum Withdrawal Amount (ETB)
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={settings.withdrawalMinAmount}
                      onChange={(e) => updateSetting("withdrawalMinAmount", e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">Default: 100 ETB. Players cannot withdraw less than this amount.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-blue-500" /> Max Daily Withdrawal per Player (ETB)
                    </label>
                    <input
                      type="number"
                      min={100}
                      value={settings.withdrawalMaxDailyAmount}
                      onChange={(e) => updateSetting("withdrawalMaxDailyAmount", e.target.value)}
                      placeholder="25000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">Risk control: Caps total withdrawals per user within any 24-hour window.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Withdrawal Processing Fee (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.withdrawalFeePercent}
                    onChange={(e) => updateSetting("withdrawalFeePercent", e.target.value)}
                    placeholder="0"
                    className="w-full max-w-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400">Set to 0% for zero fee withdrawals.</p>
                </div>

                {/* Available Payout Channels */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Available Payout Channels
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(settings.withdrawalMethods || []).map((method) => (
                      <div
                        key={method.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${getMethodBadgeColor(method.color)}`}>
                            {method.shortCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{method.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleWithdrawalMethod(method.id)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                            method.enabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: WELCOME BONUS INCENTIVE */}
          {activeSection === "welcome" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Welcome Registration Gift</h2>
                  <p className="text-xs text-slate-500">Automatically credit newly registered players with free virtual play credits.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Enable Sign-Up Gift Bonus</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      New players receive an instant starting credit upon first Telegram Mini App launch.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("welcomeBonusEnabled", !settings.welcomeBonusEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.welcomeBonusEnabled ? "bg-amber-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Welcome Bonus Amount
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={settings.welcomeBonusAmount}
                      onChange={(e) => updateSetting("welcomeBonusAmount", e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">e.g. 5 ETB (Play-only virtual credit).</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Currency</label>
                    <input
                      type="text"
                      value={settings.welcomeBonusCurrency}
                      onChange={(e) => updateSetting("welcomeBonusCurrency", e.target.value)}
                      placeholder="ETB"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                  💡 <b>Security Note:</b> Welcome bonuses are strictly classified as <code>SIGNUP_BONUS</code> (virtual play credits). Users cannot withdraw them directly to Telebirr or banks without playing them in prize draws first.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: LUCKY SPIN & BOT REMINDERS */}
          {activeSection === "spin" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daily Lucky Spin & DM Reminder Bot</h2>
                  <p className="text-xs text-slate-500">Configure wheel cooldown intervals and automate Telegram bot reminders.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" /> Spin Cooldown Interval (Hours)
                  </label>
                  <select
                    value={settings.dailySpinCooldownHours}
                    onChange={(e) => updateSetting("dailySpinCooldownHours", e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="24">Every 24 Hours (Daily Standard)</option>
                    <option value="12">Every 12 Hours (Twice Daily)</option>
                    <option value="6">Every 6 Hours (Fast Paced)</option>
                    <option value="1">Every 1 Hour (High Turnover)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Time a user must wait before claiming another free spin.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50/60 border border-orange-200/70 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Automate Telegram Bot DM Reminders</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Sends an alert to users when their spin cooldown has finished.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("spinReminderDmEnabled", !settings.spinReminderDmEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.spinReminderDmEnabled ? "bg-orange-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>

                {/* Instant Reminder Dispatch Box */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-xs">Dispatch Spin Reminders Now</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerSpinReminders}
                      disabled={isTriggeringSpinReminders}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-orange-500/20"
                    >
                      {isTriggeringSpinReminders ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      <span>Trigger Bot Reminders</span>
                    </button>
                  </div>
                  {spinReminderResult && (
                    <div className="p-3 bg-white/10 rounded-xl text-xs font-mono text-orange-300">
                      {spinReminderResult}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: API & INTEGRATIONS */}
          {activeSection === "api" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">API Keys & External Services</h2>
                  <p className="text-xs text-slate-500">Manage credentials for Telegram Bot API and Verify.et receipt OCR.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Telegram Bot Token</label>
                  <div className="relative">
                    <input
                      type={showBotToken ? "text" : "password"}
                      value={settings.telegramBotToken}
                      onChange={(e) => updateSetting("telegramBotToken", e.target.value)}
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Telegram Bot Username</label>
                  <input
                    type="text"
                    value={settings.telegramBotUsername}
                    onChange={(e) => updateSetting("telegramBotUsername", e.target.value)}
                    placeholder="milkytechonlinebot"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SMTP */}
          {activeSection === "smtp" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Email & SMTP Relay Configuration</h2>
                  <p className="text-xs text-slate-500">Configure outgoing transactional emails for password resets and receipts.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => updateSetting("smtpHost", e.target.value)}
                      placeholder="smtp.zoho.com / smtp.gmail.com"
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
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SMTP User</label>
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

          {/* SECTION 9: REFERRALS */}
          {activeSection === "referrals" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Referral Program Configuration</h2>
                  <p className="text-xs text-slate-500">Configure how much bonus users earn for each friend they invite.</p>
                </div>
              </div>

              <div className="space-y-5">
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

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Reward Amount Per Referral
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.referralBonusAmount}
                      onChange={(e) => updateSetting("referralBonusAmount", e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Currency</label>
                    <input
                      type="text"
                      value={settings.referralCurrency}
                      onChange={(e) => updateSetting("referralCurrency", e.target.value)}
                      placeholder="ETB"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: DANGER ZONE */}
          {activeSection === "danger" && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-red-100">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                  <p className="text-xs text-slate-500">Irreversible actions that affect platform database state.</p>
                </div>
              </div>

              <div className="p-5 bg-red-50/60 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-red-950">Reset Platform to Clean State</h4>
                  <p className="text-xs text-red-700/80 mt-1 max-w-md">
                    Permanently wipes all campaigns, draw records, entry tickets, payments, ledger logs, and test users.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetConfirmInput("");
                    setResetResult(null);
                    setShowResetModal(true);
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all shrink-0"
                >
                  Wipe &amp; Reset Platform
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PAYMENT METHOD MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingMethodId ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Preset</label>
                <select
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Preset or Customize --</option>
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
