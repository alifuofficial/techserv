import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, referralCode: providedReferralCode } = body;

    // Check if registration is enabled
    const registrationSetting = await (db.setting as any).findUnique({
      where: { key: "registration_enabled" }
    });
    
    if (registrationSetting && registrationSetting.value === "false") {
      return NextResponse.json(
        { error: "Registration is currently disabled by the administrator." },
        { status: 403 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate a simple unique referral code
    const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Check for referral code if provided
    let referredById: any = null;
    if (providedReferralCode) {
      const referrer = await (db.user as any).findUnique({
        where: { referralCode: providedReferralCode } as any,
        select: { id: true },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Create user
    const user = await (db.user as any).create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
        tier: "Standard",
        referralCode: newReferralCode,
        referredById,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
