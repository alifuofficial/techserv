import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const paymentMethods = await db.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        details: true,
        instructions: true,
      },
    });

    return NextResponse.json(paymentMethods);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
