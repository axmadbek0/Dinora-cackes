import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DINORA Clean Production Seed & Zero-Baseline Reset...');

  // 1. Purge all test data (Orders, OrderItems, CustomCakeRequests, Users)
  console.log('🧹 Purging test records and feeds...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customCakeRequest.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      role: { not: UserRole.ADMIN }
    }
  });

  // 2. Ensure Essential System Default Categories exist
  console.log('📂 Seeding essential system categories...');
  const categoriesData = [
    { name: 'Tortlar', slug: 'tortlar' },
    { name: 'Pirojniylar', slug: 'pirojniylar' },
    { name: 'Art Desertlar', slug: 'art-desertlar' },
    { name: 'Korpus Pirojniylar', slug: 'korpus-pirojniylar' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, isActive: true },
      create: { name: cat.name, slug: cat.slug, isActive: true },
    });
  }
  console.log('✅ 4 Standard Categories initialized.');

  // 3. Seed 1 Primary Super Admin Account
  console.log('👤 Seeding 1 Super Admin account...');
  const adminTelegramId = BigInt(998994957806);
  await prisma.user.upsert({
    where: { telegramId: adminTelegramId },
    update: {
      firstName: 'Dinora',
      lastName: 'Axmedova',
      username: 'dinora_admin',
      phone: '+998994957806',
      role: UserRole.ADMIN,
    },
    create: {
      telegramId: adminTelegramId,
      firstName: 'Dinora',
      lastName: 'Axmedova',
      username: 'dinora_admin',
      phone: '+998994957806',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Super Admin account configured.');

  // 4. Seed Default System Settings Record
  console.log('⚙️ Seeding default system settings...');
  const existingSetting = await prisma.systemSetting.findFirst();
  if (!existingSetting) {
    await prisma.systemSetting.create({
      data: {
        isStoreOpen: true,
        deliveryFee: 15000,
        minOrderAmount: 50000,
        workingHoursStart: '09:00',
        workingHoursEnd: '21:00',
        adminPhonePrimary: '+998994957806',
        adminPhoneSecondary: '+998910231524',
        instagramUrl: 'https://www.instagram.com/dinora_shirinliklari/',
        autoAcceptOrders: false,
        maintenanceMode: false,
      },
    });
    console.log('✅ Default SystemSettings created.');
  } else {
    console.log('✅ SystemSettings already initialized.');
  }

  console.log('🎉 Clean zero-data production baseline setup completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
