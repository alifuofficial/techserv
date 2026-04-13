const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'logo_url' }
  });
  console.log('Current logo_url:', setting);
}

main().catch(console.error).finally(() => prisma.$disconnect());
