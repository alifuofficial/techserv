import { db } from "@/lib/db";
import AdminDashboardClient from "./admin-client";

export default async function AdminDashboardPage() {
  const totalUsers = await db.user.count();
  const totalCampaigns = await db.campaign.count();
  const activeCampaigns = await db.campaign.count({ where: { status: 'ACTIVE' } });
  const totalRevenueResult = await db.payment.aggregate({
    _sum: { amount: true },
    where: { status: 'APPROVED' }
  });
  
  const totalRevenue = totalRevenueResult._sum.amount || 0;

  // Real campaigns
  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const dashboardData = {
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    totalRevenue,
    campaigns: campaigns.map(c => ({
      name: c.title,
      time: new Date(c.drawDate).toLocaleDateString(),
      img: c.image || '',
      sold: c.entriesCount,
      total: c.maxEntries,
      rev: c.ticketPrice * c.entriesCount,
      conv: ((c.entriesCount / c.maxEntries) * 100).toFixed(1) + '%',
      status: c.status,
    }))
  };

  return <AdminDashboardClient data={dashboardData} />;
}
