import { CampaignService } from '@/modules/campaigns/campaign-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { Ticket, Clock, Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import { ShareButtons } from '@/components/campaigns/share-buttons';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await CampaignService.getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  // Fallback pattern if no image
  const fallbackGradient = "bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900";

  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* Breadcrumb / Top Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
          <Link href="/campaigns" className="hover:text-emerald-600 transition-colors">Live Campaigns</Link>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
          <span className="text-slate-900 line-clamp-1">{campaign.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Image Gallery / Hero */}
            <div className={`w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative group ${!campaign.imageUrl ? fallbackGradient : 'bg-slate-100'}`}>
              {campaign.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400/50">
                  <Trophy className="w-24 h-24 mb-4 opacity-50" />
                  <span className="text-xl font-black uppercase tracking-widest opacity-50">MilkyTech Draws</span>
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 backdrop-blur text-emerald-600 shadow-sm">
                  {campaign.status === "ACTIVE" ? "Live Now" : campaign.status}
                </span>
              </div>
            </div>

            {/* Campaign Header Details */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                {campaign.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 border-y border-slate-200 py-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>Ends {format(new Date(campaign.endsAt), 'MMMM do, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-500" />
                  <span>Max {campaign.maxEntries} entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Guaranteed Draw</span>
                </div>
              </div>
              <ShareButtons title={campaign.title} />
            </div>

            {/* Description / Prose */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </span>
                Campaign Details
              </h2>
              <div 
                className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: campaign.description }} 
              />
            </div>

          </div>

          {/* Right Column (Checkout Sidebar) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-8 space-y-6">
              
              {/* Entry Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                
                <h3 className="font-bold text-slate-900 text-xl mb-6">Enter to Win</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 text-center">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Price Per Ticket</div>
                  <div className="flex items-baseline justify-center gap-2 text-slate-900">
                    <span className="text-5xl font-black">{campaign.entryPrice}</span>
                    <span className="text-xl font-bold text-slate-500">{campaign.currency}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full text-lg h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold group" asChild>
                    <Link href={`/checkout/${campaign.id}`}>
                      Get Your Tickets 
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <p className="text-xs text-center text-slate-500 leading-relaxed px-4">
                    Secure checkout provided by <span className="font-semibold text-slate-700">Telebirr & CBE Birr</span>.<br />
                    By entering, you agree to our Official Rules.
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-2">100% Secure & Transparent</h4>
                <p className="text-sm text-slate-400">All draws are regulated and verified independently to ensure absolute fairness.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
