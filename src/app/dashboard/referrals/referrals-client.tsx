"use client";

import { useState } from "react";
import { Users, Link as LinkIcon, CheckCircle2, Copy, Trophy, Target, Gift } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ReferralsClient({ 
  referralCode, 
  referrals,
  host 
}: { 
  referralCode: string, 
  referrals: any[],
  host: string
}) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${host}/auth/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Refer & Earn</h1>
          <p className="text-slate-500 text-sm mt-1">Invite friends and earn rewards when they buy tickets.</p>
        </div>
      </div>

      {/* Main Link Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-10 shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Share MilkyTech with your friends!</h2>
            <p className="text-emerald-50 text-lg mb-8 max-w-lg">
              Get bonus entries and ETB rewards every time a friend signs up and participates in a campaign using your link.
            </p>
            
            <div className="bg-black/20 backdrop-blur-sm p-2 rounded-2xl flex items-center gap-2 max-w-xl mx-auto md:mx-0 border border-white/10">
              <div className="bg-white/10 p-3 rounded-xl">
                <LinkIcon className="w-5 h-5 text-emerald-100" />
              </div>
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="bg-transparent border-none outline-none text-emerald-50 flex-1 font-mono text-sm sm:text-base px-2 min-w-0"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2 shrink-0 shadow-lg"
              >
                {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Link</>}
              </button>
            </div>
          </div>
          
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-inner hidden lg:flex">
            <Gift className="w-24 h-24 text-emerald-100 drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Referrals</p>
            <h3 className="text-3xl font-black text-slate-900">{referrals.length}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Rewards Earned</p>
            <h3 className="text-3xl font-black text-slate-900">0 ETB</h3>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-900">Your Referrals</h2>
        </div>
        
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                          {ref.name ? ref.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{ref.name}</p>
                          <p className="text-xs text-slate-500">Active</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(ref.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        Registered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-700 mb-1">No referrals yet</p>
            <p className="text-sm max-w-sm mx-auto">Share your link with friends to start earning rewards when they join and play!</p>
          </div>
        )}
      </div>

    </div>
  );
}
