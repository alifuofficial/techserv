import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, value, description, imageUrl, campaignId } = body;

    const updated = await db.prize.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        value: value !== undefined ? Number(value) : undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        campaignId: campaignId !== undefined ? campaignId : undefined,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            currency: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prize: updated });
  } catch (error: any) {
    console.error("[PUT /api/admin/prizes/[id] error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update prize" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db.prize.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Prize deleted" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/prizes/[id] error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete prize" }, { status: 500 });
  }
}
