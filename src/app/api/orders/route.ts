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

    const userId = (session.user as Record<string, unknown>).id as string;

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
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
      },
    });

    return NextResponse.json(orders);
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

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await request.json();
    const { serviceId, duration, telegramUsername, screenshot } = body;

    if (!serviceId || !duration) {
      return NextResponse.json(
        { error: "Service ID and duration are required" },
        { status: 400 }
      );
    }

    // Validate service exists and is active
    const service = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Parse pricing tiers and find the matching tier for the selected duration
    let tiers: Array<{ label: string; duration: string; price: number }>;
    try {
      tiers = JSON.parse(service.pricingTiers) as Array<{ label: string; duration: string; price: number }>;
    } catch {
      return NextResponse.json(
        { error: "Service pricing data is corrupted" },
        { status: 500 }
      );
    }

    const selectedTier = tiers.find((t) => t.duration === duration);
    if (!selectedTier) {
      return NextResponse.json(
        { error: `Invalid duration "${duration}". Available durations: ${tiers.map((t) => t.duration).join(', ')}` },
        { status: 400 }
      );
    }

    const amount = selectedTier.price;

    // Create order
    const order = await db.order.create({
      data: {
        userId,
        serviceId,
        duration,
        amount,
        telegramUsername: telegramUsername || null,
        screenshot: screenshot || null,
        status: "pending",
      },
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
      },
    });

    // Generate unique invoice number and create invoice
    const count = await db.invoice.count();
    const d = new Date();
    const invoiceNumber = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;
    await db.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        userId,
        amount: order.amount,
        status: 'pending',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
