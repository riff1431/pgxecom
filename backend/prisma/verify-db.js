require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log('=== VERIFICATION REPORT ===');
  console.log('Total products in DB:', products.length);

  const seenUrls = new Map();
  let duplicates = 0;
  let missingFiles = 0;

  for (const p of products) {
    for (const img of p.images) {
      if (seenUrls.has(img.url)) {
        console.error('DUPLICATE:', img.url, 'used in:', p.name, 'AND', seenUrls.get(img.url));
        duplicates++;
      } else {
        seenUrls.set(img.url, p.name);
      }

      if (img.url.startsWith('/uploads/products/')) {
        const filePath = path.join(__dirname, '..', img.url);
        if (!fs.existsSync(filePath)) {
          console.error('MISSING FILE:', filePath);
          missingFiles++;
        } else {
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            console.error('ZERO-BYTE FILE:', filePath);
            missingFiles++;
          }
        }
      }
    }
  }

  console.log('Duplicate image URLs across all products:', duplicates);
  console.log('Missing or zero-byte local image files:', missingFiles);
  console.log('Total unique verified images on disk and in DB:', seenUrls.size);

  const pgxNames = products.filter(p => p.name.includes('PGX') || p.slug.includes('pgx'));
  console.log('Products still containing "PGX":', pgxNames.length);

  const unsplashImgs = products.flatMap(p => p.images).filter(img => img.url.includes('unsplash'));
  console.log('Images still pointing to Unsplash:', unsplashImgs.length);

  console.log('\n--- SAMPLE 10 PRODUCTS VERIFICATION ---');
  for (const p of products.slice(0, 10)) {
    console.log(`[${p.category?.name || 'Category'}] ${p.name}`);
    console.log(`  -> Image: ${p.images[0]?.url}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

verify().catch(console.error);
