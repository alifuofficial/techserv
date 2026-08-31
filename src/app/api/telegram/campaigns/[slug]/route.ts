import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { getMultipleSystemSettings } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Parallel fetch: Campaign + User + Payment Settings in ONE batch
    const [campaign, user, settings] = await Promise.all([
      db.campaign.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { entries: true },
          },
          prizes: true,
          draw: true,
        },
      }),
      getTelegramUserFromRequest(req),
      getMultipleSystemSettings([
        { key: "telebirr_enabled", defaultValue: "true" },
        { key: "telebirr_account_number", defaultValue: "0911000000" },
        { key: "telebirr_account_name", defaultValue: "MilkyTech Online" },
        { key: "telebirr_instructions", defaultValue: "Transfer to the Telebirr number above and upload receipt." },
        { key: "cbe_enabled", defaultValue: "true" },
        { key: "cbe_account_number", defaultValue: "1000123456789" },
        { key: "cbe_account_name", defaultValue: "MilkyTech Online PLC" },
        { key: "cbe_instructions", defaultValue: "Transfer to the CBE account number above and upload receipt." },
        { key: "custom_payment_methods", defaultValue: "" },
      ]),
    ]);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    const isCompleted =
      campaign.status === "COMPLETED" ||
      (campaign.draw && campaign.draw.status === "COMPLETED" && !!campaign.draw.winningEntryId);

    let winnerInfo: {
      name: string;
      ticketNumber: string;
      wonAt: string;
      prizeTitle: string;
      snapshotHash?: string | null;
      randomSeed?: string | null;
    } | null = null;

    if (isCompleted && campaign.draw?.winningEntryId) {
      const entry = await db.entry.findUnique({
        where: { id: campaign.draw.winningEntryId },
        select: {
          entryNumber: true,
          user: { select: { name: true, email: true } },
        },
      });
      if (entry) {
        const prefix = campaign.id.substring(0, 4).toUpperCase();
        winnerInfo = {
          name: entry.user.name || "Lucky Winner",
          ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
          wonAt: (campaign.draw.completedAt || campaign.draw.createdAt).toISOString(),
          prizeTitle: campaign.prizes?.[0]?.title || campaign.title,
          snapshotHash: campaign.draw.snapshotHash,
          randomSeed: campaign.draw.randomSeed,
        };
      }
    }

    let methods: any[] = [];
    if (settings.custom_payment_methods) {
      try {
        methods = JSON.parse(settings.custom_payment_methods);
      } catch (e) {
        methods = [];
      }
    }

    if (!methods || methods.length === 0) {
      methods = [
        {
          id: "telebirr",
          name: "Telebirr Direct",
          shortCode: "TB",
          category: "MOBILE_MONEY",
          accountName: settings.telebirr_account_name,
          accountNumber: settings.telebirr_account_number,
          instructions: settings.telebirr_instructions,
          enabled: settings.telebirr_enabled === "true",
          color: "blue",
        },
        {
          id: "cbe",
          name: "Commercial Bank of Ethiopia (CBE)",
          shortCode: "CBE",
          category: "BANK_TRANSFER",
          accountName: settings.cbe_account_name,
          accountNumber: settings.cbe_account_number,
          instructions: settings.cbe_instructions,
          enabled: settings.cbe_enabled === "true",
          color: "purple",
        },
      ];
    }

    const activeMethods = methods.filter((m) => m.enabled);

    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          description: campaign.description,
          image: campaign.imageUrl || null,
          ticketPrice: campaign.entryPrice,
          currency: campaign.currency || "ETB",
          drawDate: campaign.endsAt,
          startsAt: campaign.startsAt,
          maxEntries: campaign.maxEntries,
          entriesCount: campaign._count.entries,
          status: isCompleted ? "COMPLETED" : campaign.status,
          isCompleted: !!isCompleted,
          prizes: campaign.prizes,
          prizeTitle: campaign.prizes?.[0]?.title || campaign.title,
          winner: winnerInfo,
        },
        paymentSettings: {
          methods: activeMethods,
          telebirr: {
            accountNumber: settings.telebirr_account_number,
            accountName: settings.telebirr_account_name,
            instructions: settings.telebirr_instructions,
          },
          cbe: {
            accountNumber: settings.cbe_account_number,
            accountName: settings.cbe_account_name,
            instructions: settings.cbe_instructions,
          },
        },
        user: user
          ? {
              id: user.id,
              name: user.name || "",
              balance: user.ledgerAccount?.balance || 0,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/telegram/campaigns/[slug] error]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
