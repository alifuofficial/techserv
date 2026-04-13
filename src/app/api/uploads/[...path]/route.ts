import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathParams = await params;
    const pathArray = pathParams.path;
    const filePath = pathArray.join("/");
    
    // Security: Basic check to prevent path traversal
    if (filePath.includes("..")) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    const fullPath = join(process.cwd(), "public", "uploads", ...pathArray);

    if (!existsSync(fullPath)) {
      // Fallback: check project root if different (unlikely but safe for some edge cases)
      const fallbackPath = join(process.cwd(), "uploads", ...pathArray);
      if (!existsSync(fallbackPath)) {
        return new NextResponse("File not found", { status: 404 });
      }
      const fileBuffer = await readFile(fallbackPath);
      return serveFile(fileBuffer, filePath);
    }

    const fileBuffer = await readFile(fullPath);
    return serveFile(fileBuffer, filePath);
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function serveFile(fileBuffer: Buffer, filePath: string) {
  // Determine content type based on extension
  const ext = filePath.split(".").pop()?.toLowerCase();
  let contentType = "application/octet-stream";
  
  if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
  else if (ext === "png") contentType = "image/png";
  else if (ext === "gif") contentType = "image/gif";
  else if (ext === "svg") contentType = "image/svg+xml";
  else if (ext === "webp") contentType = "image/webp";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
