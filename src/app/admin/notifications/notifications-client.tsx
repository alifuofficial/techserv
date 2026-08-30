"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  Sparkles,
  Ticket,
  Wallet,
  AlertTriangle,
  Trophy,
  UserPlus,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  Users,
  RefreshCw,
  Save,
  Check,
  Code,
  ShieldCheck,
  Radio,
} from "lucide-react";

interface TemplateItem {
  eventType: string;
  title: string;
  description: string;
  templateText: string;
  defaultTemplate: string;
  enabled: boolean;
  availablePlaceholders: string[];
}

interface CampaignOption {
  id: string;
  title: string;
  maxEntries: number;
}

interface BotInfo {
  connected: boolean;
  username: string;
  firstName: string;
  id: number | null;
  totalTelegramUsers: number;
}

export default function NotificationsClient({
  initialBot,
  initialTemplates,
  campaigns,
}: {
  initialBot: BotInfo;
  initialTemplates: TemplateItem[];
  campaigns: CampaignOption[];
}) {
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "BROADCAST" | "TEST">("TEMPLATES");
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(initialTemplates[0]?.eventType || "TICKET_PURCHASE");
  
  // Active editing template
  const activeTemplate = templates.find((t) => t.eventType === selectedTemplateKey) || templates[0];
  const [editingText, setEditingText] = useState(activeTemplate?.templateText || "");
  const [editingEnabled, setEditingEnabled] = useState(activeTemplate?.enabled ?? true);
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState<"ALL_USERS" | "CAMPAIGN_HOLDERS" | "SPECIFIC_USER">("ALL_USERS");
  const [broadcastCampaignId, setBroadcastCampaignId] = useState(campaigns[0]?.id || "");
  const [broadcastUserId, setBroadcastUserId] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any | null>(null);

  // Test send state
  const [testChatId, setTestChatId] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // When changing selected template
  const handleSelectTemplate = (t: TemplateItem) => {
    setSelectedTemplateKey(t.eventType);
    setEditingText(t.templateText);
    setEditingEnabled(t.enabled);
    setSaveStatus("IDLE");
  };

  // Insert placeholder into text area
  const insertPlaceholder = (placeholder: string) => {
    setEditingText((prev) => prev + " " + placeholder);
  };

  // Save template
  const handleSaveTemplate = async () => {
    setSaveStatus("SAVING");
    try {
      const res = await fetch("/api/admin/notifications/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: selectedTemplateKey,
          templateText: editingText,
          enabled: editingEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.eventType === selectedTemplateKey
              ? { ...t, templateText: editingText, enabled: editingEnabled }
              : t
          )
        );
        setSaveStatus("SAVED");
        setTimeout(() => setSaveStatus("IDLE"), 2500);
      } else {
        setSaveStatus("ERROR");
      }
    } catch (e) {
      setSaveStatus("ERROR");
    }
  };

  // Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    if (!confirm(`Are you sure you want to send this broadcast message to the selected audience?`)) return;

    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: broadcastTarget,
          message: broadcastMessage,
          campaignId: broadcastTarget === "CAMPAIGN_HOLDERS" ? broadcastCampaignId : undefined,
          userId: broadcastTarget === "SPECIFIC_USER" ? broadcastUserId : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastResult(data.result);
        setBroadcastMessage("");
      } else {
        alert(data.error || "Broadcast failed");
      }
    } catch (e) {
      alert("Network error occurred during broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Send Test Message
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChatId.trim()) return;

    setIsTesting(true);
    setTestStatus(null);

    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: testChatId,
          message: editingText || "🚀 <b>MilkyTech Test Notification</b>\n\nYour Telegram bot is successfully connected!",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus("✅ Test message delivered successfully to your Telegram!");
      } else {
        setTestStatus(`❌ ${data.error || "Failed to send test message."}`);
      }
    } catch (e) {
      setTestStatus("❌ Network error sending test message.");
    } finally {
      setIsTesting(false);
    }
  };

  // Live formatted HTML preview generator
  const getPreviewText = (text: string) => {
    let replaced = text
      .replace(/{user_name}/g, "Alifu Hassan")
      .replace(/{campaign_title}/g, "iPhone 17 Pro Max 256GB")
      .replace(/{ticket_numbers}/g, "TKT-IPHO-1, TKT-IPHO-2")
      .replace(/{quantity}/g, "2")
      .replace(/{total_price}/g, "400")
      .replace(/{currency}/g, "ETB")
      .replace(/{amount}/g, "500")
      .replace(/{new_balance}/g, "1,250")
      .replace(/{provider}/g, "Telebirr")
      .replace(/{tx_id}/g, "TB-982187321")
      .replace(/{prize_title}/g, "iPhone 17 Pro Max 256GB")
      .replace(/{winning_ticket}/g, "TKT-IPHO-42")
      .replace(/{reason}/g, "Transaction screenshot was unreadable. Please re-upload.")
      .replace(/{referred_name}/g, "Abebe B.")
      .replace(/{reward_amount}/g, "50");

    return replaced;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "TICKET_PURCHASE":
        return <Ticket className="w-4 h-4 text-emerald-500" />;
      case "DEPOSIT_APPROVED":
        return <Wallet className="w-4 h-4 text-blue-500" />;
      case "DEPOSIT_REJECTED":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "WINNER_SELECTED":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "REFERRAL_REWARD":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Telegram Notification Manager</h1>
          <p className="text-sm text-slate-500">
            Configure automated event alerts (ticket purchases, deposits, winners) and send bulk broadcasts via Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/milkytechonlinebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Open @{initialBot.username}
          </a>
        </div>
      </div>

      {/* Bot Status & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telegram Bot</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
              </span>
            </div>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">@{initialBot.username}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telegram Reach</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {initialBot.totalTelegramUsers.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Users</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Triggers</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {templates.filter((t) => t.enabled).length} / {templates.length} <span className="text-xs text-slate-400 font-normal">Enabled</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("TEMPLATES")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TEMPLATES"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Automated Event Templates
        </button>

        <button
          onClick={() => setActiveTab("BROADCAST")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "BROADCAST"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Radio className="w-4 h-4" /> Bulk Broadcast Messenger
        </button>

        <button
          onClick={() => setActiveTab("TEST")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TEST"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="w-4 h-4" /> Test Simulator
        </button>
      </div>

      {/* TAB 1: AUTOMATED TEMPLATES */}
      {activeTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Template Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Event Triggers</h3>
            {templates.map((t) => {
              const isSelected = selectedTemplateKey === t.eventType;
              return (
                <div
                  key={t.eventType}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg">{getEventIcon(t.eventType)}</div>
                      <h4 className="font-bold text-sm text-slate-900">{t.title}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                        t.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {t.enabled ? "ENABLED" : "MUTED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{t.description}</p>
                </div>
              );
            })}
          </div>

          {/* Right: Template Editor & Live Phone Preview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              
              {/* Header with Enable Switch */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeTemplate.title}</h3>
                  <p className="text-xs text-slate-500">{activeTemplate.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    {editingEnabled ? "Active (Sending Alerts)" : "Disabled (Alerts Paused)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingEnabled(!editingEnabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      editingEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                  </button>
                </div>
              </div>

              {/* Placeholder Insert Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Dynamic Placeholders (Click to Insert)
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeTemplate.availablePlaceholders.map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => insertPlaceholder(ph)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs rounded-lg border border-slate-200 transition-colors"
                    >
                      {ph}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Text Area */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Telegram Message Template (HTML Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingText(activeTemplate.defaultTemplate)}
                    className="text-xs font-semibold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset to Default
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Enter message template..."
                />
              </div>

              {/* Live Preview Box */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Live Telegram Preview
                </label>
                <div className="bg-[#182533] p-4 rounded-2xl max-w-lg border border-slate-800 text-white shadow-inner">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/60 text-xs text-blue-400 font-bold">
                    <Send className="w-3.5 h-3.5" /> @{initialBot.username}
                  </div>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-100"
                    dangerouslySetInnerHTML={{ __html: getPreviewText(editingText) }}
                  />
                  <div className="text-[10px] text-right text-slate-400 mt-2 font-mono">12:45 PM</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={saveStatus === "SAVING"}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  {saveStatus === "SAVING" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : saveStatus === "SAVED" ? (
                    <>
                      <Check className="w-4 h-4" /> Template Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Template
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK BROADCAST MESSENGER */}
      {activeTab === "BROADCAST" && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Broadcast Telegram Message</h2>
            <p className="text-sm text-slate-500">
              Send instant marketing announcements, urgent alerts, or updates to your users on Telegram.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-6 text-sm">
            {/* Target Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Broadcast Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setBroadcastTarget("ALL_USERS")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    broadcastTarget === "ALL_USERS"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Users className="w-5 h-5 text-emerald-600 mb-1" />
                  <h4 className="font-bold text-slate-900 text-xs">All Users</h4>
                  <p className="text-[11px] text-slate-400">All Telegram users</p>
                </div>

                <div
                  onClick={() => setBroadcastTarget("CAMPAIGN_HOLDERS")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    broadcastTarget === "CAMPAIGN_HOLDERS"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Ticket className="w-5 h-5 text-purple-600 mb-1" />
                  <h4 className="font-bold text-slate-900 text-xs">Campaign Entrants</h4>
                  <p className="text-[11px] text-slate-400">Ticket holders of a campaign</p>
                </div>

                <div
                  onClick={() => setBroadcastTarget("SPECIFIC_USER")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    broadcastTarget === "SPECIFIC_USER"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Send className="w-5 h-5 text-blue-600 mb-1" />
                  <h4 className="font-bold text-slate-900 text-xs">Specific User</h4>
                  <p className="text-[11px] text-slate-400">Target individual user ID</p>
                </div>
              </div>
            </div>

            {/* Campaign Selector if applicable */}
            {broadcastTarget === "CAMPAIGN_HOLDERS" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Campaign</label>
                <select
                  value={broadcastCampaignId}
                  onChange={(e) => setBroadcastCampaignId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User ID if applicable */}
            {broadcastTarget === "SPECIFIC_USER" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={broadcastUserId}
                  onChange={(e) => setBroadcastUserId(e.target.value)}
                  placeholder="e.g. user_cm..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Message composer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Message Content (HTML Allowed: &lt;b&gt;, &lt;i&gt;, &lt;code&gt;, &lt;a href=""&gt;)
              </label>
              <textarea
                rows={6}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write your broadcast message here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            {/* Result Box */}
            {broadcastResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 space-y-1">
                <p className="font-bold">🎉 Broadcast Dispatched Successfully!</p>
                <p>Delivered to: <b>{broadcastResult.sentCount}</b> users ({broadcastResult.failedCount} failed / unreachable).</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isBroadcasting || !broadcastMessage.trim()}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Broadcast Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: TEST SIMULATOR */}
      {activeTab === "TEST" && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Telegram Delivery Test</h2>
            <p className="text-sm text-slate-500">
              Send a test message directly to your Telegram chat to test formatting and delivery.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Telegram Chat ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="e.g. 123456789 (Obtained from @userinfobot)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Make sure you have started <b>@{initialBot.username}</b> in Telegram first.
              </p>
            </div>

            {testStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  testStatus.startsWith("✅") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                }`}
              >
                {testStatus}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isTesting || !testChatId.trim()}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending Test...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Test Alert
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
