import { db } from "@/lib/db";
import AdminReferralsClient from "./referrals-client";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const [bonusAmountSetting, currencySetting] = await Promise.all([
    getSystemSetting("referral_bonus_amount", "10"),
    getSystemSetting("referral_currency", "ETB"),
  ]);

  const bonusAmount = parseFloat(bonusAmountSetting) || 10;
  const currency = currencySetting || "ETB";

  // 1. Find all referred users
  const referredUsers = await db.user.findMany({
    where: { referredById: { not: null } },
    select: { id: true, name: true, email: true, phone: true, referredById: true, createdAt: true },
  });

  // Group referrals by referrer ID
  const referrersMap = new Map<string, number>();
  for (const u of referredUsers) {
    if (!u.referredById) continue;
    referrersMap.set(u.referredById, (referrersMap.get(u.referredById) || 0) + 1);
  }

  const referrerIds = Array.from(referrersMap.keys());

  // 2. Fetch referrer user records
  const referrersList = await db.user.findMany({
    where: { id: { in: referrerIds } },
    include: {
      ledgerAccount: {
        include: {
          transactions: {
            where: { referenceType: "REFERRAL_REWARD" },
          },
        },
      },
    },
  });

  // 3. Map formatted list of referrers
  const formattedReferrers = referrersList
    .map((ref) => {
      const count = referrersMap.get(ref.id) || 0;
      
      // Calculate actual commission from transactions or fallback to count * bonusAmount
      const earnedFromTx = ref.ledgerAccount?.transactions.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const totalEarnings = earnedFromTx > 0 ? earnedFromTx : count * bonusAmount;

      return {
        id: ref.id,
        user: ref.name || `User ${ref.id.slice(-4)}`,
        email: ref.email || ref.phone || "N/A",
        code: ref.referralCode || `MILKY-${ref.id.slice(-6).toUpperCase()}`,
        referrals: count,
        conversion: "100%",
        earnings: `${totalEarnings.toLocaleString()} ${currency}`,
        earningsValue: totalEarnings,
        status: ref.status || "ACTIVE",
      };
    })
    .sort((a, b) => b.referrals - a.referrals);

  // 4. Calculate real overall statistics
  const totalAffiliates = formattedReferrers.length;
  const totalReferredUsers = referredUsers.length;
  const totalCommissions = formattedReferrers.reduce((sum, r) => sum + r.earningsValue, 0);
  const topEarner = formattedReferrers[0]?.user || (totalAffiliates > 0 ? formattedReferrers[0].user : "None");

  const stats = {
    activeAffiliates: totalAffiliates,
    totalReferredUsers,
    totalCommissions: `${totalCommissions.toLocaleString()} ${currency}`,
    topEarner,
  };

  return (
    <AdminReferralsClient
      initialReferrers={formattedReferrers}
      stats={stats}
      currency={currency}
    />
  );
}
