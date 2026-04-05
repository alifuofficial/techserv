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

    const service = await db.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
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

    // Verify service exists
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
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

    // If slug is being updated, check for duplicates
    if (slug && slug !== existing.slug) {
      const slugConflict = await db.service.findUnique({ where: { slug } });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A service with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updatedService = await db.service.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(longDescription !== undefined && { longDescription }),
        ...(features !== undefined && { features }),
        ...(icon !== undefined && { icon }),
        ...(price3m !== undefined && { price3m }),
        ...(price6m !== undefined && { price6m }),
        ...(price12m !== undefined && { price12m }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(updatedService);
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

    // Verify service exists
    const service = await db.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Prevent deletion if orders exist
    if (service._count.orders > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with existing orders. Please remove or reassign all orders first." },
        { status: 400 }
      );
    }

    await db.service.delete({ where: { id } });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
