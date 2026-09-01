import { db } from "@/lib/db";
import { format, subDays } from "date-fns";
import { getSystemSetting } from "@/modules/settings/settings-service";
import AdminDashboardClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    completedCampaigns,
    draftCampaigns,
    depositsAgg,
    withdrawalsApprovedAgg,
    withdrawalsPendingAgg,
    totalTicketsCount,
    allCampaignsWithSales,
    allEntries,
    approvedPayments,
    recentPayments,
    recentUsers,
    recentDraws,
    spinRewardsAgg,
    referralRewardsAgg,
  ] = await Promise.all([
    db.user.count().catch(() => 0),
    db.campaign.count().catch(() => 0),
    db.campaign.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    db.campaign.count({ where: { status: "COMPLETED" } }).catch(() => 0),
    db.campaign.count({ where: { status: "DRAFT" } }).catch(() => 0),
    // Approved Deposits
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "APPROVED",
        provider: { not: { startsWith: "WITHDRAW_" } },
      },
    }).catch(() => ({ _sum: { amount: 0 } })),
    // Approved Withdrawals (Real cash paid out)
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "APPROVED",
        provider: { startsWith: "WITHDRAW_" },
      },
    }).catch(() => ({ _sum: { amount: 0 } })),
    // Pending Withdrawals
    db.payment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        status: "PENDING",
        provider: { startsWith: "WITHDRAW_" },
      },
    }).catch(() => ({ _sum: { amount: 0 }, _count: { id: 0 } })),
    // Entries count
    db.entry.count().catch(() => 0),
    // All campaigns with entry counts & prizes
    db.campaign.findMany({
      include: {
        prizes: true,
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    // All valid entries
    db.entry.findMany({
      where: { status: { in: ["VALID", "WINNER"] } },
      select: {
        id: true,
        campaignId: true,
        createdAt: true,
      },
    }).catch(() => []),
    // Approved payments for chart
    db.payment.findMany({
      where: { status: "APPROVED" },
      select: {
        amount: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }).catch(() => []),
    // Recent payments
    db.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }).catch(() => []),
    // Recent users
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }).catch(() => []),
    // Recent draws
    db.draw.findMany({
      where: { status: "COMPLETED", winningEntryId: { not: null } },
      take: 3,
      orderBy: { completedAt: "desc" },
      include: {
        campaign: { select: { title: true } },
      },
    }).catch(() => []),
    // Total Spin Bonus credits issued
    db.ledgerTransaction.aggregate({
      where: { referenceType: "DAILY_SPIN_REWARD" },
      _sum: { amount: true },
    }).catch(() => ({ _sum: { amount: 0 } })),
    // Total Referral bonuses issued
    db.ledgerTransaction.aggregate({
      where: { referenceType: { in: ["REFERRAL_BONUS", "REFERRAL_UNLOCK"] } },
      _sum: { amount: true },
    }).catch(() => ({ _sum: { amount: 0 } })),
  ]);

  const totalDeposits = depositsAgg?._sum?.amount || 0;
  const totalWithdrawalsPaidOut = withdrawalsApprovedAgg?._sum?.amount || 0;
  const totalWithdrawalsPending = withdrawalsPendingAgg?._sum?.amount || 0;
  const pendingWithdrawalCount = withdrawalsPendingAgg?._count?.id || 0;
  const totalSpinCredits = spinRewardsAgg?._sum?.amount || 0;
  const totalReferralCredits = referralRewardsAgg?._sum?.amount || 0;

  // 1. Calculate Real Revenue Chart (Last 7 days)
  const revenueByDayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    try {
      const d = subDays(new Date(), i);
      const key = format(d, "MMM d");
      revenueByDayMap.set(key, 0);
    } catch (e) {}
  }

  (approvedPayments || [])
    .filter((p) => !p.provider?.startsWith("WITHDRAW_"))
    .forEach((p) => {
      try {
        if (p.createdAt) {
          const key = format(new Date(p.createdAt), "MMM d");
          if (revenueByDayMap.has(key)) {
            revenueByDayMap.set(key, (revenueByDayMap.get(key) || 0) + (p.amount || 0));
          }
        }
      } catch (e) {}
    });

  const revenueData = Array.from(revenueByDayMap.entries()).map(([name, value]) => ({
    name,
    value: value || 0,
  }));

  // 2. Real Campaign Performance Breakdown (Pie Chart)
  const pieData = [
    { name: "Active", value: activeCampaigns || 0, color: "#10B981" },
    { name: "Completed", value: completedCampaigns || 0, color: "#3B82F6" },
    { name: "Draft / Paused", value: draftCampaigns || 0, color: "#94A3B8" },
  ].filter((p) => (p.value || 0) > 0);

  if (pieData.length === 0) {
    pieData.push({ name: "No Campaigns", value: 1, color: "#94A3B8" });
  }

  // 3. Payment Methods Breakdown
  const providerSums: Record<string, number> = {};
  (approvedPayments || [])
    .filter((p) => !p.provider?.startsWith("WITHDRAW_"))
    .forEach((p) => {
      const prov = (p.provider || "OTHER").toUpperCase();
      providerSums[prov] = (providerSums[prov] || 0) + (p.amount || 0);
    });

  const totalProvRevenue = Math.max(1, totalDeposits);
  const paymentMethods = [
    {
      name: "Telebirr",
      amount: (providerSums["TELEBIRR"] || 0) + (providerSums["MANUAL_TELEBIRR"] || 0),
      color: "#10B981",
      icon: "telebirr",
    },
    {
      name: "CBE Birr",
      amount: (providerSums["CBE"] || 0) + (providerSums["MANUAL_CBE"] || 0),
      color: "#8B5CF6",
      icon: "cbe",
    },
    {
      name: "MilkyTech Wallet",
      amount: providerSums["WALLET"] || 0,
      color: "#059669",
      icon: "wallet",
    },
  ].map((pm) => ({
    ...pm,
    percentage: Math.round(((pm.amount || 0) / totalProvRevenue) * 100),
  }));

  // 4. Real Recent Activity Feed
  const activityList: any[] = [];

  (recentUsers || []).forEach((u) => {
    let formattedTime = "";
    try {
      formattedTime = u.createdAt ? format(new Date(u.createdAt), "MMM d, HH:mm") : "";
    } catch (e) {}
    activityList.push({
      type: "USER",
      title: `New user registered: ${u.name || "User"}`,
      subtitle: u.email || `@user_${(u.id || "").slice(-4)}`,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      formattedTime,
    });
  });

  (recentPayments || []).forEach((p) => {
    let formattedTime = "";
    try {
      formattedTime = p.createdAt ? format(new Date(p.createdAt), "MMM d, HH:mm") : "";
    } catch (e) {}
    activityList.push({
      type: "PAYMENT",
      title: `Payment ${(p.status || "APPROVED").toLowerCase()}: ${(p.amount || 0).toLocaleString()} ${p.currency || "ETB"}`,
      subtitle: `${p.provider || "MANUAL"} (${p.transactionId || "Direct"}) • ${p.user?.name || "User"}`,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      formattedTime,
    });
  });

  (recentDraws || []).forEach((d) => {
    const drawDate = d.completedAt || d.createdAt;
    let formattedTime = "";
    try {
      formattedTime = drawDate ? format(new Date(drawDate), "MMM d, HH:mm") : "";
    } catch (e) {}
    activityList.push({
      type: "WINNER",
      title: `Winner selected for "${d.campaign?.title || "Campaign"}"`,
      subtitle: `Provably fair draw completed`,
      createdAt: drawDate ? new Date(drawDate).toISOString() : new Date().toISOString(),
      formattedTime,
    });
  });

  activityList.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
  const finalActivities = activityList.slice(0, 6);

  // 5. Itemized Campaign Breakdown & Realized Net Profit
  let totalProductCostsAll = 0;
  let totalTargetGrossAll = 0;
  let totalRealizedGrossTicketSales = 0;

  let instantGrossSales = 0;
  let instantPrizeCosts = 0;
  let instantCompletedCount = 0;

  let grandGrossSales = 0;
  let grandPrizeCosts = 0;
  let grandCompletedCount = 0;

  const mappedCampaigns = await Promise.all(
    (allCampaignsWithSales || []).map(async (c) => {
      let formattedEndsAt = "";
      try {
        formattedEndsAt = c.endsAt ? `Ends ${format(new Date(c.endsAt), "MMM d, yyyy")}` : "";
      } catch (e) {}

      const entriesSold = c._count?.entries || 0;
      const max = Math.max(1, c.maxEntries || 1);
      const prizeCost = c.prizes?.[0]?.value || 0;
      let settingCost = 0;
      try {
        settingCost = parseInt(await getSystemSetting(`product_cost_${c.id}`, "0"), 10) || 0;
      } catch (e) {}
      const productCost = prizeCost || settingCost || 0;

      const targetGross = (c.entryPrice || 0) * max;
      const realizedGross = (c.entryPrice || 0) * entriesSold;
      const targetProfit = targetGross - productCost;
      const realizedProfit = realizedGross - productCost;

      totalProductCostsAll += productCost;
      totalTargetGrossAll += targetGross;
      totalRealizedGrossTicketSales += realizedGross;

      const isInstant =
        c.slug.startsWith("flash-") ||
        c.slug.startsWith("instant-") ||
        c.title.toLowerCase().includes("instant") ||
        c.title.toLowerCase().includes("flash");

      if (isInstant) {
        instantGrossSales += realizedGross;
        instantPrizeCosts += (c.status === "COMPLETED" ? productCost : 0);
        if (c.status === "COMPLETED") instantCompletedCount++;
      } else {
        grandGrossSales += realizedGross;
        grandPrizeCosts += (c.status === "COMPLETED" ? productCost : 0);
        if (c.status === "COMPLETED") grandCompletedCount++;
      }

      return {
        id: c.id,
        name: c.title || "Untitled Campaign",
        time: formattedEndsAt,
        img: c.imageUrl || "",
        sold: entriesSold,
        total: c.maxEntries || 0,
        entryPrice: c.entryPrice || 0,
        productCost,
        targetGross,
        rev: realizedGross,
        targetProfit,
        realizedProfit,
        conv: `${Math.min(100, Math.round((entriesSold / max) * 100))}%`,
        status: c.status || "DRAFT",
        isInstant,
      };
    })
  );

  // Executive Realized Net Profit Calculations
  const completedPrizeCostsTotal = instantPrizeCosts + grandPrizeCosts;
  const netRealizedProfit = totalRealizedGrossTicketSales - completedPrizeCostsTotal - totalWithdrawalsPaidOut;
  const platformCashReserve = Math.max(0, totalDeposits - totalWithdrawalsPaidOut);
  const netProfitMarginPercent =
    totalRealizedGrossTicketSales > 0
      ? Math.round(((totalRealizedGrossTicketSales - completedPrizeCostsTotal) / totalRealizedGrossTicketSales) * 100)
      : 0;

  const dashboardData = {
    totalUsers: totalUsers || 0,
    totalCampaigns: totalCampaigns || 0,
    activeCampaigns: activeCampaigns || 0,
    totalRevenue: totalDeposits || 0,
    totalTicketSales: totalRealizedGrossTicketSales || 0,
    totalTicketsCount: totalTicketsCount || 0,
    totalProductCosts: totalProductCostsAll || 0,
    completedPrizeCostsTotal,
    totalWithdrawalsPaidOut,
    totalWithdrawalsPending,
    pendingWithdrawalCount,
    totalSpinCredits,
    totalReferralCredits,
    netRealizedProfit,
    platformCashReserve,
    netProfitMarginPercent,
    instantStats: {
      grossSales: instantGrossSales,
      prizeCosts: instantPrizeCosts,
      netProfit: instantGrossSales - instantPrizeCosts,
      completedCount: instantCompletedCount,
    },
    grandStats: {
      grossSales: grandGrossSales,
      prizeCosts: grandPrizeCosts,
      netProfit: grandGrossSales - grandPrizeCosts,
      completedCount: grandCompletedCount,
    },
    totalProjectedNetProfit: totalTargetGrossAll - totalProductCostsAll,
    revenueData: revenueData || [],
    pieData: pieData || [],
    paymentMethods: paymentMethods || [],
    activities: finalActivities || [],
    campaigns: mappedCampaigns.slice(0, 8),
  };

  return <AdminDashboardClient data={dashboardData} />;
}
