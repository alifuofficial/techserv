import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer;
    let originalFilename = "upload.png";

    if (contentType.includes("application/json")) {
      // Handle base64 upload (from TMA)
      const body = await request.json();
      const { base64, filename } = body;
      
      if (!base64) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Extract base64 data
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
      
      // Extract extension from base64 header if present
      const extMatch = base64.match(/^data:image\/(\w+);base64,/);
      if (extMatch) {
        const ext = extMatch[1];
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
        }
        originalFilename = `upload.${ext}`;
      }
    } else {
      // Handle FormData upload (standard)
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only PNG, JPG, WebP, and GIF are allowed." },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      // Generate unique filename
      const ext = file.name.split(".").pop() || "png";
      originalFilename = file.name;
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    // Validate buffer size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const uniqueName = `${randomUUID()}.${originalFilename.split(".").pop() || "png"}`;

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Return the URL path
    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({ url, filename: originalFilename });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
