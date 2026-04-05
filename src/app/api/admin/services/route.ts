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
      price3m,
      price6m,
      price12m,
      isActive,
      sortOrder,
    } = body as {
      title?: string;
      slug?: string;
      shortDescription?: string;
      longDescription?: string;
      features?: string;
      icon?: string;
      price3m?: number;
      price6m?: number;
      price12m?: number;
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

    if (price3m === undefined || price6m === undefined || price12m === undefined) {
      return NextResponse.json(
        { error: "All pricing fields (price3m, price6m, price12m) are required" },
        { status: 400 }
      );
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
        price3m,
        price6m,
        price12m,
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
