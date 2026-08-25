"use client";

import { useState } from "react";
import { User, Shield, Bell, CheckCircle2, Save, Lock, AlertTriangle, UploadCloud, Smartphone, Mail, FileText } from "lucide-react";

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500">Manage your profile, security preferences, and account verification.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('verification')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'verification' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Shield className="w-4 h-4" /> Identity Verification
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Lock className="w-4 h-4" /> Security & Password
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'notifications' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          
          {/* Profile Details */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Details</h2>
                <p className="text-sm text-slate-500 mb-6">Update your personal information and profile photo.</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md relative overflow-hidden group cursor-pointer">
                  <span>D</span>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadCloud className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Profile Photo</h3>
                  <p className="text-xs text-slate-500 mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Upload New</button>
                    <button className="px-4 py-2 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">Remove</button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 max-w-2xl pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                    <input type="text" defaultValue="Dawit" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input type="text" defaultValue="Tadesse" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" disabled defaultValue="dawit@example.com" className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-500">Email address cannot be changed once registered.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" defaultValue="+251 911 234 567" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identity Verification */}
          {activeTab === 'verification' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Identity Verification (KYC)</h2>
                <p className="text-sm text-slate-500 mb-6">Verify your identity to claim high-value prizes and withdraw funds.</p>
              </div>
              
              <div className="max-w-2xl bg-amber-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Action Required</h3>
                    <p className="text-sm text-slate-700 mb-4">Your account is currently unverified. You are allowed to purchase tickets, but you must verify your identity before claiming any physical prizes or withdrawing wallet balances.</p>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Start Verification Process
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">What you will need</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> A valid Government-issued ID (Passport, National ID)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> A clear selfie to match your ID
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Proof of address (Utility bill or bank statement)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Security & Password</h2>
                <p className="text-sm text-slate-500 mb-6">Manage your password and secure your account.</p>
              </div>
              
              <div className="space-y-6 max-w-xl">
                <div className="space-y-4 pb-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Change Password</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <button className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors">
                    Update Password
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /> Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500 max-w-sm mt-1">Add an extra layer of security to your account by requiring an SMS code on login.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-slate-500 mb-6">Choose what updates you want to receive from MilkyTech.</p>
              </div>
              
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">Draw Results</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Get notified immediately if you win a prize.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">New Campaigns</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Receive alerts when exciting new campaigns launch.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">Promotions & Discounts</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Special offers, free entries, and bonus credits.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
