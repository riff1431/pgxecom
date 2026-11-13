require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'products';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const productsDir = path.join(__dirname, '../uploads/products');

async function uploadFile(fileName) {
  const filePath = path.join(productsDir, fileName);
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;
  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload ${fileName}: ${res.status} ${errText}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
  return publicUrl;
}

async function main() {
  console.log('=== UPLOADING ALL IMAGES TO SUPABASE STORAGE ===');
  const files = fs.readdirSync(productsDir);
  console.log(`Found ${files.length} image files in ${productsDir}`);

  const uploadedUrls = new Map();

  for (const file of files) {
    const stat = fs.statSync(path.join(productsDir, file));
    if (stat.isDirectory() || stat.size === 0) continue;

    try {
      const publicUrl = await uploadFile(file);
      uploadedUrls.set(file, publicUrl);
      console.log(`✓ Uploaded ${file} -> ${publicUrl}`);
    } catch (e) {
      console.error(`✗ Error uploading ${file}:`, e.message);
    }
  }

  console.log('\n=== UPDATING DATABASE PRODUCT IMAGES TO SUPABASE CDN URLS ===');
  const allImages = await prisma.productImage.findMany({
    include: { product: true },
  });

  console.log(`Found ${allImages.length} images in database`);

  let updatedCount = 0;
  for (const img of allImages) {
    // Current url might be /uploads/products/xyz.jpg or relative
    const fileName = path.basename(img.url);
    if (uploadedUrls.has(fileName)) {
      const newUrl = uploadedUrls.get(fileName);
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: newUrl },
      });
      console.log(`Updated [${img.product?.name?.substring(0, 30)}...] -> ${newUrl}`);
      updatedCount++;
    } else {
      console.warn(`File not found for ${img.url}`);
    }
  }

  console.log(`\nUpdated ${updatedCount} product image records in remote database!`);

  console.log('\n=== HTTP VERIFICATION OF ALL 34 PRODUCTS ===');
  const products = await prisma.product.findMany({
    include: { images: true },
  });

  let okCount = 0;
  let failCount = 0;

  for (const p of products) {
    const imgUrl = p.images[0]?.url;
    if (!imgUrl) {
      console.error(`No image for product: ${p.name}`);
      failCount++;
      continue;
    }

    try {
      const res = await fetch(imgUrl, { method: 'HEAD' });
      if (res.ok) {
        okCount++;
      } else {
        console.error(`HTTP FAIL (${res.status}) for ${p.name}: ${imgUrl}`);
        failCount++;
      }
    } catch (err) {
      console.error(`NETWORK FAIL for ${p.name}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\nVerification Summary: ${okCount} OK, ${failCount} FAILED.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
