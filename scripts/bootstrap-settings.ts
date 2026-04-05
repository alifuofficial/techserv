import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = [
    {
      key: "account_tier_enabled",
      value: "true",
      label: "Account Tier System",
      type: "toggle",
      group: "features",
    },
    {
      key: "referral_system_enabled",
      value: "true",
      label: "User Referral System",
      type: "toggle",
      group: "features",
    },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
    console.log(`Setting ${s.key} initialized.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
