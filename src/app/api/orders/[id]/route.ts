import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sessionUser = session.user as Record<string, unknown>;
    const userId = sessionUser.id as string;
    const userRole = sessionUser.role as string;


    const order = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            longDescription: true,
            icon: true,
            pricingType: true,
            pricingTiers: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            telegram: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Non-admin users can only see their own orders
    if (userRole !== "admin" && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = session.user as Record<string, unknown>;
    const userRole = sessionUser.role as string;

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNote, progress, statusMessage } = body as { 
      status?: string; 
      adminNote?: string;
      progress?: number;
      statusMessage?: string;
    };

    // Validate status if provided
    const validStatuses = ["pending", "approved", "completed", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be pending, approved, completed, or rejected" },
        { status: 400 }
      );
    }

    // Validate progress if provided
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Check order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (progress !== undefined) updateData.progress = progress;
    if (statusMessage !== undefined) updateData.statusMessage = statusMessage;

    const updatedOrder = (await db.order.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        user: true,
      },
    })) as any;

    // Send Telegram notification
    if (updatedOrder.user?.telegramId) {
      const { sendTelegramNotification } = await import("@/lib/telegram-notifications");
      
      let message = "";
      if (status && status !== existingOrder.status) {
        const statusEmoji: Record<string, string> = {
          pending: "⏳",
          approved: "🚀",
          completed: "🎉",
          rejected: "❌",
        };
        const emoji = statusEmoji[status] || "ℹ️";
        
        if (status === 'approved') message = `<b>Payment Accepted! ${emoji}</b>\n\nYour payment for <b>${updatedOrder.service.title}</b> was verified. The project has moved to the Fulfillment Center.\n\n`;
        else if (status === 'completed') message = `<b>Order Delivered! ${emoji}</b>\n\nYour project for <b>${updatedOrder.service.title}</b> is now fully complete.\n\n`;
        else if (status === 'rejected') message = `<b>Order Rejected ${emoji}</b>\n\nYour order for <b>${updatedOrder.service.title}</b> was rejected.\n\n`;
        else message = `<b>Order Status: ${status.toUpperCase()} ${emoji}</b>\n\nYour order for <b>${updatedOrder.service.title}</b> has been updated.\n\n`;
      } else if (progress !== undefined && progress !== existingOrder.progress) {
        message = `<b>Project Progress 📊</b>\n\nYour <b>${updatedOrder.service.title}</b> project is now <b>${progress}%</b> complete.\n\n`;
      }

      if (statusMessage && message) {
        message += `<b>Message:</b> <i>${statusMessage}</i>\n\n`;
      } else if (statusMessage && !message) {
        message = `<b>Project Update (${updatedOrder.service.title}) 💬</b>\n\n<i>${statusMessage}</i>\n\n`;
      }

      if (message) {
        message += `Order ID: <code>${updatedOrder.id}</code>\n\nThank you for choosing MilkyTech!`;
        await sendTelegramNotification(updatedOrder.userId, message);
      }
    }

    // Send Email notification
    try {
      const { sendOrderNotificationEmail } = await import("@/lib/email");
      if (status && status !== existingOrder.status) {
        await sendOrderNotificationEmail(updatedOrder.user.email, {
          id: updatedOrder.id,
          title: updatedOrder.service.title,
          amount: updatedOrder.amount,
          status: status,
        });
      }
    } catch (emailError) {
      console.error("Failed to send order status email:", emailError);
    }

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
