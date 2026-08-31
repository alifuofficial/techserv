import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMultipleSystemSettings, setSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await db.user.findMany({
      where: {
        role: { not: "ADMIN" },
      },
      include: {
        identities: true,
        ledgerAccount: true,
        _count: {
          select: {
            entries: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch custom KYC settings for all users in parallel
    const settingKeys = users.flatMap((u) => [
      { key: `kyc_status_${u.id}`, defaultValue: "" },
      { key: `kyc_doc_${u.id}`, defaultValue: "" },
      { key: `kyc_reason_${u.id}`, defaultValue: "" },
    ]);

    const settingsMap = await getMultipleSystemSettings(settingKeys);

    const kycRequests = users.map((user) => {
      const tgIdentity = user.identities.find((i) => i.provider === "telegram");
      const customStatus = settingsMap[`kyc_status_${user.id}`];
      const customDoc = settingsMap[`kyc_doc_${user.id}`];
      const customReason = settingsMap[`kyc_reason_${user.id}`];

      // Default status logic if not explicitly set:
      // If user has linked Telegram identity or completed payments -> VERIFIED, else PENDING
      const status = customStatus
        ? customStatus.toUpperCase()
        : tgIdentity || user._count.payments > 0
        ? "VERIFIED"
        : "PENDING";

      const docType = customDoc || (tgIdentity ? "Telegram Verified ID" : "National ID");
      const riskLevel = user.status === "SUSPENDED" ? "High" : user._count.payments > 0 || tgIdentity ? "Low" : "Medium";

      return {
        id: `KYC-${user.id.substring(0, 6).toUpperCase()}`,
        userId: user.id,
        user: user.name || (tgIdentity ? `Telegram Member (${tgIdentity.providerId})` : "User " + user.id.substring(0, 6)),
        email: user.email || (tgIdentity ? `tg_${tgIdentity.providerId}` : user.phone || "N/A"),
        telegramId: tgIdentity?.providerId || null,
        type: docType,
        date: new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        risk: riskLevel,
        status: status, // VERIFIED, PENDING, REJECTED
        reason: customReason || null,
        ticketsCount: user._count.entries,
        paymentsCount: user._count.payments,
        walletBalance: user.ledgerAccount?.balance || 0,
      };
    });

    const pendingCount = kycRequests.filter((r) => r.status === "PENDING").length;
    const verifiedCount = kycRequests.filter((r) => r.status === "VERIFIED").length;
    const rejectedCount = kycRequests.filter((r) => r.status === "REJECTED").length;
    const highRiskCount = kycRequests.filter((r) => r.risk === "High").length;
    const totalCount = kycRequests.length || 1;
    const rejectionRate = ((rejectedCount / totalCount) * 100).toFixed(1) + "%";

    return NextResponse.json({
      success: true,
      data: {
        kycRequests,
        stats: {
          pendingCount,
          verifiedCount,
          rejectedCount,
          highRiskCount,
          rejectionRate,
          totalCount: kycRequests.length,
        },
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/kyc error]", error);
    return NextResponse.json({ success: false, error: "Failed to load real KYC data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, newStatus, reason, docType } = body;

    if (!userId || !newStatus) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const validStatus = ["VERIFIED", "PENDING", "REJECTED"].includes(newStatus.toUpperCase());
    if (!validStatus) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    await setSystemSetting(`kyc_status_${userId}`, newStatus.toUpperCase());

    if (reason !== undefined) {
      await setSystemSetting(`kyc_reason_${userId}`, reason || "");
    }

    if (docType) {
      await setSystemSetting(`kyc_doc_${userId}`, docType);
    }

    // If user is verified, ensure active
    if (newStatus.toUpperCase() === "VERIFIED") {
      await db.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `User KYC status updated to ${newStatus.toUpperCase()}`,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/kyc error]", error);
    return NextResponse.json({ success: false, error: "Failed to update KYC status" }, { status: 500 });
  }
}
