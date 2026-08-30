import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const { confirmation } = body;

    if (confirmation !== "RESET") {
      return NextResponse.json(
        { success: false, error: "Invalid confirmation code. You must type 'RESET' to confirm platform wipe." },
        { status: 400 }
      );
    }

    // Execute platform data wipe in safe sequential order
    await db.$transaction(async (tx) => {
      // 1. Delete all draw records
      await tx.draw.deleteMany({});

      // 2. Delete all ticket entries
      await tx.entry.deleteMany({});

      // 3. Delete all payment records
      await tx.payment.deleteMany({});

      // 4. Delete all ledger transactions
      await tx.ledgerTransaction.deleteMany({});

      // 5. Reset all ledger account balances to 0
      await tx.ledgerAccount.updateMany({
        data: { balance: 0 },
      });

      // 6. Delete all non-admin users and their linked identities
      const nonAdminUsers = await tx.user.findMany({
        where: { role: { not: "ADMIN" } },
        select: { id: true },
      });

      const userIdsToDelete = nonAdminUsers.map((u) => u.id);

      if (userIdsToDelete.length > 0) {
        await tx.userIdentity.deleteMany({
          where: { userId: { in: userIdsToDelete } },
        });

        await tx.ledgerAccount.deleteMany({
          where: { userId: { in: userIdsToDelete } },
        });

        await tx.user.deleteMany({
          where: { id: { in: userIdsToDelete } },
        });
      }

      // 7. Reset all campaigns back to ACTIVE status
      await tx.campaign.updateMany({
        where: { status: { in: ["COMPLETED", "DRAWING", "CLOSED"] } },
        data: { status: "ACTIVE" },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Platform data has been successfully wiped and reset. All entries, draws, payments, and test users have been cleared.",
    });
  } catch (error: any) {
    console.error("[POST /api/admin/system/reset error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset platform data" },
      { status: 500 }
    );
  }
}
