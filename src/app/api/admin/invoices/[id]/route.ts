import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, telegram: true },
        },
        order: {
          select: {
            id: true,
            duration: true,
            amount: true,
            status: true,
            service: {
              select: { id: true, title: true, icon: true },
            },
          },
        },
        paymentMethod: {
          select: { id: true, name: true, type: true, details: true, instructions: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
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

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentMethodId } = body as {
      status?: string;
      paymentMethodId?: string;
    };

    // Validate status if provided
    const validStatuses = ["pending", "paid", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Check invoice exists
    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      // Set paidAt when marking as paid
      if (status === "paid" && existing.status !== "paid") {
        updateData.paidAt = new Date();
      }
      // Clear paidAt when unmarking
      if (status !== "paid") {
        updateData.paidAt = null;
      }
    }
    if (paymentMethodId !== undefined) {
      updateData.paymentMethodId = paymentMethodId;
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, telegram: true },
        },
        order: {
          select: {
            id: true,
            duration: true,
            amount: true,
            status: true,
            service: {
              select: { id: true, title: true, icon: true },
            },
          },
        },
        paymentMethod: {
          select: { id: true, name: true, type: true, details: true, instructions: true },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
