import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram-notifications";
import { sendBroadcastEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { channel, target, message } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 });
    }

    // Determine target users query
    let userFilter: any = {};
    if (target === "verified") {
      userFilter = { emailVerified: { not: null } };
    }
    // "all" means no filter, get everyone

    const users = await db.user.findMany({
      where: userFilter,
      select: {
        id: true,
        email: true,
        telegramId: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "No users matched the target criteria." }, { status: 404 });
    }

    // Process dispatch in the background so we don't hold the request
    let promisedDispatches: Promise<any>[] = [];
    let sentViaTelegram = 0;
    let sentViaEmail = 0;

    for (const user of users) {
      // Telegram Dispatch
      if ((channel === "telegram" || channel === "both") && user.telegramId) {
        sentViaTelegram++;
        promisedDispatches.push(
          // Artificial small delay to avoid rate limiting for bulk
          new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)).then(() =>
            sendTelegramNotification(
              user.id,
              `📢 <b>Announcement from MilkyTech</b>\n\n${message}`
            ).catch((err) => console.error("Telegram broadcast failed for user:", user.id, err))
          )
        );
      }

      // Email Dispatch
      if ((channel === "email" || channel === "both") && user.email) {
        // Exclude system accounts like those registered exclusively via telegram if needed,
        // but `user.email` handles this implicitly if valid
        if (!user.email.includes("@telegram.user")) {
          sentViaEmail++;
          promisedDispatches.push(
            sendBroadcastEmail(user.email, message).catch((err) =>
              console.error("Email broadcast failed for user:", user.email, err)
            )
          );
        }
      }
    }

    // Run without blocking response to client
    Promise.allSettled(promisedDispatches);

    return NextResponse.json({
      success: true,
      message: "Broadcast dispatched to background processors successfully.",
      stats: {
        totalTargeted: users.length,
        queuedForTelegram: sentViaTelegram,
        queuedForEmail: sentViaEmail,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
