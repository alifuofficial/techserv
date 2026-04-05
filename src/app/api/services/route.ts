import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Map to include orderCount instead of nested _count
    const servicesWithOrderCount = services.map((service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      features: service.features,
      icon: service.icon,
      price3m: service.price3m,
      price6m: service.price6m,
      price12m: service.price12m,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      orderCount: service._count.orders,
    }));

    return NextResponse.json(servicesWithOrderCount);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
