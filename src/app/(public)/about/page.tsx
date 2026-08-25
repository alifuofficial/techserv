import { ShieldCheck, Trophy, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-[#0B0F19] min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Minimal Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Fairness meets opportunity.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            MilkyTech is an Ethiopia-based prize platform dedicated to transforming how campaigns are run—combining absolute transparency with incredible rewards.
          </p>
        </div>
      </section>

      {/* Customer Service Image Section */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-slate-900 border border-white/5 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=2669&auto=format&fit=crop" 
              alt="Ethiopian Customer Support Team" 
              className="w-full h-full object-cover object-center opacity-90 hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 right-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                24/7 Local Support in Addis Ababa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Simplified */}
      <section className="py-24 bg-[#080B12] border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Provably Fair</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                We use cryptographically secure random number generators. Every draw is verifiable and completely unbiased.
              </p>
            </div>
            <div className="space-y-4">
              <Trophy className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Real Prizes</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                From tech gadgets to vehicles, we partner with trusted local merchants to ensure authentic, high-quality rewards.
              </p>
            </div>
            <div className="space-y-4">
              <Heart className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Built for You</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Proudly rooted in Ethiopia, our dedicated Habesha customer service team is here to support you with local expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean CTA */}
      <section className="py-32 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Experience the difference.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-white hover:bg-slate-100 text-slate-900 h-12 px-8 rounded-full font-semibold border-none" asChild>
              <Link href="/auth/register">Join MilkyTech</Link>
            </Button>
            <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 h-12 px-8 rounded-full font-semibold" asChild>
              <Link href="/campaigns">Browse Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
