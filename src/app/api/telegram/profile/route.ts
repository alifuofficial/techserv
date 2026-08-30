import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const email = user.email || "";
    const telegramId = email.split("@")[0].replace("telegram_", "");

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        telegramId: telegramId || user.id.substring(0, 8),
        balance: user.ledgerAccount?.balance || 0,
        referralCode: user.referralCode || `MILKY-${user.id.substring(0, 6).toUpperCase()}`,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/profile error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please re-open the app." }, { status: 401 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();

    if (!name) {
      return NextResponse.json({ success: false, error: "Full name cannot be empty." }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { name },
    });

    try {
      revalidatePath("/telegram/profile");
      revalidatePath("/telegram");
    } catch (_) {}

    return NextResponse.json({
      success: true,
      name: updated.name,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("[POST /api/telegram/profile error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
