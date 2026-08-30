'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const userId = (session.user as any)?.id;
  const email = session.user.email;

  let user = null;
  if (userId) {
    user = await db.user.findUnique({
      where: { id: userId },
      include: { ledgerAccount: true }
    });
  }

  if (!user && email) {
    user = await db.user.findUnique({
      where: { email },
      include: { ledgerAccount: true }
    });
  }

  return user;
}

export async function getTelegramDashboardData() {
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: {
          notIn: ['DRAFT', 'draft', 'CANCELLED', 'cancelled']
        }
      },
      include: {
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const mappedCampaigns = campaigns.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      image: c.imageUrl || null,
      ticketPrice: c.entryPrice,
      currency: c.currency || "ETB",
      drawDate: c.endsAt,
      maxEntries: c.maxEntries,
      entriesCount: c._count.entries
    }));

    const user = await getAuthUser();
    if (!user) {
      return {
        balance: 0,
        campaigns: mappedCampaigns,
        ticketsCount: 0,
        winsCount: 0
      };
    }

    const userEntries = await db.entry.findMany({
      where: { userId: user.id },
      select: { id: true }
    });

    const userEntryIds = userEntries.map(e => e.id);

    const winsCount = userEntryIds.length > 0 ? await db.draw.count({
      where: {
        status: 'COMPLETED',
        winningEntryId: { in: userEntryIds }
      }
    }) : 0;

    return {
      balance: user.ledgerAccount?.balance || 0,
      campaigns: mappedCampaigns,
      ticketsCount: userEntries.length,
      winsCount
    };
  } catch (error) {
    console.error("[getTelegramDashboardData error]", error);
    return {
      balance: 0,
      campaigns: [],
      ticketsCount: 0,
      winsCount: 0
    };
  }
}

export async function getTelegramTickets() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, tickets: [], error: "Unauthorized" };
    }

    const entries = await db.entry.findMany({
      where: { userId: user.id },
      include: {
        campaign: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const tickets = entries.map(entry => {
      const prefix = entry.campaignId.substring(0, 4).toUpperCase();
      return {
        id: entry.id,
        entryNumber: entry.entryNumber,
        ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
        campaignId: entry.campaignId,
        campaignTitle: entry.campaign.title,
        campaignSlug: entry.campaign.slug,
        campaignImage: entry.campaign.imageUrl || null,
        campaignStatus: entry.campaign.status,
        entryPrice: entry.campaign.entryPrice,
        currency: entry.campaign.currency,
        drawDate: entry.campaign.endsAt,
        createdAt: entry.createdAt.toISOString(),
      };
    });

    return { success: true, tickets };
  } catch (error: any) {
    console.error("[getTelegramTickets error]", error);
    return { success: false, tickets: [], error: error.message || "Failed to load tickets" };
  }
}

export async function getTelegramWins() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, wins: [], error: "Unauthorized" };
    }

    const userEntries = await db.entry.findMany({
      where: { userId: user.id },
      select: { id: true, entryNumber: true, campaignId: true }
    });

    if (userEntries.length === 0) {
      return { success: true, wins: [] };
    }

    const userEntryIds = userEntries.map(e => e.id);

    const winningDraws = await db.draw.findMany({
      where: {
        status: 'COMPLETED',
        winningEntryId: { in: userEntryIds }
      },
      include: {
        campaign: {
          include: {
            prizes: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    const wins = winningDraws.map(draw => {
      const winningEntry = userEntries.find(e => e.id === draw.winningEntryId);
      const prefix = (winningEntry ? winningEntry.campaignId : draw.campaignId).substring(0, 4).toUpperCase();
      const ticketNumber = winningEntry ? `TKT-${prefix}-${winningEntry.entryNumber}` : "WINNING TICKET";
      const prizeTitle = draw.campaign.prizes?.[0]?.title || "Grand Prize";

      return {
        id: draw.id,
        campaignTitle: draw.campaign.title,
        campaignSlug: draw.campaign.slug,
        campaignImage: draw.campaign.imageUrl || null,
        ticketNumber,
        prizeTitle,
        wonAt: (draw.completedAt || draw.createdAt).toISOString(),
        status: "CLAIMED"
      };
    });

    return { success: true, wins };
  } catch (error: any) {
    console.error("[getTelegramWins error]", error);
    return { success: false, wins: [], error: error.message || "Failed to load wins" };
  }
}

export async function getTelegramProfileData() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, user: null, error: "Unauthorized" };
    }

    const email = user.email || "";
    const telegramId = email.split('@')[0].replace('telegram_', '');

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        telegramId: telegramId || user.id.substring(0, 8),
        balance: user.ledgerAccount?.balance || 0,
        createdAt: user.createdAt.toISOString()
      }
    };
  } catch (error: any) {
    console.error("[getTelegramProfileData error]", error);
    return { success: false, user: null, error: error.message || "Failed to load profile" };
  }
}

export async function updateTelegramProfileName(data: { name: string }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please re-open the app." };
    }

    const trimmedName = data.name ? data.name.trim() : "";
    if (!trimmedName) {
      return { success: false, error: "Name cannot be empty." };
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { name: trimmedName },
    });

    try {
      revalidatePath("/telegram/profile");
      revalidatePath("/telegram");
    } catch (_) {}

    return { success: true, name: updatedUser.name };
  } catch (error: any) {
    console.error("[updateTelegramProfileName error]", error);
    return { success: false, error: error.message || "Failed to update profile name" };
  }
}
