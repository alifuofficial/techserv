import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getMultipleSystemSettings, setSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch all users who are MERCHANTS or have campaigns assigned
    const merchants = await db.user.findMany({
      where: {
        role: "MERCHANT",
      },
      include: {
        merchantCampaigns: {
          include: {
            _count: {
              select: { entries: true },
            },
          },
        },
        ledgerAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch custom commissions from SystemSettings
    const settingKeys = merchants.map((m) => ({
      key: `merchant_comm_${m.id}`,
      defaultValue: "15%",
    }));
    const settingsMap = await getMultipleSystemSettings(settingKeys);

    let totalPlatformMerchantRevenue = 0;
    let totalPartnerCampaigns = 0;

    const formattedMerchants = merchants.map((m) => {
      const activeCampaigns = m.merchantCampaigns.filter((c) => c.status === "ACTIVE").length;
      totalPartnerCampaigns += m.merchantCampaigns.length;

      const revenueMinor = m.merchantCampaigns.reduce((acc, c) => {
        return acc + c.entryPrice * c._count.entries;
      }, 0);

      totalPlatformMerchantRevenue += revenueMinor;
      const commission = settingsMap[`merchant_comm_${m.id}`] || "15%";

      return {
        id: `MCH-${m.id.substring(0, 6).toUpperCase()}`,
        userId: m.id,
        name: m.name || "Merchant Business",
        email: m.email || m.phone || "merchant@milkytech.online",
        phone: m.phone || null,
        campaigns: m.merchantCampaigns.length,
        activeCampaigns,
        revenue: `${revenueMinor.toLocaleString()} ETB`,
        revenueAmount: revenueMinor,
        commission,
        status: m.status, // ACTIVE, PENDING, SUSPENDED
        createdAt: new Date(m.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        merchants: formattedMerchants,
        stats: {
          totalMerchants: merchants.length,
          partnerCampaigns: totalPartnerCampaigns,
          totalRevenue: `${totalPlatformMerchantRevenue.toLocaleString()} ETB`,
          avgCommission: "15.0%",
        },
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/merchants error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch merchants" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, commissionRate = "15%", password } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and Email are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, ...(phone ? [{ phone: phone.trim() }] : [])],
      },
    });

    let merchantUser;

    if (existing) {
      // Promote existing user to MERCHANT
      merchantUser = await db.user.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          role: "MERCHANT",
          status: "ACTIVE",
        },
      });
    } else {
      // Create new Merchant user
      const hashedPassword = password ? await bcrypt.hash(password, 10) : "";
      merchantUser = await db.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone ? phone.trim() : null,
          role: "MERCHANT",
          status: "ACTIVE",
          password: hashedPassword,
        },
      });

      // Create ledger account
      await db.ledgerAccount.create({
        data: {
          userId: merchantUser.id,
          balance: 0,
          currency: "ETB",
        },
      });
    }

    // Save commission
    if (commissionRate) {
      await setSystemSetting(`merchant_comm_${merchantUser.id}`, commissionRate.includes("%") ? commissionRate : `${commissionRate}%`);
    }

    return NextResponse.json({
      success: true,
      message: `Merchant "${name}" onboarded successfully!`,
      merchant: merchantUser,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/merchants error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to onboard merchant" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, status, commissionRate } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Merchant User ID is required" }, { status: 400 });
    }

    if (status) {
      await db.user.update({
        where: { id: userId },
        data: { status },
      });
    }

    if (commissionRate) {
      await setSystemSetting(
        `merchant_comm_${userId}`,
        commissionRate.includes("%") ? commissionRate : `${commissionRate}%`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Merchant updated successfully.",
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/merchants error]", error);
    return NextResponse.json({ success: false, error: "Failed to update merchant" }, { status: 500 });
  }
}
