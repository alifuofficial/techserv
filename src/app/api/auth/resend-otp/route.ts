import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists and is not verified
    const user = await (db.user as any).findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isActive) {
      return NextResponse.json({ error: "User is already verified" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the new OTP (replace existing if any)
    await (db as any).verificationToken.upsert({
      where: {
        email_token: {
          email,
          token: otp, // Wait, upsert needs a unique field. VerificationToken has @@unique([email, token])
        },
      },
      update: {
        token: otp,
        expires,
      },
      create: {
        email,
        token: otp,
        expires,
      },
    });
    
    // Actually, for multiple tokens per email, it's better to delete old ones.
    await (db as any).verificationToken.deleteMany({
      where: { email },
    });

    await (db as any).verificationToken.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, message: "A new verification code has been sent to your email." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
