import { CampaignService } from '@/modules/campaigns/campaign-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  const campaigns = await CampaignService.listAdminCampaigns();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <Button asChild>
          <Link href="/admin/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b">
            <tr>
              <th className="h-12 px-4 align-middle font-medium">Title</th>
              <th className="h-12 px-4 align-middle font-medium">Status</th>
              <th className="h-12 px-4 align-middle font-medium">Entry Price</th>
              <th className="h-12 px-4 align-middle font-medium">Ends At</th>
              <th className="h-12 px-4 align-middle font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No campaigns found.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 font-medium">{campaign.title}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4">{campaign.entryPrice / 100} {campaign.currency}</td>
                  <td className="p-4">{format(new Date(campaign.endsAt), 'PPP')}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/campaigns/${campaign.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
