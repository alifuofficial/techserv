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

    const services = await db.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json(services);
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
      title,
      slug,
      shortDescription,
      longDescription,
      features,
      icon,
      pricingType,
      pricingTiers,
      isActive,
      sortOrder,
    } = body as {
      title?: string;
      slug?: string;
      shortDescription?: string;
      longDescription?: string;
      features?: string;
      icon?: string;
      pricingType?: string;
      pricingTiers?: unknown;
      isActive?: boolean;
      sortOrder?: number;
    };

    // Validate required fields
    if (!title || !shortDescription) {
      return NextResponse.json(
        { error: "Title and short description are required" },
        { status: 400 }
      );
    }

    // Validate pricing type
    if (pricingType !== "subscription" && pricingType !== "one_time") {
      return NextResponse.json(
        { error: "pricingType must be 'subscription' or 'one_time'" },
        { status: 400 }
      );
    }

    // Validate pricing tiers
    if (!Array.isArray(pricingTiers) || pricingTiers.length === 0) {
      return NextResponse.json(
        { error: "At least one pricing tier is required" },
        { status: 400 }
      );
    }

    for (const tier of pricingTiers) {
      if (!tier.label || typeof tier.label !== "string") {
        return NextResponse.json(
          { error: "Each tier must have a label" },
          { status: 400 }
        );
      }
      if (typeof tier.price !== "number" || tier.price < 0) {
        return NextResponse.json(
          { error: `Tier "${tier.label}" must have a valid price` },
          { status: 400 }
        );
      }
    }

    // Generate slug from title if not provided
    const serviceSlug = slug
      ? slug
      : title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "");

    // Check for duplicate slug
    const existingService = await db.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "A service with this slug already exists" },
        { status: 409 }
      );
    }

    const service = await db.service.create({
      data: {
        title,
        slug: serviceSlug,
        shortDescription,
        longDescription: longDescription ?? "",
        features: features ?? "",
        icon: icon ?? "Zap",
        pricingType: pricingType ?? "one_time",
        pricingTiers: JSON.stringify(pricingTiers),
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
