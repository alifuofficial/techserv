import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function cleanup() {
  console.log("🧹 Cleaning up demo data...\n");

  // Delete demo orders (those with seed IDs)
  const seedOrderIds = ["order_seed_001", "order_seed_002", "order_seed_003"];
  let deletedOrders = 0;
  
  for (const id of seedOrderIds) {
    try {
      await db.order.delete({ where: { id } });
      deletedOrders++;
    } catch {
      // Order doesn't exist, skip
    }
  }
  console.log(`✅ Deleted ${deletedOrders} demo orders`);

  // Delete demo invoices (those with seed invoice numbers)
  const seedInvoiceNums = ["INV-SEED-0001", "INV-SEED-0002", "INV-SEED-0003"];
  let deletedInvoices = 0;
  
  for (const invoiceNumber of seedInvoiceNums) {
    try {
      await db.invoice.delete({ where: { invoiceNumber } });
      deletedInvoices++;
    } catch {
      // Invoice doesn't exist, skip
    }
  }
  console.log(`✅ Deleted ${deletedInvoices} demo invoices`);

  // Delete test user if exists
  try {
    const testUser = await db.user.findUnique({ where: { email: "user@test.com" } });
    if (testUser) {
      // First delete all orders and invoices for this user
      await db.order.deleteMany({ where: { userId: testUser.id } });
      await db.invoice.deleteMany({ where: { userId: testUser.id } });
      await db.user.delete({ where: { id: testUser.id } });
      console.log("✅ Deleted test user (user@test.com)");
    }
  } catch {
    // User doesn't exist, skip
  }

  console.log("\n✨ Cleanup complete!");
}

cleanup()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });