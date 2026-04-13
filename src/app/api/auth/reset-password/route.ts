import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

// Try to load bcryptjs, fallback to sha256 hashing
let bcrypt: typeof import("bcryptjs") | null = null;
try {
  bcrypt = require("bcryptjs");
} catch {}

function hashPassword(password: string): string {
  if (bcrypt) return bcrypt.hashSync(password, 12);
  return "sha256$" + createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid reset code" }, { status: 400 });
    }

    // Check if expired
    if (new Date() > verificationToken.expires) {
      return NextResponse.json({ error: "Reset code has expired" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = hashPassword(newPassword);

    // Update the user's password
    await (db.user as any).update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the token
    await (db as any).verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
