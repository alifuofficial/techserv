import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Find the verification token
    const verificationToken = await (db as any).verificationToken.findUnique({
      where: {
        email_token: {
          email,
          token: otp,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Check if expired
    if (new Date() > verificationToken.expires) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
    }

    // Activate the user
    await (db.user as any).update({
      where: { email },
      data: {
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Delete the token
    await (db as any).verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
