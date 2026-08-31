"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Store,
  MoreVertical,
  Download,
  Eye,
  Ban,
  CheckCircle2,
  Percent,
  TrendingUp,
  ShieldCheck,
  Plus,
  Loader2,
  RefreshCw,
  X,
  Mail,
  Phone,
  Lock,
  DollarSign,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MerchantItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  campaigns: number;
  activeCampaigns: number;
  revenue: string;
  revenueAmount: number;
  commission: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  createdAt: string;
}

interface MerchantStats {
  totalMerchants: number;
  partnerCampaigns: number;
  totalRevenue: string;
  avgCommission: string;
}

export default function AdminMerchantsClient() {
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [stats, setStats] = useState<MerchantStats>({
    totalMerchants: 0,
    partnerCampaigns: 0,
    totalRevenue: "0 ETB",
    avgCommission: "15.0%",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Onboard Merchant Modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    email: "",
    phone: "",
    commissionRate: "15%",
    password: "",
  });

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/merchants");
      const data = await res.json();
      if (data.success) {
        setMerchants(data.data.merchants);
        setStats(data.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const updateStatus = async (userId: string, newStatus: "ACTIVE" | "SUSPENDED") => {
    setIsUpdating(userId);
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMerchants((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, status: newStatus } : m))
        );
        fetchMerchants();
      } else {
        alert(data.error || "Failed to update merchant status");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating merchant");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEditCommission = async (merchant: MerchantItem) => {
    const newComm = prompt(`Enter new commission rate for ${merchant.name}:`, merchant.commission);
    if (!newComm) return;

    setIsUpdating(merchant.userId);
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: merchant.userId, commissionRate: newComm }),
      });
      const data = await res.json();
      if (data.success) {
        setMerchants((prev) =>
          prev.map((m) =>
            m.userId === merchant.userId
              ? { ...m, commission: newComm.includes("%") ? newComm : `${newComm}%` }
              : m
          )
        );
      } else {
        alert(data.error || "Failed to update commission");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating commission");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.email) {
      alert("Please fill in Business Name and Email.");
      return;
    }

    setIsOnboarding(true);
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowOnboardModal(false);
        setOnboardForm({
          name: "",
          email: "",
          phone: "",
          commissionRate: "15%",
          password: "",
        });
        fetchMerchants();
      } else {
        alert(data.error || "Failed to onboard merchant");
      }
    } catch (e) {
      console.error(e);
      alert("Network error onboarding merchant");
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleExportCSV = () => {
    if (merchants.length === 0) return;
    const headers = "Merchant ID,Business Name,Contact Email,Phone,Total Campaigns,Active Campaigns,Total Revenue,Commission,Status,Joined Date\n";
    const rows = merchants
      .map(
        (m) =>
          `"${m.id}","${m.name}","${m.email}","${m.phone || 'N/A'}","${m.campaigns}","${m.activeCampaigns}","${m.revenue}","${m.commission}","${m.status}","${m.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MilkyTech_Merchants_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery));

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-600" /> Real Merchant & Partner Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Onboard, review revenue splits, configure commissions, and manage third-party merchant partners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMerchants}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Onboard Merchant
          </button>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Merchants</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Store className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalMerchants}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Active verified business partners</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Campaigns</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.partnerCampaigns}</h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Live sponsored grand prize draws</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Revenue</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalRevenue}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Cumulative ticket sales volume</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Commission</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Percent className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.avgCommission}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Standard partner fee tier</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Merchant Name, Email, or Phone..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Approval</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Merchant Business</th>
                <th className="px-6 py-4">Campaigns</th>
                <th className="px-6 py-4">Gross Revenue</th>
                <th className="px-6 py-4">Platform Cut</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading merchant partners from database...
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 space-y-2">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-sm">No Merchants Onboarded Yet</p>
                    <p className="text-xs text-slate-400">Click &ldquo;Onboard Merchant&rdquo; above to register your first partner.</p>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0 border border-purple-100 shadow-sm">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-0.5">{merchant.name}</div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                          <span>{merchant.email}</span>
                          {merchant.phone && <span className="text-slate-400">• {merchant.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{merchant.campaigns} Total</span>
                      {merchant.activeCampaigns > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                          {merchant.activeCampaigns} Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{merchant.revenue}</td>
                    <td className="px-6 py-4">
                      <span className="bg-amber-50 text-amber-700 font-mono font-bold px-2.5 py-1 rounded-lg text-xs border border-amber-200">
                        {merchant.commission}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {merchant.status === "ACTIVE" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"><CheckCircle2 className="w-3 h-3" /> Active</span>}
                      {merchant.status === "PENDING" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">Pending</span>}
                      {merchant.status === "SUSPENDED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 shadow-sm"><Ban className="w-3 h-3" /> Suspended</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            disabled={isUpdating === merchant.userId}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-purple-500/20"
                          >
                            {isUpdating === merchant.userId ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <MoreVertical className="w-4 h-4" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                          <DropdownMenuLabel className="text-xs text-slate-500 font-bold uppercase tracking-wider px-3 py-2">Merchant Options</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          
                          <DropdownMenuItem 
                            onClick={() => handleEditCommission(merchant)}
                            className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-xs py-2 px-3 font-semibold"
                          >
                            <Percent className="w-3.5 h-3.5" /> Edit Commission Split
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-100" />
                          
                          {merchant.status !== "ACTIVE" && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(merchant.userId, "ACTIVE")}
                              className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-xs py-2 px-3 font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Set as Active
                            </DropdownMenuItem>
                          )}
                          
                          {merchant.status === "ACTIVE" && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(merchant.userId, "SUSPENDED")}
                              className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-xs py-2 px-3 font-semibold"
                            >
                              <Ban className="w-3.5 h-3.5" /> Suspend Merchant
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div>Showing {filteredMerchants.length} of {merchants.length} real merchant partners</div>
        </div>
      </div>

      {/* ONBOARD MERCHANT MODAL */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard New Merchant</h3>
                  <p className="text-[11px] text-slate-500">Register a partner business to run sponsored campaigns</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  placeholder="e.g. Addis Electronics & Motors"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={onboardForm.email}
                  onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                  placeholder="partner@business.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone (Optional)</label>
                  <input
                    type="text"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    placeholder="+251911..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Commission Split</label>
                  <input
                    type="text"
                    value={onboardForm.commissionRate}
                    onChange={(e) => setOnboardForm({ ...onboardForm, commissionRate: e.target.value })}
                    placeholder="15%"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Merchant Portal Password</label>
                <input
                  type="password"
                  value={onboardForm.password}
                  onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                  placeholder="Set login password..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                >
                  {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Onboard Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
