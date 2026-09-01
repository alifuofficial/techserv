import { db } from "@/lib/db";
import * as crypto from "crypto";
import { Prisma } from "@prisma/client";
import { sendEventNotification } from "@/lib/telegram-notifications";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";

export interface InstantDrawPreset {
  id: string;
  name: string;
  badge: string;
  entryPrice: number; // in ETB
  maxEntries: number; // e.g. 25, 50, 100
  prizeTitle: string;
  prizeValue: number; // in ETB
  productCost: number; // in ETB
  description: string;
  imageUrl?: string;
  autoRenew?: boolean;
}

export const INSTANT_DRAW_PRESETS: InstantDrawPreset[] = [
  {
    id: "preset_100_cash",
    name: "⚡ 100-Ticket Flash Cash Drop",
    badge: "HIGH REWARD",
    entryPrice: 50,
    maxEntries: 100,
    prizeTitle: "4,500 ETB Instant Bank / Telebirr Cash",
    prizeValue: 4500,
    productCost: 4500,
    description: "Lightning-fast 100-ticket cash drop! 50 ETB ticket to win 4,500 ETB cash. Automatic instant draw when 100 tickets sell out!",
    imageUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop&q=60",
    autoRenew: true,
  },
  {
    id: "preset_50_airtime",
    name: "⚡ 50-Ticket Quick Airtime Blitz",
    badge: "FAST PACED",
    entryPrice: 20,
    maxEntries: 50,
    prizeTitle: "850 ETB Mobile Airtime / Cash",
    prizeValue: 850,
    productCost: 850,
    description: "Quick 50-ticket airtime blitz. 20 ETB entry for 850 ETB top-up. Provably fair instant auto-draw upon sellout!",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
    autoRenew: true,
  },
  {
    id: "preset_25_micro",
    name: "⚡ 25-Ticket Micro Instant Raffle",
    badge: "MICRO GAME",
    entryPrice: 10,
    maxEntries: 25,
    prizeTitle: "200 ETB Wallet Drop",
    prizeValue: 200,
    productCost: 200,
    description: "Micro 25-ticket flash game! Only 10 ETB per ticket to win 200 ETB directly into your vault wallet.",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60",
    autoRenew: true,
  },
];

