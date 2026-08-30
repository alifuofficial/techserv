import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as crypto from "crypto";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminUserId = (session?.user as any)?.id || "admin";

    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ success: false, error: "Campaign ID is required" }, { status: 400 });
    }

    // 1. Verify Campaign and Entries
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        prizes: true,
        draw: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "COMPLETED" || (campaign.draw && campaign.draw.winningEntryId)) {
      return NextResponse.json({ success: false, error: "This campaign has already completed its draw." }, { status: 400 });
    }

    // Check for pending payments
    const pendingPayments = await db.payment.count({
      where: {
        status: "PENDING",
        adminNote: { contains: campaignId },
      },
    });

    if (pendingPayments > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot execute draw: There are ${pendingPayments} unreviewed pending payments for this campaign. Please review them in Payments first.`,
      }, { status: 400 });
    }

    // 2. Execute Provably Fair Serializable Draw Transaction
    const result = await db.$transaction(
      async (tx) => {
        // Set campaign status to DRAWING
        await tx.campaign.update({
          where: { id: campaignId },
          data: { status: "DRAWING" },
        });

        // Fetch all valid entries in deterministic order
        const validEntries = await tx.entry.findMany({
          where: {
            campaignId,
            status: "VALID",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                identities: true,
              },
            },
          },
          orderBy: { entryNumber: "asc" },
        });

        if (validEntries.length === 0) {
          throw new Error("No valid entries found to draw a winner from.");
        }

        // Generate SHA256 Snapshot Hash
        const entriesSnapshot = JSON.stringify(validEntries.map((e) => e.id));
        const snapshotHash = crypto.createHash("sha256").update(entriesSnapshot).digest("hex");

        // Cryptographically secure random selection without modulo bias
        const randomIndex = crypto.randomInt(0, validEntries.length);
        const winningEntry = validEntries[randomIndex];
        const randomSeed = `idx:${randomIndex}_tot:${validEntries.length}_seed:${crypto.randomBytes(8).toString("hex")}`;

        // Create or Update Draw
        const draw = await tx.draw.upsert({
          where: { campaignId },
          create: {
            campaignId,
            snapshotHash,
            randomSeed,
            winningEntryId: winningEntry.id,
            status: "COMPLETED",
            completedAt: new Date(),
          },
          update: {
            snapshotHash,
            randomSeed,
            winningEntryId: winningEntry.id,
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        // Mark winning entry
        await tx.entry.update({
          where: { id: winningEntry.id },
          data: { status: "WINNER" },
        });

        // Mark campaign as COMPLETED
        await tx.campaign.update({
          where: { id: campaignId },
          data: { status: "COMPLETED" },
        });

        return { draw, winningEntry, totalEntries: validEntries.length };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const prefix = campaign.id.substring(0, 4).toUpperCase();
    const winningTicketNumber = `TKT-${prefix}-${result.winningEntry.entryNumber}`;
    const prize = campaign.prizes?.[0]?.title || campaign.title;

    // Send Telegram Notification if Bot Token is configured
    let telegramNotified = false;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramIdentity = result.winningEntry.user.identities?.find((i) => i.provider === "telegram");

    if (botToken && telegramIdentity?.providerId) {
      try {
        const message = `🎉 <b>CONGRATULATIONS! YOU WON!</b> 🎉\n\n` +
          `🏆 <b>Prize:</b> ${prize}\n` +
          `🎟️ <b>Winning Ticket:</b> <code>${winningTicketNumber}</code>\n` +
          `🎪 <b>Campaign:</b> ${campaign.title}\n\n` +
          `Open your MilkyTech Mini App to claim your prize!`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramIdentity.providerId,
            text: message,
            parse_mode: "HTML",
          }),
        });
        telegramNotified = true;
      } catch (tgErr) {
        console.error("[Telegram bot notification error]", tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      winner: {
        id: result.winningEntry.id,
        entryNumber: result.winningEntry.entryNumber,
        ticketNumber: winningTicketNumber,
        userId: result.winningEntry.userId,
        userName: result.winningEntry.user.name || `User ${result.winningEntry.userId.slice(-4)}`,
        userEmail: result.winningEntry.user.email || "",
        userPhone: result.winningEntry.user.phone || "",
        campaignTitle: campaign.title,
        prizeTitle: prize,
        prizeValue: campaign.prizes?.[0]?.value || campaign.entryPrice * campaign.maxEntries,
        currency: campaign.currency || "ETB",
        drawDate: result.draw.completedAt?.toISOString() || new Date().toISOString(),
        snapshotHash: result.draw.snapshotHash,
        randomSeed: result.draw.randomSeed,
        telegramNotified,
      },
      draw: result.draw,
      totalEntries: result.totalEntries,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/draws/execute error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to execute draw" }, { status: 500 });
  }
}
