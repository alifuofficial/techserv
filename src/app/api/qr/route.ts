import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("data");
    if (!url) {
      return NextResponse.json({ error: "Missing 'data' parameter" }, { status: 400 });
    }

    const size = parseInt(request.nextUrl.searchParams.get("size") || "200");
    const margin = parseInt(request.nextUrl.searchParams.get("margin") || "2");

    const dataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    return NextResponse.json({ qr: dataUrl });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
