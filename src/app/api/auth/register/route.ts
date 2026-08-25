import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, phone, password } = await req.json();

    if (!email || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email or phone already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        role: "USER"
      }
    });

    // Initialize Ledger account for new user
    await db.ledgerAccount.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: "ETB"
      }
    });

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
