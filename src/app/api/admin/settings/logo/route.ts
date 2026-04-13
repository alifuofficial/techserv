import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Use a unique name to avoid caching issues but keep it descriptive
    const fileName = `logo-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = join(uploadDir, fileName);
    const logoUrl = `/uploads/${fileName}`;

    await writeFile(filePath, buffer);

    // Update the logo_url setting in the database
    await (db as any).setting.upsert({
      where: { key: "logo_url" },
      update: { value: logoUrl },
      create: { 
        key: "logo_url", 
        value: logoUrl, 
        label: "Logo URL", 
        group: "general", 
        type: "text" 
      },
    });

    return NextResponse.json({ success: true, url: logoUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
