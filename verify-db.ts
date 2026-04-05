import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No users found to check schema.");
    return;
  }
  const keys = Object.keys(user);
  console.log("Has tier:", keys.includes("tier"));
  console.log("Has referralCode:", keys.includes("referralCode"));
  console.log("Fields:", keys.join(", "));
}

main().catch(console.error).finally(() => prisma.$disconnect());
