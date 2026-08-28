/**
 * One-time Database Image URL Sanitizer
 * 
 * Fixes products where imageUrl was accidentally stored as a full localhost URL
 * (e.g. "http://localhost:5000/uploads/products/xyz.webp")
 * and normalizes them to the correct relative path standard:
 * (e.g. "uploads/products/xyz.webp")
 * 
 * Run with: npx tsx scripts/fix-image-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

async function main() {
  console.log('🔍 Scanning products for localhost image URLs...\n');

  const products = await prisma.product.findMany({
    select: { id: true, name: true, imageUrl: true },
  });

  let fixedCount = 0;
  const toFix: { id: string; oldUrl: string; newUrl: string }[] = [];

  for (const product of products) {
    if (product.imageUrl && LOCALHOST_PATTERN.test(product.imageUrl)) {
      const relativePath = product.imageUrl.replace(LOCALHOST_PATTERN, '');
      toFix.push({ id: product.id, oldUrl: product.imageUrl, newUrl: relativePath });
    }
  }

  if (toFix.length === 0) {
    console.log('✅ No localhost URLs found in database. Nothing to fix!');
    return;
  }

  console.log(`⚠️  Found ${toFix.length} product(s) with localhost URLs. Fixing...\n`);

  for (const item of toFix) {
    console.log(`  [${item.id}]\n    OLD: ${item.oldUrl}\n    NEW: ${item.newUrl}\n`);
    await prisma.product.update({
      where: { id: item.id },
      data: { imageUrl: item.newUrl },
    });
    fixedCount++;
  }

  // Also fix orders with localhost receipt URLs
  console.log('\n🔍 Scanning orders for localhost receipt URLs...\n');

  const orders = await prisma.order.findMany({
    select: { id: true, orderNumber: true, paymentReceiptUrl: true },
    where: { paymentReceiptUrl: { not: null } },
  });

  let orderFixCount = 0;
  for (const order of orders) {
    if (order.paymentReceiptUrl && LOCALHOST_PATTERN.test(order.paymentReceiptUrl)) {
      const relativePath = order.paymentReceiptUrl.replace(LOCALHOST_PATTERN, '');
      console.log(`  Order #${order.orderNumber}: ${order.paymentReceiptUrl} → ${relativePath}`);
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentReceiptUrl: relativePath },
      });
      orderFixCount++;
    }
  }

  console.log(`\n✅ Done! Fixed ${fixedCount} product image URL(s) and ${orderFixCount} order receipt URL(s).`);
}

main()
  .catch((e) => {
    console.error('❌ Error running fix script:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
