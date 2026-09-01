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
  Flame,
  Megaphone,
  Share2,
  Lock,
  ArrowRight,
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

interface ChannelConfig {
  channelHandle: string;
  autoBroadcastWinners: boolean;
  autoBroadcastCampaigns: boolean;
}

export default function NotificationsClient({
  initialBot,
  initialTemplates,
  campaigns,
  initialChannel,
}: {
  initialBot: BotInfo;
  initialTemplates: TemplateItem[];
  campaigns: CampaignOption[];
  initialChannel: ChannelConfig;
}) {
  const [activeTab, setActiveTab] = useState<"CHANNEL" | "TEMPLATES" | "BROADCAST" | "TEST">("CHANNEL");
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
    initialTemplates[0]?.eventType || "CHANNEL_WINNER_ANNOUNCEMENT"
  );

  // Official Channel state
  const [channelHandle, setChannelHandle] = useState(initialChannel.channelHandle || "@milkytechonline");
  const [autoBroadcastWinners, setAutoBroadcastWinners] = useState(initialChannel.autoBroadcastWinners ?? true);
  const [autoBroadcastCampaigns, setAutoBroadcastCampaigns] = useState(initialChannel.autoBroadcastCampaigns ?? true);
  const [channelSaveStatus, setChannelSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");
  const [channelTestStatus, setChannelTestStatus] = useState<string | null>(null);
  const [isTestingChannel, setIsTestingChannel] = useState(false);

  // Active editing template
  const activeTemplate = templates.find((t) => t.eventType === selectedTemplateKey) || templates[0];
  const [editingText, setEditingText] = useState(activeTemplate?.templateText || "");
  const [editingEnabled, setEditingEnabled] = useState(activeTemplate?.enabled ?? true);
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState<"OFFICIAL_CHANNEL" | "ALL_USERS" | "CAMPAIGN_HOLDERS" | "SPECIFIC_USER">("OFFICIAL_CHANNEL");
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

  // Save Channel Settings
  const handleSaveChannelSettings = async () => {
    setChannelSaveStatus("SAVING");
    try {
      const res = await fetch("/api/admin/notifications/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelHandle: channelHandle.trim(),
          autoBroadcastWinners,
          autoBroadcastCampaigns,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChannelSaveStatus("SAVED");
        setTimeout(() => setChannelSaveStatus("IDLE"), 2500);
      } else {
        setChannelSaveStatus("ERROR");
      }
    } catch (e) {
      setChannelSaveStatus("ERROR");
    }
  };

  // Send Live Test Winner Post to Channel
  const handleSendTestChannelPost = async () => {
    setIsTestingChannel(true);
    setChannelTestStatus(null);

    try {
      const res = await fetch("/api/admin/notifications/channel-test", {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        setChannelTestStatus(`✅ Success: ${data.message}`);
      } else {
        setChannelTestStatus(`❌ ${data.error || "Failed to post to channel"}`);
      }
    } catch (e: any) {
      setChannelTestStatus("❌ Network error sending test post to channel.");
    } finally {
      setIsTestingChannel(false);
    }
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

    const targetDesc =
      broadcastTarget === "OFFICIAL_CHANNEL"
        ? `Official Public Channel (${channelHandle})`
        : broadcastTarget === "ALL_USERS"
        ? "All Registered Users"
        : broadcastTarget === "CAMPAIGN_HOLDERS"
        ? "Campaign Ticket Holders"
        : `User ID: ${broadcastUserId}`;

    if (!confirm(`Are you sure you want to broadcast this message to ${targetDesc}?`)) return;

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

  // Send Test Message to user
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
      .replace(/{winner_name}/g, "Abebe Kebede (@abebe_k)")
      .replace(/{prize_title}/g, "Apple iPhone 17 Pro Max 256GB")
      .replace(/{prize_value}/g, "200,000")
      .replace(/{user_name}/g, "Abebe Kebede")
      .replace(/{campaign_title}/g, "iPhone 17 Pro Max Mega Draw")
      .replace(/{ticket_numbers}/g, "TKT-IPHO-0142, TKT-IPHO-0143")
      .replace(/{quantity}/g, "2")
      .replace(/{total_price}/g, "400")
      .replace(/{currency}/g, "ETB")
      .replace(/{amount}/g, "500")
      .replace(/{new_balance}/g, "1,250")
      .replace(/{provider}/g, "Telebirr")
      .replace(/{tx_id}/g, "TB-982187321")
      .replace(/{winning_ticket}/g, "TKT-IPHO-0142")
      .replace(/{snapshot_hash}/g, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
      .replace(/{random_seed}/g, "NIST-BEACON-LIVE-SEED-99420-AUDITED")
      .replace(/{reason}/g, "Account number does not match phone.")
      .replace(/{referred_name}/g, "Alifu H.")
      .replace(/{reward_amount}/g, "10")
      .replace(/{referral_code}/g, "MILKY-9821AF")
      .replace(/{referral_link}/g, "https://t.me/milkytechonlinebot?start=MILKY-9821AF")
      .replace(/{bonus_amount}/g, "10")
      .replace(/{ticket_price}/g, "50")
      .replace(/{draw_date}/g, "Dec 31, 2026")
      .replace(/{campaign_url}/g, "https://milkytech.online/telegram/campaigns/iphone-17-pro")
      .replace(/{channel_url}/g, `https://t.me/${channelHandle.replace("@", "")}`);

    return replaced;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "CHANNEL_WINNER_ANNOUNCEMENT":
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      case "WELCOME_REGISTER":
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case "CAMPAIGN_STARTED":
        return <Flame className="w-4 h-4 text-orange-500" />;
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" /> Telegram Channel & Notifications Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automate public winner certificates to <strong>{channelHandle}</strong>, configure trigger templates, and broadcast messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://t.me/${channelHandle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Megaphone className="w-3.5 h-3.5" /> Channel: {channelHandle}
          </a>

          <a
            href={`https://t.me/${initialBot.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Bot: @{initialBot.username}
          </a>
        </div>
      </div>

      {/* Bot & Channel Status KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Official Public Channel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Public Channel</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ADMIN BOT CONNECTED
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 mt-0.5 truncate">{channelHandle}</p>
          </div>
        </div>

        {/* Card 2: Telegram Bot Status */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Bot</span>
            <p className="text-sm font-black text-slate-900 mt-0.5">@{initialBot.username}</p>
          </div>
        </div>

        {/* Card 3: Active Trigger Rules */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto Proof Engine</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {autoBroadcastWinners ? "Instant Auto-Post" : "Paused"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab("CHANNEL")}
          className={`px-5 py-3 text-xs uppercase font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "CHANNEL"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Megaphone className="w-4 h-4" /> Official Public Channel ({channelHandle})
        </button>

        <button
          onClick={() => setActiveTab("TEMPLATES")}
          className={`px-5 py-3 text-xs uppercase font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "TEMPLATES"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Trigger Notification Templates
        </button>

        <button
          onClick={() => setActiveTab("BROADCAST")}
          className={`px-5 py-3 text-xs uppercase font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "BROADCAST"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Radio className="w-4 h-4" /> Broadcast Announcement
        </button>

        <button
          onClick={() => setActiveTab("TEST")}
          className={`px-5 py-3 text-xs uppercase font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "TEST"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="w-4 h-4" /> Direct Test Simulator
        </button>
      </div>

      {/* TAB 1: OFFICIAL PUBLIC CHANNEL AUTOMATION */}
      {activeTab === "CHANNEL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Configuration & Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-purple-600" /> Automated Winner Channel Broadcast Bot
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Whenever any draw executes in <strong>Live Draws</strong> or an <strong>Instant 5-Minute Draw</strong> completes, the bot immediately posts the winner&apos;s name, photo, ticket number, and SHA-256 Provably Fair proof hash to your channel.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Channel Handle Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Public Telegram Channel Handle *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={channelHandle}
                      onChange={(e) => setChannelHandle(e.target.value)}
                      placeholder="@milkytechonline"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Make sure <strong>@{initialBot.username}</strong> is added as an <strong>Administrator</strong> in <strong>{channelHandle}</strong> with &quot;Post Messages&quot; permission.
                  </p>
                </div>

                {/* Automation Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Auto-Post Live & Instant Draw Winners</h4>
                      <p className="text-[11px] text-slate-500">Automatically posts certified winner proof certificates upon every draw execution.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBroadcastWinners(!autoBroadcastWinners)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                        autoBroadcastWinners ? "bg-purple-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Auto-Post New Grand Campaign Launches</h4>
                      <p className="text-[11px] text-slate-500">Notifies channel members immediately when you publish a new campaign.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBroadcastCampaigns(!autoBroadcastCampaigns)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                        autoBroadcastCampaigns ? "bg-purple-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>
                </div>

                {/* Save Channel Settings Button */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveChannelSettings}
                    disabled={channelSaveStatus === "SAVING"}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all"
                  >
                    {channelSaveStatus === "SAVING" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : channelSaveStatus === "SAVED" ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Channel Settings Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Channel Settings
                      </>
                    )}
                  </button>

                  <a
                    href={`https://t.me/${channelHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            </div>

            {/* Test Channel Broadcast Action Box */}
            <div className="bg-gradient-to-br from-[#180F29] to-[#0D0717] rounded-3xl p-6 border border-purple-500/30 text-white space-y-4 shadow-xl shadow-purple-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Live Channel Test Verification</h4>
                  <p className="text-xs text-purple-200/80">Send a live sample winner proof certificate to {channelHandle}</p>
                </div>
              </div>

              {channelTestStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    channelTestStatus.startsWith("✅") ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" : "bg-red-500/20 border border-red-500/30 text-red-300"
                  }`}
                >
                  {channelTestStatus}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendTestChannelPost}
                disabled={isTestingChannel}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTestingChannel ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Posting to {channelHandle}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Live Sample Certificate to {channelHandle}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Live Telegram Channel Post Preview */}
          <div className="lg:col-span-6 space-y-4">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Live Telegram Channel Post Preview
            </label>

            <div className="bg-[#182533] p-5 rounded-3xl border border-slate-800 text-white shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 text-xs">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Megaphone className="w-4 h-4" /> {channelHandle}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Public Channel</span>
              </div>

              {/* Sample Photo Header */}
              <div className="rounded-2xl overflow-hidden border border-white/10 relative h-48 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"
                  alt="iPhone Prize"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                  <Trophy className="w-3 h-3 fill-slate-950" /> 200,000 ETB PRIZE
                </div>
              </div>

              {/* Formatted Message */}
              <div
                className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-100 pt-1"
                dangerouslySetInnerHTML={{
                  __html: getPreviewText(
                    DEFAULT_TEMPLATES.CHANNEL_WINNER_ANNOUNCEMENT?.defaultTemplate || ""
                  ),
                }}
              />

              {/* Inline Interactive Keyboard Button */}
              <div className="pt-2">
                <div className="w-full py-2.5 px-4 bg-[#2B5278] hover:bg-[#346290] text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <span>🎟️ Play Next Draw on Mini App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-[10px] text-right text-slate-400 pt-1 font-mono">10:45 AM • 1.2K views</div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TRIGGER TEMPLATES */}
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

          {/* Right: Template Editor */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
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

      {/* TAB 3: BROADCAST MESSENGER */}
      {activeTab === "BROADCAST" && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Broadcast Announcement</h2>
            <p className="text-sm text-slate-500">
              Send instant marketing announcements to your Official Public Channel or directly to registered players.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-6 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Broadcast Destination
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Option 1: Official Channel */}
                <div
                  onClick={() => setBroadcastTarget("OFFICIAL_CHANNEL")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    broadcastTarget === "OFFICIAL_CHANNEL"
                      ? "border-purple-500 bg-purple-50/50 shadow-sm ring-2 ring-purple-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Megaphone className="w-5 h-5 text-purple-600 mb-1" />
                  <h4 className="font-bold text-slate-900 text-xs">Official Channel</h4>
                  <p className="text-[11px] text-slate-400 truncate">{channelHandle}</p>
                </div>

                {/* Option 2: All Users */}
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
                  <p className="text-[11px] text-slate-400">All registered members</p>
                </div>

                {/* Option 3: Campaign Entrants */}
                <div
                  onClick={() => setBroadcastTarget("CAMPAIGN_HOLDERS")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    broadcastTarget === "CAMPAIGN_HOLDERS"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Ticket className="w-5 h-5 text-purple-600 mb-1" />
                  <h4 className="font-bold text-slate-900 text-xs">Entrants</h4>
                  <p className="text-[11px] text-slate-400">Campaign ticket holders</p>
                </div>

                {/* Option 4: Specific User */}
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
                  <p className="text-[11px] text-slate-400">Target individual ID</p>
                </div>
              </div>
            </div>

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

            {broadcastTarget === "SPECIFIC_USER" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">User ID / Telegram Chat ID</label>
                <input
                  type="text"
                  value={broadcastUserId}
                  onChange={(e) => setBroadcastUserId(e.target.value)}
                  placeholder="e.g. user_cm..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Message Content (HTML Allowed: &lt;b&gt;, &lt;i&gt;, &lt;code&gt;, &lt;a href=&quot;&quot;&gt;)
              </label>
              <textarea
                rows={6}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write your broadcast announcement here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            {broadcastResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 space-y-1">
                <p className="font-bold">🎉 Broadcast Dispatched Successfully!</p>
                <p>Delivered to: <b>{broadcastResult.sentCount}</b> ({broadcastResult.failedCount} failed).</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isBroadcasting || !broadcastMessage.trim()}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
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

      {/* TAB 4: TEST SIMULATOR */}
      {activeTab === "TEST" && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Telegram Direct Test</h2>
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
                Make sure you have started <strong>@{initialBot.username}</strong> in Telegram first.
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
