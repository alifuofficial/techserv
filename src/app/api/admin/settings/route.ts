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

    const allSettings = await db.setting.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Group settings by group field
    const groups: Record<string, typeof allSettings> = {};
    for (const setting of allSettings) {
      const group = setting.group || "general";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(setting);
    }

    return NextResponse.json({
      settings: allSettings,
      groups,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { settings } = body as {
      settings: { key: string; value: string }[];
    };

    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: "Settings array is required" },
        { status: 400 }
      );
    }

    // Upsert each setting by key
    const updatedSettings = await Promise.all(
      settings.map(async ({ key, value }) => {
        return db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      })
    );

    return NextResponse.json(updatedSettings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
