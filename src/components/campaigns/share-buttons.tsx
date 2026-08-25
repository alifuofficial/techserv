"use client";

import { Share2, Twitter, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this giveaway: ${title}`)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this giveaway: ${title}`)}`,
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-t border-slate-200 mt-6">
      <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
        <Share2 className="w-4 h-4" /> Share this campaign:
      </span>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-full w-9 h-9 p-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" asChild>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
            <Twitter className="w-4 h-4 fill-current" />
          </a>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full w-9 h-9 p-0 bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100" asChild>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
            <Facebook className="w-4 h-4 fill-current" />
          </a>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full w-9 h-9 p-0 bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100" asChild>
          <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
            {/* Telegram icon approximation since Lucide doesn't have a perfect one, we use Send or just text */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.07-.05-.17-.02-.25 0-.11.03-1.78 1.14-5.06 3.34-.48.33-.92.49-1.32.48-.43-.01-1.24-.24-1.84-.44-.74-.24-1.33-.37-1.28-.79.03-.22.36-.44.99-.68 3.85-1.68 6.43-2.79 7.74-3.33 3.68-1.54 4.45-1.81 4.96-1.82.11 0 .36.03.5.15.11.1.15.22.16.35-.01.12-.02.26-.04.38z"/>
            </svg>
          </a>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className={`rounded-full h-9 px-3 gap-2 transition-colors ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
        >
          {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          <span className="text-xs font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
        </Button>
      </div>
    </div>
  );
}
