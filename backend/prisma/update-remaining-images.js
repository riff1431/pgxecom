require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function scrapeKeyword(keyword) {
  const slug = keyword.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const url = `https://www.aliexpress.com/w/wholesale-${slug}.html`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      }
    });
    const html = await res.text();
    const startMarker = '/*!-->init-data-start--*/';
    const idx = html.indexOf(startMarker);
    if (idx === -1) return [];
    const after = html.substring(idx + startMarker.length);
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
        price: it.prices?.salePrice?.formattedPrice || it.prices?.salePrice?.minPrice || 0,
      };
    }).filter(p => p.title && p.mainImage && p.images.length > 1);
  } catch (err) {
    console.error(`Failed to scrape "${keyword}":`, err.message);
    return [];
  }
}

// Concise 2-3 word queries for AliExpress wholesale search
const REMAINING_PRODUCT_MAP = {
  'pgx-olympic-hex-trap-bar': 'hex trap bar',
  'pgx-commercial-bumper-plates-set': 'bumper plates',
  'pgx-home-gym-system': 'home gym smith machine',
  'pgx-commercial-counterbalanced-smith-machine': 'smith machine gym',
  'pgx-performance-tshirt': 'gym compression shirt',
  'pgx-leggings': 'gym leggings women',
  'pgx-training-shoes': 'weightlifting shoes gym',
  'pgx-gym-bag': 'gym duffle bag',
  'pgx-stainless-bottle': 'gym water bottle metal',
  'pgx-yoga-mat': 'thick yoga mat',
  'pgx-resistance-bands': 'resistance bands gym',
  'pgx-wireless-headphones': 'sports headphones wireless',
  'pgx-heavy-duty-battle-ropes': 'battle rope gym',
  'pgx-3in1-foam-plyometric-box': 'plyometric box'
};

async function updateRemaining() {
  console.log('--- Updating remaining products with concise AliExpress queries ---');
  for (const [slug, query] of Object.entries(REMAINING_PRODUCT_MAP)) {
    const product = await prisma.product.findUnique({
      where: { slug }
    });
    if (!product) {
      console.log(`Product "${slug}" not found.`);
      continue;
    }
    
    console.log(`Scraping for "${product.name}" [${query}]...`);
    const results = await scrapeKeyword(query);
    if (!results || results.length === 0) {
      console.log(`  No results for "${query}"`);
      continue;
    }
    
    const best = results[0];
    console.log(`  -> Best: "${best.title.substring(0, 50)}..."`);
    console.log(`  -> Images count: ${best.images.length}`);
    
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });
    
    const imagesToCreate = best.images.slice(0, 6).map((imgUrl, idx) => ({
      productId: product.id,
      url: imgUrl,
      alt: `${product.name} - Official Product View ${idx + 1}`,
      sortOrder: idx + 1
    }));
    
    await prisma.productImage.createMany({
      data: imagesToCreate
    });
    
    console.log(`  ✓ Updated ${product.name} with ${imagesToCreate.length} real product images.`);
  }
}

async function run() {
  try {
    await updateRemaining();
    console.log('\n--- ALL REMAINING PRODUCTS UPDATED! ---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