export class InstantDrawService {
  /**
   * List active instant / flash mini draws
   */
  static async listActiveInstantDraws() {
    const campaigns = await db.campaign.findMany({
      where: {
        slug: { startsWith: "flash-" },
        status: { in: ["ACTIVE", "DRAWING"] },
      },
      include: {
        prizes: true,
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return campaigns.map((c) => {
      const entriesSold = c._count.entries;
      const maxEntries = c.maxEntries || 1;
      const remaining = Math.max(0, maxEntries - entriesSold);
      const percentage = Math.min(100, Math.round((entriesSold / maxEntries) * 100));

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        entryPrice: c.entryPrice,
        currency: c.currency || "ETB",
        maxEntries: c.maxEntries,
        entriesSold,
        remainingTickets: remaining,
        percentage,
        prizeTitle: c.prizes?.[0]?.title || c.title,
        prizeValue: c.prizes?.[0]?.value || 0,
        imageUrl: c.imageUrl,
        endsAt: c.endsAt,
        status: c.status,
      };
    });
  }

  /**
   * Launch a new Instant Mini Draw
   */
  static async createInstantDraw(data: {
    title: string;
    entryPrice: number;
    maxEntries: number;
    prizeTitle: string;
    prizeValue: number;
    productCost?: number;
    description?: string;
    imageUrl?: string;
    autoRenew?: boolean;
  }) {
    const randomSuffix = crypto.randomBytes(3).toString("hex").toLowerCase();
    const slug = `flash-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${randomSuffix}`;
    const startsAt = new Date();
    // Default 24-hour expiration (or until sold out)
    const endsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const campaign = await db.campaign.create({
      data: {
        title: data.title,
        slug,
        description: data.description || `⚡ Instant Mini Draw: ${data.title}`,
        entryPrice: Math.max(1, data.entryPrice),
        maxEntries: Math.max(2, data.maxEntries),
        currency: "ETB",
        startsAt,
        endsAt,
        status: "ACTIVE",
        imageUrl: data.imageUrl || "",
        prizes: {
          create: [
            {
              title: data.prizeTitle,
              value: data.productCost || data.prizeValue || 0,
              description: `Instant Prize: ${data.prizeTitle}`,
              imageUrl: data.imageUrl || "",
            },
          ],
        },
      },
    });

    if (data.autoRenew) {
      await setSystemSetting(`flash_autorenew_${campaign.id}`, "true");
    }

    if (data.productCost) {
      await setSystemSetting(`product_cost_${campaign.id}`, data.productCost.toString());
    }

    return campaign;
  }

  /**
   * Execute Automatic Instant Provably Fair Draw when full
   */
  static async checkAndExecuteAutoDraw(campaignId: string) {
    try {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: {
          prizes: true,
          draw: true,
          _count: { select: { entries: true } },
        },
      });

      if (!campaign || campaign.status === "COMPLETED" || campaign.draw?.winningEntryId) {
        return null;
      }

      // Check if valid entries reached max entries
      const validEntriesCount = await db.entry.count({
        where: { campaignId, status: "VALID" },
      });

      if (validEntriesCount < campaign.maxEntries) {
        return null;
      }

      console.log(`[Auto-Draw Triggered] Instant Campaign ${campaign.title} (${campaign.id}) is FULL (${validEntriesCount}/${campaign.maxEntries})`);

      // Execute Provably Fair Draw in serializable transaction
      const result = await db.$transaction(
        async (tx) => {
          await tx.campaign.update({
            where: { id: campaignId },
            data: { status: "DRAWING" },
          });

          const validEntries = await tx.entry.findMany({
            where: { campaignId, status: "VALID" },
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
            throw new Error("No entries found for auto-draw");
          }

          // SHA-256 Snapshot Hash
          const snapshot = JSON.stringify(validEntries.map((e) => e.id));
          const snapshotHash = crypto.createHash("sha256").update(snapshot).digest("hex");

          // Cryptographic random pick
          const winningIdx = crypto.randomInt(0, validEntries.length);
          const winningEntry = validEntries[winningIdx];
          const randomSeed = `instant_idx:${winningIdx}_tot:${validEntries.length}_seed:${crypto.randomBytes(8).toString("hex")}`;

          // Create Draw Record
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

          // Mark Winner Entry & Complete Campaign
          await tx.entry.update({
            where: { id: winningEntry.id },
            data: { status: "WINNER" },
          });

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
      const winningTicket = `TKT-${prefix}-${result.winningEntry.entryNumber}`;
      const prizeTitle = campaign.prizes?.[0]?.title || campaign.title;

      // Send Telegram notification
      try {
        sendEventNotification("WINNER_SELECTED", result.winningEntry.userId, {
          user_name: result.winningEntry.user.name || `Player`,
          prize_title: prizeTitle,
          winning_ticket: winningTicket,
          campaign_title: campaign.title,
          prize_value: campaign.prizes?.[0]?.value || campaign.entryPrice * campaign.maxEntries,
          currency: campaign.currency || "ETB",
        }).catch(console.error);
      } catch (tgErr) {
        console.error("[Telegram Auto-Draw Notify Error]", tgErr);
      }

      // Check Auto-Renew
      const isAutoRenew = (await getSystemSetting(`flash_autorenew_${campaign.id}`, "false")) === "true";
      if (isAutoRenew) {
        // Spawn Next Round automatically!
        this.createInstantDraw({
          title: campaign.title,
          entryPrice: campaign.entryPrice,
          maxEntries: campaign.maxEntries,
          prizeTitle: prizeTitle,
          prizeValue: campaign.prizes?.[0]?.value || 0,
          description: campaign.description,
          imageUrl: campaign.imageUrl || "",
          autoRenew: true,
        }).catch(console.error);
      }

      return result;
    } catch (e) {
      console.error("[Instant Auto-Draw Error]", e);
      return null;
    }
  }
}
