import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, templateText, enabled } = body;

    if (!eventType) {
      return NextResponse.json({ success: false, error: "Event type is required" }, { status: 400 });
    }

    const templateKey = `notify_template_${eventType.toLowerCase()}`;
    const enabledKey = `notify_enabled_${eventType.toLowerCase()}`;

    await Promise.all([
      db.systemSetting.upsert({
        where: { key: templateKey },
        create: { key: templateKey, value: templateText || "" },
        update: { value: templateText || "" },
      }),
      db.systemSetting.upsert({
        where: { key: enabledKey },
        create: { key: enabledKey, value: enabled ? "true" : "false" },
        update: { value: enabled ? "true" : "false" },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Template updated successfully" });
  } catch (error: any) {
    console.error("[POST /api/admin/notifications/templates error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update template" }, { status: 500 });
  }
}
