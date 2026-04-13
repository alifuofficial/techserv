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
  console.log("🌱 Seeding admin user...\n");

  const adminPassword = hashPassword("admin123");
  const admin = await db.user.upsert({
    where: { email: "admin@milkytech.online" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@milkytech.online",
      password: adminPassword,
      role: "admin",
      phone: "+251911000000",
      telegram: "@milkytech_online_admin",
    },
  });

  console.log("✅ Admin user ready:", admin.email);
  console.log("\n📋 Admin Credentials:");
  console.log("   Email: admin@milkytech.online");
  console.log("   Password: admin123");
  console.log("\n⚠️  Please change the admin password after first login!");
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