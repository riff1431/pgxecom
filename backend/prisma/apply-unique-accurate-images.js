require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 100% Unique, dedicated, accurate mapping for EVERY product in the store:
const PRODUCT_EXACT_IMAGE_MAP = [
  {
    slug: 'srjoin-commercial-powerless-curved-treadmill',
    image: '/uploads/products/treadmill-srjoin-curved.jpg'
  },
  {
    slug: 'healthengine-commercial-motorized-treadmill-motion-x18',
    image: '/uploads/products/treadmill-healthengine-x18.jpg'
  },
  {
    slug: 'realleader-commercial-curved-runner',
    image: '/uploads/products/treadmill-realleader-runner.jpg'
  },
  {
    slug: 'mbh-commercial-magnetic-indoor-bike',
    image: '/uploads/products/mbh-spinning-bike.jpg'
  },
  {
    slug: 'hyrox-commercial-air-rowing-machine',
    image: '/uploads/products/hyrox-air-rower.jpg'
  },
  {
    slug: 'wedny-commercial-air-ski-ergometer',
    image: '/uploads/products/wedny-wall-ski-erg.jpg'
  },
  {
    slug: 'stairmaster-commercial-revolving-stepclimber',
    image: '/uploads/products/stairmaster-stepmill.png'
  },
  {
    slug: 'rapiddial-pro-adjustable-dumbbells',
    image: '/uploads/products/rapiddial-adjustable-dumbbells.png'
  },
  {
    slug: 'competition-solid-cast-iron-kettlebell-set',
    image: '/uploads/products/rogue-cast-iron-kettlebell.png'
  },
  {
    slug: 'commercial-olympic-incline-flat-weight-bench',
    image: '/uploads/products/rogue-incline-bench.png'
  },
  {
    slug: 'dhz-multi-station-cable-crossover-home-gym',
    image: '/uploads/products/dhz-cable-crossover-gantry.jpg'
  },
  {
    slug: 'xinrui-commercial-counterbalanced-smith-machine',
    image: '/uploads/products/xinrui-smith-machine.jpg'
  },
  {
    slug: 'titan-olympic-hex-trap-barbell',
    image: '/uploads/products/titan-hex-trap-bar.jpg'
  },
  {
    slug: 'eleiko-competition-urethane-bumper-plates-100kg',
    image: '/uploads/products/eleiko-bumper-plates.jpg'
  },
  {
    slug: 'rogue-heavyduty-battle-ropes-50ft',
    image: '/uploads/products/rogue-battle-ropes.png'
  },
  {
    slug: 'rogue-3in1-foam-soft-plyo-jump-box',
    image: '/uploads/products/rogue-plyo-box.png'
  },
  {
    slug: 'hydro-flask-32oz-stainless-sports-bottle',
    image: '/uploads/products/hydro-flask-32oz.jpg'
  },
  {
    slug: 'under-armour-heatgear-compression-shirt',
    image: '/uploads/products/under-armour-compression-shirt.jpg'
  },
  {
    slug: 'lululemon-align-high-waisted-seamless-leggings',
    image: '/uploads/products/lululemon-align-leggings.jpg'
  },
  {
    slug: 'nike-metcon-9-cross-training-shoes',
    image: '/uploads/products/nike-metcon-9.jpg'
  },
  {
    slug: 'under-armour-undeniable-5-gym-duffle-bag',
    image: '/uploads/products/under-armour-duffle.jpg'
  },
  {
    slug: 'manduka-pro-6mm-high-density-yoga-mat',
    image: '/uploads/products/manduka-pro-yoga-mat.jpg'
  },
  {
    slug: 'theraband-heavy-duty-resistance-bands-set',
    image: '/uploads/products/theraband-resistance-bands.jpg'
  },
  {
    slug: 'qcy-h3-active-noise-cancelling-wireless-headphones',
    image: '/uploads/products/qcy-h3-headphones.jpg'
  },
  {
    slug: 'rongle-fitness-commercial-self-generating-curved-treadmill',
    image: '/uploads/products/treadmill-rongle-curve.jpg'
  },
  {
    slug: 'bodystrong-fitness-commercial-electric-treadmill-aluminum',
    image: '/uploads/products/treadmill-bodystrong-aluminum.jpg'
  },
  {
    slug: 'ypoo-professional-cardio-semi-commercial-treadmill',
    image: '/uploads/products/treadmill-ypoo-highspeed.jpg'
  },
  {
    slug: 'js-cardio-commercial-treadmill-20-incline',
    image: '/uploads/products/treadmill-js-cardio-20inc.jpg'
  },
  {
    slug: 'breo-massage-gun-2-deep-tissue-percussion-massager',
    image: '/uploads/products/breo-massage-gun.png'
  },
  {
    slug: 'commercial-power-cage-squat-rack-chin-up',
    image: '/uploads/products/rep-power-rack.jpg'
  },
  {
    slug: 'waterrower-commercial-natural-ash-wood-water-rower',
    image: '/uploads/products/waterrower-natural-ash.png'
  },
  {
    slug: 'rogue-commercial-olympic-weight-tree-barbell-holder',
    image: '/uploads/products/rogue-weight-tree.png'
  },
  {
    slug: 'concept2-commercial-dynamic-air-ski-trainer',
    image: '/uploads/products/concept2-skierg.png'
  },
  {
    slug: 'keiser-m3i-indoor-studio-magnetic-bike',
    image: '/uploads/products/keiser-m3i-bike.jpg'
  }
];

