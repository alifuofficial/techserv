import { db } from "@/lib/db";
import ReferralsClient from "./referrals-client";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  let user = await db.user.findUnique({
    where: { email: 'user@milkytech.online' }
  });
  if (!user) user = await db.user.findFirst({ where: { role: 'USER' }});
  
  if (!user) return <div>No user found</div>;

  // Generate a referral code if the user doesn't have one
  if (!user.referralCode) {
    const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    user = await db.user.update({
      where: { id: user.id },
      data: { referralCode: code }
    });
  }

  // Fetch users referred by this user
  const referrals = await db.user.findMany({
    where: { referredById: user.id },
    select: {
      id: true,
      name: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Getting hostname to create full referral link
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  return (
    <ReferralsClient 
      referralCode={user.referralCode!} 
      referrals={referrals} 
      host={baseUrl} 
    />
  );
}
