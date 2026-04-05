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

    const paymentMethod = await db.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    return NextResponse.json(paymentMethod);
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
    const {
      name,
      type,
      isActive,
      sortOrder,
      details,
      instructions,
    } = body as {
      name?: string;
      type?: string;
      isActive?: boolean;
      sortOrder?: number;
      details?: Record<string, string>;
      instructions?: string;
    };

    // Validate type if provided
    const validTypes = ["bank", "mobile_money", "crypto", "other"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Check payment method exists
    const existing = await db.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (details !== undefined) updateData.details = JSON.stringify(details);
    if (instructions !== undefined) updateData.instructions = instructions;

    const paymentMethod = await db.paymentMethod.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    return NextResponse.json(paymentMethod);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check payment method exists and get invoice count
    const existing = await db.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    if (existing._count.invoices > 0) {
      return NextResponse.json(
        { error: `Cannot delete payment method with ${existing._count.invoices} invoice(s)` },
        { status: 400 }
      );
    }

    await db.paymentMethod.delete({ where: { id } });

    return NextResponse.json({ message: "Payment method deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
