import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const lowerQ = q.toLowerCase();

    // Parallel search across Campaigns, Users, and Payments
    const [campaigns, users, payments] = await Promise.all([
      db.campaign.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, slug: true, status: true, entryPrice: true },
        take: 5,
      }),
      db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { referralCode: { contains: q, mode: "insensitive" } },
            { identities: { some: { providerId: { contains: q, mode: "insensitive" } } } },
          ],
        },
        include: { identities: true },
        take: 5,
      }),
      db.payment.findMany({
        where: {
          OR: [
            { transactionId: { contains: q, mode: "insensitive" } },
            { provider: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { user: { select: { name: true, email: true } } },
        take: 5,
      }),
    ]);

    const results = [
      ...campaigns.map((c) => ({
        category: "Campaigns",
        title: c.title,
        subtitle: `Status: ${c.status} • ${c.entryPrice} ETB`,
        href: `/admin/campaigns/${c.id}`,
      })),
      ...users.map((u) => {
        const tg = u.identities.find((i) => i.provider === "telegram");
        return {
          category: "Users & KYC",
          title: u.name || u.email || `User ${u.id.slice(0, 6)}`,
          subtitle: tg ? `TG: ${tg.providerId} • Role: ${u.role}` : `Email: ${u.email || 'N/A'} • Role: ${u.role}`,
          href: `/admin/users`,
        };
      }),
      ...payments.map((p) => ({
        category: "Payments",
        title: `Payment: ${p.amount} ETB (${p.provider})`,
        subtitle: `TxID: ${p.transactionId || "N/A"} • ${p.user?.name || "User"}`,
        href: `/admin/payments`,
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[GET /api/admin/search error]", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
