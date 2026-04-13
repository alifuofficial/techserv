"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTelegram } from "@/components/telegram-provider";
import { Zap, Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const { isTma } = useTelegram();
  const { status } = useSession();

  if (isTma) return null;

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="MilkyTech.Online Logo" className="h-9 w-auto object-contain" />
              <span className="text-xl font-bold tracking-tight">
                Milky<span className="text-primary text-slate-900">Tech</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner for premium tech services. Fast, reliable, and affordable solutions.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Services</h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/services/telegram-premium" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Telegram Premium
              </Link>
              <Link href="/services/telegram-bot-development" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Bot Development
              </Link>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                View All Services
              </Link>
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-2.5">
              {status === "authenticated" ? (
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
              )}
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h3>
            <div className="flex flex-col gap-2.5">
              <a href="mailto:support@milkytech.online" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" /> support@milkytech.online
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> +251-XXX-XXX-XXXX
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Addis Ababa, Ethiopia
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MilkyTech.Online. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Powered by <Zap className="h-3 w-3 text-primary" /> MilkyTech.Online
          </div>
        </div>
      </div>
    </footer>
  );
}
