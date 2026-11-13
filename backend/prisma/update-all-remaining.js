require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SUBDOMAINS = ['es', 'fr', 'de', 'it'];
let subIdx = 0;

function scrapeAliExpress(keyword) {
  const subdomain = SUBDOMAINS[subIdx % SUBDOMAINS.length];
  subIdx++;
  
  const slug = keyword.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const url = `https://${subdomain}.aliexpress.com/w/wholesale-${slug}.html`;
  console.log(`[Scrape] (${subdomain}) ${url}`);
  
  try {
    const stdout = execSync(`curl.exe --compressed --max-time 12 -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" "${url}"`, {
      maxBuffer: 25 * 1024 * 1024
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
        let u = (typeof img === 'string') ? img : (img.imgUrl || '');
        if (u.startsWith('//')) u = 'https:' + u;
        u = u.replace(/_\d+x\d+[^.]*\.(jpg|png|webp)/, '.$1');
        return u;
      }).filter(Boolean);
      
      return {
        id: it.productId,
        title: it.title?.displayTitle,
        mainImage: mainImg,
        images: gallery.length > 0 ? gallery : [mainImg]
      };
    }).filter(p => p.title && p.mainImage && p.images.length > 0);
  } catch (err) {
    console.error(`  [ERROR] Scraping failed for "${keyword}":`, err.message);
    return [];
  }
}

const REMAINING_ITEMS = {
  'pgx-home-gym-system': 'multi station gym',
  'pgx-commercial-counterbalanced-smith-machine': 'smith machine gym',
  'pgx-olympic-hex-trap-bar': 'hex trap bar',
  'pgx-commercial-bumper-plates-set': 'bumper plates gym',
  'pgx-heavy-duty-battle-ropes': 'battle rope gym',
  'pgx-3in1-foam-plyometric-box': 'plyometric jump box',
  'pgx-stainless-bottle': 'insulated sports bottle',
  'pgx-performance-tshirt': 'gym compression shirt men',
  'pgx-leggings': 'seamless yoga leggings gym',
  'pgx-training-shoes': 'weightlifting shoes men',
  'pgx-gym-bag': 'gym duffle bag',
  'pgx-yoga-mat': 'tpe yoga mat',
  'pgx-resistance-bands': 'resistance bands gym',
  'pgx-wireless-headphones': 'sports headphones wireless'
};

async function updateAll() {
  console.log('=== UPDATING ALL REMAINING 14 PRODUCTS WITH REAL ALIEXPRESS PHOTOS ===\n');
  
  for (const [slug, query] of Object.entries(REMAINING_ITEMS)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true }
    });
    
    if (!product) {
      console.log(`Product "${slug}" not found.`);
      continue;
    }
    
    console.log(`\nMatching product: "${product.name}"`);
    const results = scrapeAliExpress(query);
    
    if (!results || results.length === 0) {
      console.log(`  -> No results for "${query}"`);
      continue;
    }
    
    const best = results[0];
    console.log(`  -> Selected: "${best.title.substring(0, 60)}..."`);
    console.log(`  -> Gallery images count: ${best.images.length}`);
    
    // Delete existing Unsplash images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });
    
    // Insert new authentic AliExpress images
    const imagesToCreate = best.images.slice(0, 6).map((imgUrl, idx) => ({
      productId: product.id,
      url: imgUrl,
      alt: `${product.name} - Official Product View ${idx + 1}`,
      sortOrder: idx + 1
    }));
    
    await prisma.productImage.createMany({
      data: imagesToCreate
    });
    
    console.log(`  ✓ Successfully updated with ${imagesToCreate.length} real product images!`);
    
    // Polite 1-second pause
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function run() {
  try {
    await updateAll();
    
    console.log('\n=== FINAL VERIFICATION ACROSS ENTIRE PRODUCT CATALOG ===');
    const allProducts = await prisma.product.findMany({
      include: { images: true }
    });
    
    const unsplashRemaining = allProducts.filter(p => p.images.some(img => img.url.includes('unsplash')));
    console.log(`Total Products in Store: ${allProducts.length}`);
    console.log(`Products with Unsplash images remaining: ${unsplashRemaining.length}`);
    
    if (unsplashRemaining.length === 0) {
      console.log('🎉 SUCCESS! 100% OF STORE PRODUCTS NOW USE REAL ALIEXPRESS COMMERCIAL PRODUCT PHOTOS!');
    } else {
      console.log('Remaining Unsplash products:', unsplashRemaining.map(p => p.slug));
    }
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
