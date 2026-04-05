import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;

    const invoice = await db.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        order: {
          include: {
            service: {
              select: { id: true, title: true, slug: true, icon: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
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
