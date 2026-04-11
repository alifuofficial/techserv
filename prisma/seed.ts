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

  // ── Subscription Service: Telegram Premium ──
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
      pricingType: "subscription",
      pricingTiers: JSON.stringify([
        { label: "3 Months", duration: "3months", price: 15.99 },
        { label: "6 Months", duration: "6months", price: 28.99, popular: true },
        { label: "12 Months", duration: "1year", price: 49.99 },
      ]),
      isActive: true,
      sortOrder: 1,
    },
  });
  console.log("✅ Service created:", telegramPremium.title);

  // ── One-Time Service: Telegram Bot Development ──
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
      pricingType: "one_time",
      pricingTiers: JSON.stringify([
        { label: "Basic Bot", duration: "one_time", price: 199.99, description: "Simple bot with basic features" },
        { label: "Pro Bot", duration: "one_time", price: 499.99, popular: true, description: "Advanced bot with integrations" },
        { label: "Enterprise Bot", duration: "one_time", price: 999.99, description: "Full custom solution with support" },
      ]),
      isActive: true,
      sortOrder: 2,
    },
  });
  console.log("✅ Service created:", botDevelopment.title);

  // ── One-Time Service: Web Development ──
  const webDevelopment = await db.service.upsert({
    where: { slug: "web-development" },
    update: {},
    create: {
      title: "Web Development",
      slug: "web-development",
      shortDescription:
        "Professional website and web application development. From landing pages to full-stack applications.",
      longDescription:
        "We create modern, responsive websites and web applications using the latest technologies. Whether you need a simple landing page, a business website, an e-commerce store, or a complex web application — we deliver high-quality solutions that look great and perform exceptionally. All projects include responsive design, SEO optimization, and deployment support.",
      features:
        "Responsive design,Modern UI/UX,SEO optimization,Performance optimized,Mobile-first approach,Custom functionality,E-commerce integration,CMS integration,API development,Deployment & hosting",
      icon: "Globe",
      pricingType: "one_time",
      pricingTiers: JSON.stringify([
        { label: "Landing Page", duration: "one_time", price: 299.99, description: "Single-page responsive site" },
        { label: "Business Website", duration: "one_time", price: 799.99, popular: true, description: "Multi-page business site" },
        { label: "Web Application", duration: "one_time", price: 2499.99, description: "Full-stack web application" },
      ]),
      isActive: true,
      sortOrder: 3,
    },
  });
  console.log("✅ Service created:", webDevelopment.title);

  // ── Subscription Service: Telegram Channel Promotion ──
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
      pricingType: "subscription",
      pricingTiers: JSON.stringify([
        { label: "1 Month", duration: "1month", price: 39.99 },
        { label: "3 Months", duration: "3months", price: 99.99, popular: true },
        { label: "6 Months", duration: "6months", price: 169.99 },
      ]),
      isActive: true,
      sortOrder: 4,
    },
  });
  console.log("✅ Service created:", channelPromotion.title);

  // ── One-Time Service: Telegram Account Services ──
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
      pricingType: "one_time",
      pricingTiers: JSON.stringify([
        { label: "Standard", duration: "one_time", price: 24.99, description: "Basic account service" },
        { label: "Premium", duration: "one_time", price: 49.99, popular: true, description: "Full security & verification" },
      ]),
      isActive: true,
      sortOrder: 5,
    },
  });
  console.log("✅ Service created:", accountVerification.title);

  // ── One-Time Service: Mobile App Development ──
  const mobileDev = await db.service.upsert({
    where: { slug: "mobile-app-development" },
    update: {},
    create: {
      title: "Mobile App Development",
      slug: "mobile-app-development",
      shortDescription:
        "Cross-platform mobile applications for Android and iOS. Built with modern frameworks for performance.",
      longDescription:
        "We develop high-quality cross-platform mobile applications that run smoothly on both Android and iOS. From concept to deployment, we handle the entire development lifecycle. Our apps are built with performance, scalability, and user experience in mind.",
      features:
        "Cross-platform (Android & iOS),Modern UI design,Performance optimized,Push notifications,Offline support,API integration,App store deployment,Maintenance & updates",
      icon: "Smartphone",
      pricingType: "one_time",
      pricingTiers: JSON.stringify([
        { label: "Simple App", duration: "one_time", price: 1499.99, description: "Basic functionality app" },
        { label: "Full App", duration: "one_time", price: 3999.99, popular: true, description: "Feature-rich application" },
      ]),
      isActive: true,
      sortOrder: 6,
    },
  });
  console.log("✅ Service created:", mobileDev.title);

  // Create sample orders (use upsert with fixed IDs for idempotency)
  const sampleOrder = await db.order.upsert({
    where: { id: "order_seed_001" },
    update: {},
    create: {
      id: "order_seed_001",
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

  const completedOrder = await db.order.upsert({
    where: { id: "order_seed_002" },
    update: {},
    create: {
      id: "order_seed_002",
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

  const botOrder = await db.order.upsert({
    where: { id: "order_seed_003" },
    update: {},
    create: {
      id: "order_seed_003",
      userId: testUser.id,
      serviceId: botDevelopment.id,
      status: "approved",
      duration: "one_time",
      amount: 499.99,
      telegramUsername: "@testuser",
      screenshot: "bot_payment.jpg",
      adminNote: "Requirements collected. Development in progress.",
    },
  });
  console.log("✅ Bot order created:", botOrder.id);

  // ── Payment Methods ──
  const telebirr = await db.paymentMethod.upsert({
    where: { id: "pm_telebirr_001" },
    update: {},
    create: {
      id: "pm_telebirr_001",
      name: "Telebirr",
      type: "mobile_money",
      isActive: true,
      sortOrder: 1,
      details: JSON.stringify({ accountName: "TechServ", accountNumber: "0911000000" }),
      instructions: "Open Telebirr app → Send Money → Enter the number above → Send the exact amount → Take a screenshot",
    },
  });
  console.log("✅ Payment method created:", telebirr.name);

  const cbeBirr = await db.paymentMethod.upsert({
    where: { id: "pm_cbe_001" },
    update: {},
    create: {
      id: "pm_cbe_001",
      name: "CBE Birr (Commercial Bank of Ethiopia)",
      type: "bank",
      isActive: true,
      sortOrder: 2,
      details: JSON.stringify({ bankName: "Commercial Bank of Ethiopia", accountName: "TechServ", accountNumber: "1000123456789", branch: "Bole Branch" }),
      instructions: "Open CBE Birr app or visit any CBE branch → Transfer to the account above → Send the exact amount → Take a screenshot",
    },
  });
  console.log("✅ Payment method created:", cbeBirr.name);

  const awashBank = await db.paymentMethod.upsert({
    where: { id: "pm_awash_001" },
    update: {},
    create: {
      id: "pm_awash_001",
      name: "Awash Bank",
      type: "bank",
      isActive: true,
      sortOrder: 3,
      details: JSON.stringify({ bankName: "Awash International Bank", accountName: "TechServ", accountNumber: "0987654321", branch: "Mexico Branch" }),
      instructions: "Transfer to the account above via Awash Bank mobile app or branch → Send the exact amount → Take a screenshot of the receipt",
    },
  });
  console.log("✅ Payment method created:", awashBank.name);

  const usdtTrc20 = await db.paymentMethod.upsert({
    where: { id: "pm_usdt_001" },
    update: {},
    create: {
      id: "pm_usdt_001",
      name: "USDT (TRC20)",
      type: "crypto",
      isActive: true,
      sortOrder: 4,
      details: JSON.stringify({ network: "TRC20 (Tron)", walletAddress: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }),
      instructions: "Send USDT via TRC20 network to the wallet address above. Minimum transaction: $5. Take a screenshot after sending.",
    },
  });
  console.log("✅ Payment method created:", usdtTrc20.name);

  // ── Invoices for sample orders ──
  // Use fixed invoice numbers so upsert works idempotently across re-seeds
  const invNum1 = "INV-SEED-0001";
  const invNum2 = "INV-SEED-0002";
  const invNum3 = "INV-SEED-0003";

  await db.invoice.upsert({
    where: { invoiceNumber: invNum1 },
    update: { orderId: sampleOrder.id, userId: testUser.id, amount: sampleOrder.amount, status: "pending", paymentMethodId: telebirr.id },
    create: {
      id: "inv_sample_001",
      invoiceNumber: invNum1,
      orderId: sampleOrder.id,
      userId: testUser.id,
      amount: sampleOrder.amount,
      status: "pending",
      paymentMethodId: telebirr.id,
    },
  });
  console.log("✅ Invoice created for sample order");

  await db.invoice.upsert({
    where: { invoiceNumber: invNum2 },
    update: { orderId: completedOrder.id, userId: testUser.id, amount: completedOrder.amount, status: "paid", paymentMethodId: cbeBirr.id },
    create: {
      id: "inv_sample_002",
      invoiceNumber: invNum2,
      orderId: completedOrder.id,
      userId: testUser.id,
      amount: completedOrder.amount,
      status: "paid",
      paymentMethodId: cbeBirr.id,
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Invoice created for completed order");

  await db.invoice.upsert({
    where: { invoiceNumber: invNum3 },
    update: { orderId: botOrder.id, userId: testUser.id, amount: botOrder.amount, status: "pending" },
    create: {
      id: "inv_sample_003",
      invoiceNumber: invNum3,
      orderId: botOrder.id,
      userId: testUser.id,
      amount: botOrder.amount,
      status: "pending",
    },
  });
  console.log("✅ Invoice created for bot order");

  // Seed system settings
  const defaultSettings = [
    { key: "site_name", value: "TechServ", label: "Site Name", type: "text", group: "general" },
    { key: "site_description", value: "Premium Tech Services", label: "Site Description", type: "textarea", group: "general" },
    { key: "site_email", value: "support@techserv.com", label: "Support Email", type: "text", group: "general" },
    { key: "site_phone", value: "+251-XXX-XXX-XXXX", label: "Support Phone", type: "text", group: "general" },
    { key: "currency", value: "USD", label: "Currency", type: "select", group: "general" },
    { key: "currency_symbol", value: "$", label: "Currency Symbol", type: "text", group: "general" },
    { key: "telegram_channel", value: "@techserv", label: "Telegram Channel", type: "text", group: "general" },
    { key: "telegram_bot_token", value: "", label: "Bot Token", type: "text", group: "telegram" },
    { key: "telegram_bot_username", value: "", label: "Bot Username", type: "text", group: "telegram" },
    { key: "telegram_enabled", value: "false", label: "Enable Telegram Login", type: "toggle", group: "telegram" },
    { key: "telegram_notifications", value: "false", label: "Enable Telegram Notifications", type: "toggle", group: "telegram" },
    { key: "maintenance_mode", value: "false", label: "Maintenance Mode", type: "toggle", group: "system" },
    { key: "registration_enabled", value: "true", label: "Registration Enabled", type: "toggle", group: "features" },
    { key: "tier_benefits_standard", value: "Standard Account Benefits:\n- Basic support\n- Standard priority", label: "Standard Tier Benefits", type: "textarea", group: "features" },
    { key: "tier_benefits_gold", value: "Gold Account Benefits:\n- Priority support\n- Faster fulfillment\n- Exclusive discounts", label: "Gold Tier Benefits", type: "textarea", group: "features" },
    { key: "referral_benefits", value: "Referral Program:\n- Share with friends\n- Earn 10% credit\n- No limit on referrals", label: "Referral Program Benefits", type: "textarea", group: "features" },
    { key: "auto_approve_orders", value: "false", label: "Auto Approve Orders", type: "toggle", group: "orders" },
    { key: "order_confirmation_message", value: "Thank you for your order! We will process it shortly.", label: "Order Confirmation Message", type: "textarea", group: "orders" },
    { key: "welcome_message", value: "Welcome to TechServ! Browse our services and get started.", label: "Welcome Message", type: "textarea", group: "general" },
  ];

  for (const setting of defaultSettings) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ System settings seeded");

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
