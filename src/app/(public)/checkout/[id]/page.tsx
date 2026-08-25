import { notFound } from 'next/navigation';
import CheckoutClient from './checkout-client';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Use prisma directly in case CampaignService.getAdminCampaign doesn't exist
  const campaign = await db.campaign.findUnique({
    where: { id }
  });

  if (!campaign || campaign.status !== 'ACTIVE') {
    notFound();
  }

  // Fetch logged-in user (demo fallback for MVP)
  let user = await db.user.findUnique({
    where: { email: 'user@milkytech.online' }
  });
  
  let balance = 0;
  if (user) {
    const ledger = await db.ledgerAccount.findUnique({
      where: { userId: user.id }
    });
    balance = ledger?.balance || 0;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <CheckoutClient 
          campaign={campaign} 
          userBalance={balance} 
          isLoggedIn={!!user}
          userPhone={user?.phone || ""}
          userName={user?.name || ""}
          userId={user?.id || ""}
        />
      </div>
    </div>
  );
}
