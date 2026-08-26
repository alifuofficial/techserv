"use client";

import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";

export default function ReferralClient({ referralLink }: { referralLink: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent("Join MilkyTech and win amazing prizes! Use my link to get started:");
  const shareUrl = encodeURIComponent(referralLink);
  const telegramShareLink = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;

  return (
    <>
      <div className="w-full bg-[#0B0F19]/50 rounded-xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-sm">
        <div className="text-left w-full pr-2 overflow-hidden">
          <p className="text-indigo-200 text-xs mb-1">Your Invite Link</p>
          <p className="text-white font-mono text-sm truncate w-full">{referralLink}</p>
        </div>
        <button 
          onClick={handleCopy}
          className="w-10 h-10 bg-white text-indigo-600 rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
      
      <a 
        href={telegramShareLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mt-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#0088cc]/20"
      >
        <Share2 className="w-5 h-5" /> Share to Telegram
      </a>
    </>
  );
}
