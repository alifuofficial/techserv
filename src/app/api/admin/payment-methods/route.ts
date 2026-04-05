import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const paymentMethods = await db.paymentMethod.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    return NextResponse.json(paymentMethods);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

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

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["bank", "mobile_money", "crypto", "other"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const paymentMethod = await db.paymentMethod.create({
      data: {
        name: name.trim(),
        type: type || "other",
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        details: details ? JSON.stringify(details) : "{}",
        instructions: instructions || "",
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
