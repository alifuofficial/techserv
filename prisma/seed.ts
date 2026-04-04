import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@techserv.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@techserv.com",
      password: adminPassword,
      role: "admin",
      phone: "+251911000000",
      telegram: "@techserv_admin",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create test user
  const userPassword = await bcrypt.hash("user123", 12);
  const testUser = await db.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@test.com",
      password: userPassword,
      role: "user",
      phone: "+251922000000",
      telegram: "@testuser",
    },
  });
  console.log("✅ Test user created:", testUser.email);

  // Create services
  const telegramPremium = await db.service.upsert({
    where: { slug: "telegram-premium" },
    update: {},
    create: {
      title: "Telegram Premium",
      slug: "telegram-premium",
      shortDescription:
        "Unlock all Telegram Premium features including boosted channels, custom emoji, faster downloads, and more.",
      longDescription:
        "Get the full Telegram Premium experience with all exclusive features. Enjoy boosted channels and groups (up to 4000 members), exclusive stickers and emoji, voice-to-text conversion, faster download speeds, premium badge on your profile, and much more. Our team will activate your premium subscription quickly after verifying your payment.",
      features:
        "Boosted channels up to 4000 members,Exclusive stickers and emoji,Voice-to-text for messages,4GB file upload limit,Faster download speeds,Premium profile badge,Custom chat backgrounds,Animated profile pictures,Unique emoji reactions,Advanced chat management",
      icon: "Crown",
      price3m: 15.99,
      price6m: 28.99,
      price12m: 49.99,
      isActive: true,
      sortOrder: 1,
    },
  });
  console.log("✅ Service created:", telegramPremium.title);

  const botDevelopment = await db.service.upsert({
    where: { slug: "telegram-bot-development" },
    update: {},
    create: {
      title: "Telegram Bot Development",
      slug: "telegram-bot-development",
      shortDescription:
        "Custom Telegram bots for your business, community, or personal use. From simple bots to complex automated systems.",
      longDescription:
        "We build professional Telegram bots tailored to your specific needs. Whether you need a customer support bot, an automated trading bot, a community management tool, or any custom solution — our experienced developers deliver high-quality, reliable bots that work 24/7. Each bot comes with documentation and post-launch support.",
      features:
        "Custom bot development,API integration,Payment processing bots,Community management bots,Automated notifications,Database integration,Multi-language support,24/7 bot hosting,Post-launch support,Full documentation",
      icon: "Bot",
      price3m: 99.99,
      price6m: 179.99,
      price12m: 299.99,
      isActive: true,
      sortOrder: 2,
    },
  });
  console.log("✅ Service created:", botDevelopment.title);

  const channelPromotion = await db.service.upsert({
    where: { slug: "telegram-channel-promotion" },
    update: {},
    create: {
      title: "Telegram Channel Promotion",
      slug: "telegram-channel-promotion",
      shortDescription:
        "Grow your Telegram channel with real, active members. Safe promotion methods with guaranteed results.",
      longDescription:
        "Boost your Telegram channel's growth with our proven promotion strategies. We use only safe, organic methods to attract real, active subscribers to your channel. No bots, no fake accounts — just genuine growth that lasts. Our packages are designed to fit channels of all sizes.",
      features:
        "Real active subscribers,Organic growth methods,No bots or fake accounts,Targeted by niche,Gradual safe delivery,Engagement boost,Analytics dashboard,Retry guarantee",
      icon: "TrendingUp",
      price3m: 39.99,
      price6m: 69.99,
      price12m: 119.99,
      isActive: true,
      sortOrder: 3,
    },
  });
  console.log("✅ Service created:", channelPromotion.title);

  const accountVerification = await db.service.upsert({
    where: { slug: "telegram-account-verification" },
    update: {},
    create: {
      title: "Telegram Account Services",
      slug: "telegram-account-verification",
      shortDescription:
        "Professional Telegram account services including verification assistance, account recovery, and security setup.",
      longDescription:
        "Get professional help with your Telegram account. Whether you need assistance with verification, account recovery, or setting up advanced security features — our team of Telegram experts is here to help. We provide reliable, confidential services with quick turnaround times.",
      features:
        "Account verification help,Account recovery assistance,Two-factor auth setup,Security audit,Privacy configuration,Spam protection setup,Channel verification,Group management setup",
      icon: "ShieldCheck",
      price3m: 24.99,
      price6m: 44.99,
      price12m: 79.99,
      isActive: true,
      sortOrder: 4,
    },
  });
  console.log("✅ Service created:", accountVerification.title);

  // Create a sample order for testing
  const sampleOrder = await db.order.create({
    data: {
      userId: testUser.id,
      serviceId: telegramPremium.id,
      status: "pending",
      duration: "6months",
      amount: 28.99,
      telegramUsername: "@testuser",
      screenshot: "payment_proof.jpg",
    },
  });
  console.log("✅ Sample order created:", sampleOrder.id);

  const completedOrder = await db.order.create({
    data: {
      userId: testUser.id,
      serviceId: telegramPremium.id,
      status: "completed",
      duration: "3months",
      amount: 15.99,
      telegramUsername: "@testuser",
      screenshot: "payment_proof_2.jpg",
      adminNote: "Premium activated successfully. Enjoy!",
    },
  });
  console.log("✅ Completed sample order created:", completedOrder.id);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test Accounts:");
  console.log("   Admin: admin@techserv.com / admin123");
  console.log("   User:  user@test.com / user123");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
