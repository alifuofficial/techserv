"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Calculator, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    entryPrice: "", 
    maxEntries: "", 
    productCost: "",
    startsAt: "",
    endsAt: "",
    status: "DRAFT",
    imageUrl: ""
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/admin/campaigns/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load campaign");
        
        const c = data.campaign;
        setFormData({
          title: c.title || "",
          slug: c.slug || "",
          description: c.description || "",
          entryPrice: c.entryPrice?.toString() || "",
          maxEntries: c.maxEntries?.toString() || "",
          productCost: c.productCost?.toString() || "",
          startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : "",
          endsAt: c.endsAt ? new Date(c.endsAt).toISOString().slice(0, 16) : "",
          status: c.status || "DRAFT",
          imageUrl: c.imageUrl || ""
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  const generateSlug = () => {
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, slug });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Financial Calculation
  const entryPriceNum = parseFloat(formData.entryPrice) || 0;
  const maxEntriesNum = parseInt(formData.maxEntries, 10) || 0;
  const productCostNum = parseFloat(formData.productCost) || 0;

  const targetGross = entryPriceNum * maxEntriesNum;
  const projectedNetProfit = targetGross - productCostNum;
  const projectedRoi = productCostNum > 0 ? ((projectedNetProfit / productCostNum) * 100).toFixed(1) : "0.0";
  const breakEvenTickets = entryPriceNum > 0 ? Math.ceil(productCostNum / entryPriceNum) : 0;

  const saveCampaign = async (statusOverride?: string) => {
    setLoading(true);
    setError("");

    const payload = { ...formData };
    if (statusOverride) {
      payload.status = statusOverride;
    }

    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update campaign");

      router.push("/admin/campaigns"); 
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCampaign();
  };

  if (initialLoading) {
    return <div className="p-12 text-center text-slate-400 font-semibold">Loading campaign details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/campaigns" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Campaign</h1>
            <p className="text-xs text-slate-500">Update campaign specifications, pricing, product market cost, and status.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/draws`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Live Draw Room
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Campaign Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="title" 
                required 
                value={formData.title} 
                onChange={handleChange} 
                onBlur={generateSlug}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-semibold"
                placeholder="e.g. iPhone 17 Pro Max Giveaway"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">URL Slug <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="slug" 
                required 
                value={formData.slug} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-mono"
                placeholder="iphone-17-pro-max"
              />
            </div>
          </div>

          <div className="space-y-2 quill-container">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Description <span className="text-red-500">*</span></label>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
              <ReactQuill 
                theme="snow"
                value={formData.description} 
                onChange={handleDescriptionChange}
                placeholder="Describe the campaign, rules, and specifications..."
                className="h-56"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'clean']
                  ]
                }}
              />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Product Image (Optional)</label>
            <div className="flex items-center gap-6">
              {formData.imageUrl ? (
                <div className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 relative shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.imageUrl} alt="Campaign Product" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="absolute top-2 right-2 bg-white/90 p-1 rounded-full text-red-500 hover:bg-white shadow-sm transition-all"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center flex-shrink-0 text-slate-400">
                  <span className="text-[11px] font-bold">No Image</span>
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-bold
                    file:bg-emerald-50 file:text-emerald-700
                    hover:file:bg-emerald-100 transition-all cursor-pointer
                  "
                />
                <p className="text-[11px] text-slate-400">Upload a square image (e.g. 800x800). Max 2MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financials, Product Cost & Profit Calculator */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Financials, Market Cost & Profit Margins</h2>
              <p className="text-[11px] text-slate-500">Set ticket price, max capacity, and product purchase cost to calculate your net profits.</p>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
              🔒 Admin Only • Hidden from Players
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Market Price / Purchase Cost */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Product Market Price / Cost</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">ETB</span>
                <input 
                  type="number" 
                  name="productCost" 
                  min="0"
                  value={formData.productCost} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-purple-200/80 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-900 font-bold"
                  placeholder="e.g. 200000"
                />
              </div>
              <p className="text-[11px] text-slate-400">What you paid / actual product value (hidden from users).</p>
            </div>

            {/* Entry Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Entry Ticket Price <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">ETB</span>
                <input 
                  type="number" 
                  name="entryPrice" 
                  required 
                  min="1"
                  value={formData.entryPrice} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-bold"
                  placeholder="e.g. 200"
                />
              </div>
              <p className="text-[11px] text-slate-400">Price per ticket entry paid by player.</p>
            </div>
            
            {/* Maximum Entries */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Total Tickets <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="maxEntries" 
                required 
                min="1"
                value={formData.maxEntries} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-bold"
                placeholder="e.g. 2000"
              />
              <p className="text-[11px] text-slate-400">Total tickets required to sell out.</p>
            </div>
          </div>

          {/* Live Profit Calculation Preview Box */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Campaign Profit Projection</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {projectedRoi}% ROI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Target Gross Revenue</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {targetGross.toLocaleString()} ETB
                </div>
                <div className="text-[10px] text-slate-400">({maxEntriesNum} × {entryPriceNum} ETB)</div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Product Market Cost</div>
                <div className="text-base font-black text-rose-400 font-mono mt-0.5">
                  -{productCostNum.toLocaleString()} ETB
                </div>
                <div className="text-[10px] text-slate-400">Purchase / Asset Cost</div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Projected Net Profit</div>
                <div className={`text-base font-black font-mono mt-0.5 ${projectedNetProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {projectedNetProfit >= 0 ? "+" : ""}{projectedNetProfit.toLocaleString()} ETB
                </div>
                <div className="text-[10px] text-slate-400">Your clean margin</div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Break-Even Point</div>
                <div className="text-base font-black text-blue-400 font-mono mt-0.5">
                  {breakEvenTickets.toLocaleString()} Tickets
                </div>
                <div className="text-[10px] text-slate-400">
                  ({maxEntriesNum > 0 ? Math.round((breakEvenTickets / maxEntriesNum) * 100) : 0}% of campaign)
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Timeline & Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Start Date & Time <span className="text-red-500">*</span></label>
              <input 
                type="datetime-local" 
                name="startsAt" 
                required 
                value={formData.startsAt} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date & Time <span className="text-red-500">*</span></label>
              <input 
                type="datetime-local" 
                name="endsAt" 
                required 
                value={formData.endsAt} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 appearance-none"
              >
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ACTIVE">Active (Live)</option>
                <option value="DRAWING">Drawing (Sold out / Ready for RNG)</option>
                <option value="COMPLETED">Completed (Finalized)</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/admin/campaigns" className="px-6 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </Link>
          <button 
            type="button" 
            onClick={() => saveCampaign("ACTIVE")}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Publishing..." : "Publish & Set Active"}
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
