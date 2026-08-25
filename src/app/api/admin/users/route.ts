import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ledgerAccount: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, status } = body;

    if (email) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password || "MilkyTech123!", 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        status: status || "ACTIVE",
        ledgerAccount: {
          create: { balance: 0 }
        }
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("User Creation Error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
