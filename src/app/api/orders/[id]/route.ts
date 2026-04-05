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
            price3m: true,
            price6m: true,
            price12m: true,
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
    const { status, adminNote } = body as { status?: string; adminNote?: string };

    // Validate status if provided
    const validStatuses = ["pending", "approved", "completed", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be pending, approved, completed, or rejected" },
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
    const updateData: { status?: string; adminNote?: string } = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            icon: true,
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

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
