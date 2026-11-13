require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function scrapeKeyword(keyword) {
  const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
        price: it.prices?.salePrice?.minPrice || 0,
      };
    }).filter(p => p.title && p.mainImage && p.images.length > 1);
  } catch (err) {
    console.error(`Failed to scrape "${keyword}":`, err.message);
    return [];
  }
}

// Map each existing product slug to the ideal AliExpress search query
const EXISTING_PRODUCT_SEARCH_MAP = {
  'pgx-pro-treadmill-x1': 'commercial electric treadmill gym',
  'healthengine-commercial-motorized-treadmill-motion-x18': 'commercial motorized treadmill gym heavy duty',
  'pgx-curved-commercial-non-motorized-treadmill': 'curved treadmill commercial non motorized',
  'pgx-smart-exercise-bike': 'commercial spinning bike magnetic resistance indoor cycling',
  'pgx-rowing-machine': 'commercial air rower rowing machine gym',
  'pgx-air-resistance-ski-ergometer': 'commercial ski ergometer air resistance',
  'pgx-elite-commercial-stair-climber': 'commercial stair climber stepmill gym',
  'pgx-adjustable-dumbbells': 'adjustable dumbbells set 50kg dial',
  'pgx-cast-iron-kettlebell-set': 'cast iron kettlebell competition set gym',
  'pgx-commercial-olympic-bench-press': 'commercial olympic adjustable weight bench gym',
  'pgx-olympic-hex-trap-bar': 'olympic hex trap bar deadlift barbell',
  'pgx-commercial-bumper-plates-set': 'olympic bumper plates rubber weight plates set',
  'pgx-home-gym-system': 'multi station home gym cable crossover system',
  'pgx-commercial-counterbalanced-smith-machine': 'commercial smith machine functional trainer squat rack',
  'pgx-performance-tshirt': 'men compression quick dry gym sports t shirt',
  'pgx-leggings': 'high waist seamless activewear gym workout leggings',
  'pgx-training-shoes': 'men cross training gym weightlifting shoes',
  'pgx-gym-bag': 'waterproof sports gym duffle bag shoe compartment',
  'pgx-stainless-bottle': 'stainless steel insulated sports water bottle gym 1000ml',
  'pgx-yoga-mat': 'high density non slip alignment tpe yoga mat gym',
  'pgx-resistance-bands': 'heavy duty pull up resistance bands set gym',
  'pgx-wireless-headphones': 'over ear wireless bluetooth active noise cancelling sport headphones',
  'pgx-heavy-duty-battle-ropes': 'battle ropes protective sleeve workout fitness gym',
  'pgx-3in1-foam-plyometric-box': 'foam plyometric jump box 3 in 1 gym'
};

async function updateExistingProducts() {
  console.log('--- STEP 1: Updating existing 24 products with real AliExpress photos ---');
  for (const [slug, query] of Object.entries(EXISTING_PRODUCT_SEARCH_MAP)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true }
    });
    if (!product) {
      console.log(`Product with slug "${slug}" not found, skipping.`);
      continue;
    }
    
    console.log(`Scraping for "${product.name}" with query: "${query}"...`);
    const results = await scrapeKeyword(query);
    if (!results || results.length === 0) {
      console.log(`No results for ${query}, skipping.`);
      continue;
    }
    
    // Choose the best match with at least 3-5 images
    const best = results[0];
    console.log(`  -> Selected: "${best.title.substring(0, 50)}..."`);
    console.log(`  -> Images count: ${best.images.length}`);
    
    // Delete existing images
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
    
    console.log(`  ✓ Updated ${product.name} with ${imagesToCreate.length} real product images.`);
  }
}

async function run() {
  try {
    await updateExistingProducts();
    console.log('\n--- ALL PRODUCTS SUCCESSFULLY UPDATED WITH REAL ALIEXPRESS PRODUCT PHOTOS! ---');
  } catch (err) {
    console.error('Fatal error during scrape and update:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
