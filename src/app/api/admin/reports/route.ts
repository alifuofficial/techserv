import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "financial", "campaigns", "users", "draws"

    // 1. Financial Ledger Statement CSV
    if (type === "financial") {
      const txs = await db.ledgerTransaction.findMany({
        include: { account: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      });
      const header = "Transaction ID,Timestamp,Account Holder,Email,Amount (ETB),Reference Type,Reference ID,Description\n";
      const rows = txs.map(t => `"${t.id}","${t.createdAt.toISOString()}","${t.account?.user?.name || 'User'}","${t.account?.user?.email || 'N/A'}","${t.amount}","${t.referenceType}","${t.referenceId}","${t.description || ''}"`).join("\n");
      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="MilkyTech_Financial_Ledger_${Date.now()}.csv"`,
        },
      });
    }

    // 2. Campaign Sales, Product Market Costs & Net Profits CSV
    if (type === "campaigns") {
      const campaigns = await db.campaign.findMany({
        include: { prizes: true, _count: { select: { entries: true } }, merchant: true },
        orderBy: { createdAt: "desc" },
      });

      const header = "Campaign ID,Title,Slug,Status,Product Market Cost (ETB),Ticket Price (ETB),Max Tickets,Tickets Sold,Target Gross (ETB),Realized Gross (ETB),Projected Profit (ETB),Realized Profit (ETB),Target ROI (%),Prize Title,Merchant,Created Date\n";
      
      const rows = await Promise.all(
        campaigns.map(async (c) => {
          const prizeCost = c.prizes?.[0]?.value || 0;
          const settingCost = parseInt(await getSystemSetting(`product_cost_${c.id}`, "0"), 10) || 0;
          const productCost = prizeCost || settingCost || 0;

          const entriesSold = c._count.entries;
          const targetGross = c.entryPrice * c.maxEntries;
          const realizedGross = c.entryPrice * entriesSold;
          const projectedProfit = targetGross - productCost;
          const realizedProfit = realizedGross - productCost;
          const targetRoi = productCost > 0 ? ((projectedProfit / productCost) * 100).toFixed(1) : "0.0";

          return `"${c.id}","${c.title}","${c.slug}","${c.status}","${productCost}","${c.entryPrice}","${c.maxEntries}","${entriesSold}","${targetGross}","${realizedGross}","${projectedProfit}","${realizedProfit}","${targetRoi}%","${c.prizes?.[0]?.title || ''}","${c.merchant?.name || 'MilkyTech Platform'}","${c.createdAt.toISOString()}"`;
        })
      );

      return new NextResponse(header + rows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="MilkyTech_Campaign_Profitability_Report_${Date.now()}.csv"`,
        },
      });
    }

    // 3. User Growth CSV
    if (type === "users") {
      const users = await db.user.findMany({
        include: { identities: true, ledgerAccount: true, _count: { select: { entries: true, payments: true } } },
        orderBy: { createdAt: "desc" },
      });
      const header = "User ID,Name,Email,Telegram ID,Role,Status,Referral Code,Wallet Balance (ETB),Tickets Bought,Payments Submitted,Joined Date\n";
      const rows = users.map(u => {
        const tg = u.identities.find(i => i.provider === 'telegram');
        return `"${u.id}","${u.name || ''}","${u.email || ''}","${tg?.providerId || ''}","${u.role}","${u.status}","${u.referralCode || ''}","${u.ledgerAccount?.balance || 0}","${u._count.entries}","${u._count.payments}","${u.createdAt.toISOString()}"`;
      }).join("\n");
      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="MilkyTech_Users_Growth_${Date.now()}.csv"`,
        },
      });
    }

    // 4. Provably Fair Draws CSV
    if (type === "draws") {
      const draws = await db.draw.findMany({
        include: { campaign: true },
        orderBy: { createdAt: "desc" },
      });
      const header = "Draw ID,Campaign Title,Status,Winning Entry ID,Snapshot Hash,Random Seed,Completed At,Created At\n";
      const rows = draws.map(d => `"${d.id}","${d.campaign?.title || ''}","${d.status}","${d.winningEntryId || 'Pending'}","${d.snapshotHash || ''}","${d.randomSeed || ''}","${d.completedAt?.toISOString() || 'Pending'}","${d.createdAt.toISOString()}"`).join("\n");
      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="MilkyTech_Provably_Fair_Draws_${Date.now()}.csv"`,
        },
      });
    }

    // 5. Default: Return real summary metrics
    const [totalUsers, totalCampaigns, totalEntries, totalPayments] = await Promise.all([
      db.user.count(),
      db.campaign.count(),
      db.entry.count(),
      db.payment.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCampaigns,
        totalEntries,
        totalPayments,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/reports error]", error);
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 });
  }
}
