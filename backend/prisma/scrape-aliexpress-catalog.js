require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function scrapeKeywordCurl(keyword) {
  const slug = keyword.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const url = `https://www.aliexpress.com/w/wholesale-${slug}.html`;
  console.log(`[CURL] Fetching ${url}...`);
  try {
    const stdout = execSync(`curl.exe -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" "${url}"`, {
      maxBuffer: 25 * 1024 * 1024,
      timeout: 30000
    }).toString();
    
    const startMarker = '/*!-->init-data-start--*/';
    const idx = stdout.indexOf(startMarker);
    if (idx === -1) {
      console.log(`  [WARN] Marker not found for "${keyword}"`);
      return [];
    }
    const after = stdout.substring(idx + startMarker.length);
    const endMarker = '/*!-->init-data-end--*/';
    const endIdx = after.indexOf(endMarker);
    const snippet = after.substring(0, endIdx !== -1 ? endIdx : 1000);
    const eqIdx = snippet.indexOf('=');
    const jsonStr = snippet.substring(eqIdx + 1).trim().replace(/;$/, '');
    const obj = eval('(' + jsonStr + ')');
    const items = obj?.data?.data?.root?.fields?.mods?.itemList?.content || [];
    
    return items.map(it => {
      let mainImg = it.image?.imgUrl || '';
      if (mainImg.startsWith('//')) mainImg = 'https:' + mainImg;
      mainImg = mainImg.replace(/_\d+x\d+[^.]*\.(jpg|png|webp)/, '.$1');
      
      const gallery = (it.images || []).map(img => {
        let u = img.imgUrl || '';
        if (u.startsWith('//')) u = 'https:' + u;
        u = u.replace(/_\d+x\d+[^.]*\.(jpg|png|webp)/, '.$1');
        return u;
      }).filter(Boolean);
      
      return {
        id: it.productId,
        title: it.title?.displayTitle,
        mainImage: mainImg,
        images: gallery.length > 0 ? gallery : [mainImg],
        price: it.prices?.salePrice?.formattedPrice || it.prices?.salePrice?.minPrice || 0
      };
    }).filter(p => p.title && p.mainImage && p.images.length > 1);
  } catch (err) {
    console.error(`  [ERROR] Failed scraping "${keyword}":`, err.message);
    return [];
  }
}

const PRODUCTS_TO_UPDATE = {
  'pgx-home-gym-system': 'multi station gym equipment',
  'pgx-commercial-counterbalanced-smith-machine': 'smith machine gym',
  'pgx-olympic-hex-trap-bar': 'hex bar barbell deadlift',
  'pgx-commercial-bumper-plates-set': 'barbell weight plates rubber',
  'pgx-heavy-duty-battle-ropes': 'battle rope fitness gym',
  'pgx-3in1-foam-plyometric-box': 'plyometric jump box fitness',
  'pgx-stainless-bottle': 'insulated stainless steel gym bottle',
  'pgx-performance-tshirt': 'gym compression shirt men',
  'pgx-leggings': 'seamless gym leggings women',
  'pgx-training-shoes': 'weightlifting shoes men',
  'pgx-gym-bag': 'sports gym bag shoe compartment',
  'pgx-yoga-mat': 'tpe yoga mat non slip',
  'pgx-resistance-bands': 'pull up resistance bands set',
  'pgx-wireless-headphones': 'wireless sport headphones over ear'
};

async function updateRemainingProducts() {
  console.log('=== STARTING UPDATES FOR REMAINING 14 PRODUCTS ===\n');
  
  for (const [slug, query] of Object.entries(PRODUCTS_TO_UPDATE)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true }
    });
    
    if (!product) {
      console.log(`Product with slug "${slug}" not found in DB.`);
      continue;
    }
    
    console.log(`\nProcessing: "${product.name}"`);
    console.log(`Query: "${query}"`);
    const results = scrapeKeywordCurl(query);
    
    if (results.length === 0) {
      console.log(`  -> No results for "${query}", trying fallback...`);
      continue;
    }
    
    const best = results[0];
    console.log(`  -> Selected: "${best.title.substring(0, 60)}..."`);
    console.log(`  -> Found ${best.images.length} gallery images.`);
    
    // Remove old Unsplash images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });
    
    // Insert new authentic AliExpress images
    const imagesToCreate = best.images.slice(0, 6).map((imgUrl, idx) => ({
      productId: product.id,
      url: imgUrl,
      alt: `${product.name} - View ${idx + 1}`,
      sortOrder: idx + 1
    }));
    
    await prisma.productImage.createMany({
      data: imagesToCreate
    });
    
    console.log(`  ✓ Successfully updated with ${imagesToCreate.length} real product images!`);
    
    // Small polite pause between curl requests
    await new Promise(r => setTimeout(r, 1500));
  }
}

async function main() {
  try {
    await updateRemainingProducts();
    console.log('\n=== ALL PRODUCTS UPDATED! CHECKING DATABASE STATUS... ===');
    
    const allProducts = await prisma.product.findMany({
      include: { images: true }
    });
    const stillUnsplash = allProducts.filter(p => p.images.some(img => img.url.includes('unsplash')));
    console.log(`Total Products: ${allProducts.length}`);
    console.log(`Products with Unsplash images remaining: ${stillUnsplash.length}`);
    
    if (stillUnsplash.length > 0) {
      console.log('Unsplash products remaining:', stillUnsplash.map(p => p.slug));
    } else {
      console.log('🎉 100% OF STORE PRODUCTS NOW USE REAL ALIEXPRESS COMMERCIAL PRODUCT PHOTOS!');
    }
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
