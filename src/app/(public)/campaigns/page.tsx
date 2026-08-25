import { CampaignService } from '@/modules/campaigns/campaign-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function PublicCampaignsPage() {
  const campaigns = await CampaignService.listPublicCampaigns();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Live Campaigns</h1>
        <p className="text-xl text-muted-foreground">
          Win amazing prizes. Get your entries before the timer runs out!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            No active campaigns right now. Check back soon!
          </div>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col overflow-hidden">
              {campaign.imageUrl ? (
                <div className="w-full h-48 bg-slate-100 border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-48 bg-emerald-50 border-b border-emerald-100 flex items-center justify-center text-emerald-400 font-bold uppercase tracking-wider">
                  No Image
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
                <CardDescription>
                  Ends {format(new Date(campaign.endsAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div 
                  className="text-sm text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.description }}
                />
                <div className="font-semibold text-lg">
                  {campaign.entryPrice} {campaign.currency} per entry
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Max entries: {campaign.maxEntries}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                  <Link href={`/campaigns/${campaign.slug}`}>
                    View Campaign
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
