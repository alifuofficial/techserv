import { db } from "@/lib/db";
import AdminReferralsClient from "./referrals-client";

export const dynamic = 'force-dynamic';

export default async function AdminReferralsPage() {
  // Find all users who were referred by someone
  const referredUsers = await db.user.findMany({
    where: { referredById: { not: null } }
  });

  // Group by referredById
  const referrersMap = new Map<string, number>();
  for (const u of referredUsers) {
    if (!u.referredById) continue;
    referrersMap.set(u.referredById, (referrersMap.get(u.referredById) || 0) + 1);
  }

  // Fetch the details of the referrers
  const referrerIds = Array.from(referrersMap.keys());
  const referrersList = await db.user.findMany({
    where: { id: { in: referrerIds } }
  });

  const formattedReferrers = referrersList.map(ref => ({
    id: ref.id,
    user: ref.name || 'Unknown',
    email: ref.email || ref.phone || 'N/A',
    code: ref.referralCode || 'N/A',
    referrals: referrersMap.get(ref.id) || 0,
    conversion: "100%", // Simplified for MVP
    earnings: `${(referrersMap.get(ref.id) || 0) * 50} ETB`, // Example mapping 50 ETB per referral
    status: ref.status || 'ACTIVE'
  })).sort((a, b) => b.referrals - a.referrals);

  return (
    <AdminReferralsClient initialReferrers={formattedReferrers} />
  );
}
