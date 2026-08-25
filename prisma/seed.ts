import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require("bcryptjs");
    return bcrypt.hashSync(password, 12);
  } catch {
    return "sha256$" + createHash("sha256").update(password).digest("hex");
  }
}

async function seed() {
  console.log("🌱 Seeding demo accounts...\n");

  // 1. Admin
  const adminPassword = hashPassword("admin123");
  const admin = await db.user.upsert({
    where: { email: "admin@milkytech.online" },
    update: {},
    create: {
      name: "Admin Demo",
      email: "admin@milkytech.online",
      password: adminPassword,
      role: "ADMIN",
      phone: "+251911000000",
    },
  });

  // 2. Regular User
  const userPassword = hashPassword("user123");
  const user = await db.user.upsert({
    where: { email: "user@milkytech.online" },
    update: {},
    create: {
      name: "Regular User Demo",
      email: "user@milkytech.online",
      password: userPassword,
      role: "USER",
      phone: "+251911000001",
    },
  });

  // 3. Merchant
  const merchantPassword = hashPassword("merchant123");
  const merchant = await db.user.upsert({
    where: { email: "merchant@milkytech.online" },
    update: {},
    create: {
      name: "Merchant Demo",
      email: "merchant@milkytech.online",
      password: merchantPassword,
      role: "MERCHANT",
      phone: "+251911000002",
    },
  });

  console.log("✅ Accounts ready!");
  console.log("\n📋 Demo Credentials:");
  console.log("\n[ADMIN]");
  console.log("   Email: admin@milkytech.online");
  console.log("   Password: admin123");
  
  console.log("\n[USER]");
  console.log("   Email: user@milkytech.online");
  console.log("   Password: user123");

  console.log("\n[MERCHANT]");
  console.log("   Email: merchant@milkytech.online");
  console.log("   Password: merchant123");
  
  console.log("\n⚠️  Please change the admin password after first login in production!");
  console.log("\n🎉 Done!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });