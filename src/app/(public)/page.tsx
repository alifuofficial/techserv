import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Ticket, Trophy, ArrowRight, PlayCircle, ShieldCheck, Heart, User, CheckCircle2, Clock } from 'lucide-react';
import { CampaignService } from '@/modules/campaigns/campaign-service';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const campaigns = await CampaignService.listPublicCampaigns();
  
  // Fill with dummy data if none exist to match the design exactly
  const displayCampaigns = campaigns.length > 0 ? campaigns.slice(0,3) : [
    {
      id: '1', title: 'Toyota Land Cruiser 300', entryPrice: 10000, currency: 'ETB',
      description: 'Brand new 2024 model',
      maxEntries: 5000, entriesSold: 3250, endsAt: new Date(Date.now() + 86400000 * 2.5),
      image: '/images/toyota.jpg',
      badge: 'Ending Soon', badgeColor: 'bg-emerald-500', bgColor: 'bg-slate-300'
    },
    {
      id: '2', title: 'iPhone 17 Pro Max 256GB', entryPrice: 8000, currency: 'ETB',
      description: 'Latest Apple smartphone',
      maxEntries: 3000, entriesSold: 1120, endsAt: new Date(Date.now() + 86400000 * 5.2),
      image: '/images/iphone.jpg',
      badge: 'Popular', badgeColor: 'bg-purple-500', bgColor: 'bg-[#E3D5E8]'
    },
    {
      id: '3', title: 'MacBook Pro 16" M4', entryPrice: 12000, currency: 'ETB',
      description: 'M4 Max, 64GB RAM',
      maxEntries: 2000, entriesSold: 180, endsAt: new Date(Date.now() + 86400000 * 10.9),
      image: '/images/macbook.jpg',
      badge: 'New', badgeColor: 'bg-amber-500', bgColor: 'bg-[#FDF6E3]'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      
      {/* HERO SECTION - MINIMALIST */}
      <section className="relative overflow-hidden bg-[#0B0F19] text-white py-16 lg:py-20 border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Column - Text */}
            <div className="space-y-6 max-w-lg">
              <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase tracking-widest border-emerald-500/30 text-emerald-300 bg-emerald-500/10 rounded-full font-semibold">
                The Ultimate Prize Platform
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Win Life-Changing <br/>
                Prizes <span className="text-emerald-400">Every Week</span>
              </h1>
              
              <p className="text-base text-slate-400 leading-relaxed">
                Join thousands of winners on the most trusted and transparent platform. Fair draws, secure payments, and amazing prizes await you.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-6 rounded-full text-sm font-medium border-none shadow-sm" asChild>
                  <Link href="/campaigns">Explore Campaigns</Link>
                </Button>
                <Button variant="ghost" className="h-11 px-6 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5" asChild>
                  <Link href="/#how-it-works"><PlayCircle className="mr-2 w-4 h-4" /> How It Works</Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Minimal Image */}
            <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <img 
                  src="/images/hero.jpg" 
                  alt="Win cars, phones, and cash" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent opacity-60"></div>
                
                {/* Minimal Happy Winners Badge */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img className="w-6 h-6 rounded-full border border-[#121826]" src="https://i.pravatar.cc/100?img=11" alt="User" />
                    <img className="w-6 h-6 rounded-full border border-[#121826]" src="https://i.pravatar.cc/100?img=12" alt="User" />
                    <img className="w-6 h-6 rounded-full border border-[#121826]" src="https://i.pravatar.cc/100?img=13" alt="User" />
                  </div>
                  <div className="text-xs font-medium text-slate-300">
                    <span className="text-white font-bold">25k+</span> Winners
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 relative inline-block">
              How It Works
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-emerald-500 rounded-full"></span>
            </h2>
            <p className="text-slate-500 mt-4">Three simple steps to win your dream prize</p>
          </div>
          
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Dotted line connector */}
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-px border-t-2 border-dashed border-slate-200 z-0"></div>

            <div className="bg-white rounded-3xl p-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative z-10 border border-slate-50">
              <div className="w-20 h-20 mx-auto bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
                <Gift className="w-8 h-8" />
                <span className="absolute -bottom-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">01</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Pick a Prize</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Browse our active campaigns and choose a prize you love.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative z-10 border border-slate-50">
              <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 relative">
                <Ticket className="w-8 h-8" />
                <span className="absolute -bottom-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">02</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Get Your Entries</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Purchase entry tickets securely using your preferred payment method.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative z-10 border border-slate-50">
              <div className="w-20 h-20 mx-auto bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-6 relative">
                <Trophy className="w-8 h-8" />
                <span className="absolute -bottom-3 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">03</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Win & Celebrate</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Once the campaign ends, our cryptographically secure draw selects a winner fairly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CAMPAIGNS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Campaigns</h2>
            <Link href="/campaigns" className="text-emerald-500 font-semibold text-sm flex items-center hover:text-emerald-600">
              View All Campaigns <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCampaigns.map((c: any) => {
              const progress = c.entriesSold ? Math.round((c.entriesSold / c.maxEntries) * 100) : 0;
              
              return (
                <Card key={c.id} className="rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className={`relative h-60 w-full ${c.bgColor || 'bg-slate-100'} p-6 flex items-center justify-center`}>
                    <img src={c.image} alt={c.title} className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-xl" />
                    
                    <div className="absolute top-4 left-4">
                      <Badge className={`${c.badgeColor || 'bg-emerald-500'} text-white border-none text-xs font-semibold px-2 py-0.5 rounded`}>
                        {c.badge || c.status}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{c.title}</h3>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{c.entriesSold || 0}/{c.maxEntries.toLocaleString()} entries sold</span>
                        <span className="font-semibold text-slate-700">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    
                    {/* Price and Time */}
                    <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                      <div>
                        <div className="text-lg font-bold text-emerald-500">{c.entryPrice / 100} {c.currency}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Per Entry</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">2d : 14h : 32m</div>
                        <div className="text-[10px] text-slate-400 font-medium">Time Left</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="pb-24 pt-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-gradient-to-r from-[#0F172A] to-[#2E1065] rounded-3xl py-12 px-8 flex flex-col md:flex-row justify-around items-center gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">25,000+</div>
                <div className="text-xs text-slate-400">Happy Users</div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/10"></div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">380+</div>
                <div className="text-xs text-slate-400">Prizes Won</div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/10"></div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">120K+</div>
                <div className="text-xs text-slate-400">Entries Purchased</div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/10"></div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Fair & Secure</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

    </div>
  );
}
