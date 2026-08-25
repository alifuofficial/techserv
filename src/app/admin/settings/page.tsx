"use client";

import { useState } from "react";
import { Settings, Shield, CreditCard, Bell, Save, Globe, Users, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [referralEnabled, setReferralEnabled] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
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
              <input type="text" defaultValue="MilkyTech" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Support Email Address</label>
              <input type="email" defaultValue="support@milkytech.online" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Default Currency</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                <option>ETB (Ethiopian Birr)</option>
                <option>USD (US Dollar)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Timezone</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                <option>Africa/Addis_Ababa (EAT)</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
        </section>

        {/* Referral System */}
        <section className={`bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 transition-all duration-300 ${!referralEnabled ? 'bg-slate-50 border-slate-200 opacity-75' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${referralEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Referral System</h2>
                <p className="text-sm text-slate-500">Configure multi-level rewards for invites.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={referralEnabled} onChange={() => setReferralEnabled(!referralEnabled)} />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-sm font-bold text-slate-700">{referralEnabled ? 'Active' : 'Disabled'}</span>
            </label>
          </div>
          
          <div className={`space-y-8 ${!referralEnabled ? 'pointer-events-none' : ''}`}>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Reward Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl cursor-pointer">
                  <input type="radio" name="rewardType" defaultChecked className="mt-1" />
                  <div>
                    <p className="font-bold text-emerald-900">Fixed Cash Reward</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">Users receive a fixed ETB amount deposited into their wallet per referral.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 border-transparent bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-colors">
                  <input type="radio" name="rewardType" className="mt-1" />
                  <div>
                    <p className="font-bold text-slate-900">Discount on Entry</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Users receive a percentage discount on their next ticket purchase.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Base Reward Amount</label>
                <div className="relative">
                  <input type="number" defaultValue="50" className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-lg font-bold text-slate-900" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ETB</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tree Earning (Multi-Level)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Level 1 (Direct)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue="10" className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-mono font-bold" />
                      <span className="text-slate-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Level 2 (Indirect)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue="5" className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-mono font-bold" />
                      <span className="text-slate-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>
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
            {/* Telebirr */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg shrink-0">TB</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Telebirr</h4>
                  <p className="text-sm text-slate-500">Manual Transfer (0911234567)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* CBE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-lg shrink-0">CBE</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">CBE Birr</h4>
                  <p className="text-sm text-slate-500">Manual Transfer (1000123456789)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            <button className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-slate-600 font-bold text-sm transition-all flex items-center justify-center gap-2">
              + Add New Gateway
            </button>
          </div>
        </section>

        {/* Security & Access */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 opacity-75">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Security & Access</h2>
              <p className="text-sm text-slate-500">Manage 2FA and admin privileges.</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4 pl-14">Coming soon in next update...</p>
        </section>

      </div>
    </div>
  );
}