async function applyImages() {
  console.log('=== APPLYING 100% UNIQUE ACCURATE PRODUCT IMAGES ===\n');

  for (const item of PRODUCT_EXACT_IMAGE_MAP) {
    const product = await prisma.product.findUnique({
      where: { slug: item.slug }
    });

    if (!product) {
      console.log(`Product with slug "${item.slug}" not found.`);
      continue;
    }

    console.log(`Setting image for: "${product.name}"`);
    console.log(`  -> URL: ${item.image}`);

    // Remove old images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });

    // Create unique image record
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.image,
        alt: `${product.name} Official Product Shot`,
        sortOrder: 1
      }
    });

    console.log(`  ✓ Updated!`);
  }
}

async function verifyZeroDuplicates() {
  console.log('\n=== ZERO-DUPLICATE AUDIT ===');
  const allImages = await prisma.productImage.findMany({
    include: { product: true }
  });

  const urlMap = {};
  for (const img of allImages) {
    if (!urlMap[img.url]) urlMap[img.url] = [];
    urlMap[img.url].push(img.product.name);
  }

  let dupCount = 0;
  for (const [url, products] of Object.entries(urlMap)) {
    const unique = [...new Set(products)];
    if (unique.length > 1) {
      dupCount++;
      console.log(`DUPLICATE FOUND for ${url}:`);
      unique.forEach(p => console.log('  -', p));
    }
  }

  const allProducts = await prisma.product.findMany({
    include: { images: true, category: true }
  });

  console.log(`Total Products: ${allProducts.length}`);
  console.log(`Total Product Images: ${allImages.length}`);
  console.log(`Duplicate Images Across Products: ${dupCount}`);

  if (dupCount === 0) {
    console.log('🎉 100% PERFECT! ZERO DUPLICATE IMAGES IN THE STORE!');
  }

  console.log('\n--- VERIFICATION OF PRODUCTS FROM USER SCREENSHOT ---');
  const targetSlugs = [
    'hydro-flask-32oz-stainless-sports-bottle',
    'under-armour-undeniable-5-gym-duffle-bag',
    'nike-metcon-9-cross-training-shoes',
    'lululemon-align-high-waisted-seamless-leggings',
    'under-armour-heatgear-compression-shirt',
    'dhz-multi-station-cable-crossover-home-gym',
    'hyrox-commercial-air-rowing-machine',
    'rapiddial-pro-adjustable-dumbbells'
  ];

  for (const s of targetSlugs) {
    const p = allProducts.find(x => x.slug === s);
    if (p) {
      console.log(`- [${p.category.name}] ${p.name}`);
      console.log(`  Image: ${p.images[0]?.url}`);
    }
  }
}

async function main() {
  try {
    await applyImages();
    await verifyZeroDuplicates();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
