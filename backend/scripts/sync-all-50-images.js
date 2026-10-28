const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PRIMARY_URL = 'postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public';
const BACKUP_URL = 'postgresql://pgxshop:XxkJ9rWMHlgAusrCUzKs@2.25.150.87:5434/pgxshop?schema=public';

const PRODUCTS = [
  {
    sku: 'AMZ-BWF-552',
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/amz-bowflex-selecttech-552.png',
    filename: 'amz-bowflex-selecttech-552.png'
  },
  {
    sku: 'AMZ-CAP-150',
    name: 'CAP Barbell 150-lb Rubber Hex Dumbbell Set with A-Frame Rack',
    source: 'https://cdn.shopify.com/s/files/1/0604/5840/1863/files/SDRSIS-150R-16-5S-LG-variant.webp',
    filename: 'amz-cap-150-hex-dumbbells.webp'
  },
  {
    sku: 'AMZ-PWB-ELITE',
    name: 'PowerBlock Elite USA Commercial Expandable Dumbbells (5–50 lbs)',
    source: 'https://cdn.shopify.com/s/files/1/0634/6774/9567/files/elite-usa-knurled-stage-1.jpg',
    filename: 'amz-powerblock-elite-dumbbells.jpg'
  },
  {
    sku: 'AMZ-FLY-BNCH',
    name: 'FLYBIRD Multi-Position Heavy-Duty Adjustable Weight Bench (800 lbs)',
    source: 'https://cdn.shopify.com/s/files/1/0939/5657/1425/files/FED_Fitness_Flybird_Series_WB6_Foldable_Adjustable_Weight_Bench_Classic.webp',
    filename: 'amz-flybird-adjustable-bench.webp'
  },
  {
    sku: 'AMZ-ROG-OHIO',
    name: 'Rogue Fitness Ohio Bar 20kg Cerakote Olympic Barbell',
    source: 'https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Weightlifting%20Bars%20and%20Plates/Barbells/Mens%2020KG%20Barbells/OHIOCERAKOTE/2023%20Update/OHIOCERAKOTE-web1_swss7w.png',
    filename: 'amz-rogue-ohio-bar.png'
  },
  {
    sku: 'AMZ-YES-KTB',
    name: 'Yes4All Solid Cast Iron Kettlebell Set (10, 15, 20, 25 lbs)',
    source: 'https://cdn.shopify.com/s/files/1/0977/2961/0015/files/81k6xxi4T4L._AC_SL1500.jpg',
    filename: 'amz-yes4all-kettlebells.jpg'
  },
  {
    sku: 'AMZ-SYN-BMP',
    name: 'Synergee Commercial Olympic Bumper Plates (260 lb Complete Set)',
    source: 'https://cdn.shopify.com/s/files/1/1613/8203/files/amazon_20160lb_20bumper_20plate_20set_20image_201.jpg',
    filename: 'amz-synergee-bumper-plates.jpg'
  },
  {
    sku: 'AMZ-HLK-CAGE',
    name: 'HulkFit Pro Series Multi-Function Adjustable Power Cage',
    source: 'https://i5.walmartimages.com/seo/HulkFit-Wall-Mounted-Power-Rack-Pro-Series_55723b74-31af-465c-8fba-74ab26d09a8e.8dcd26e40724bed0207828f25ee29210.jpeg',
    filename: 'amz-hulkfit-power-cage.jpg'
  },
  {
    sku: 'AMZ-A2Z-TRAP',
    name: 'A2ZCARE Olympic Hex Weight Trap Deadlift Bar with Raised Grips',
    source: 'https://cdn.shopify.com/s/files/1/0977/2961/0015/files/61naTDcFP4L._AC_SL1500.jpg',
    filename: 'amz-a2zcare-hex-trap-bar.jpg'
  },
  {
    sku: 'AMZ-IRN-MST',
    name: 'Ironmaster Quick-Lock Heavy Adjustable Dumbbell System (75 lbs)',
    source: 'http://ironmaster.com/cdn/shop/files/75_main_3D_2000.jpg',
    filename: 'amz-ironmaster-quicklock-dumbbells.jpg'
  },
  {
    sku: 'AMZ-TTN-T2',
    name: 'Titan Fitness T-2 Series Short Power Squat Rack',
    source: 'https://cdn.shopify.com/s/files/1/0802/1508/1237/files/401835_01.jpg',
    filename: 'amz-titan-t2-squat-rack.jpg'
  },
  {
    sku: 'AMZ-MRC-TREE',
    name: 'Marcy Olympic Weight Plate Tree with Vertical Bar Holder',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/rogue-weight-tree.png',
    filename: 'amz-marcy-plate-tree.png'
  },
  {
    sku: 'AMZ-DMS-CLR',
    name: 'DMoose Commercial Olympic Barbell Aluminum Locking Collars (Pair)',
    source: 'https://cdn.shopify.com/s/files/1/1497/9682/files/1_3bba273c-977d-483c-b093-e88ea791973d.png',
    filename: 'amz-dmoose-barbell-collars.png'
  },
  {
    sku: 'AMZ-IBS-PAD',
    name: 'Iron Bull Strength Advanced Squat Pad & Hip Thrust Neck Protector',
    source: 'https://cdn.shopify.com/s/files/1/0268/4682/2569/products/AdvancedBarbellPad-Black.webp',
    filename: 'amz-ironbull-squat-pad.webp'
  },
  {
    sku: 'AMZ-BLF-PLT',
    name: 'BalanceFrom Cast Iron Olympic 2-Inch Weight Plates Set (105 lbs)',
    source: 'https://cdn.shopify.com/s/files/1/0977/2961/0015/files/81kbN6bAa6L._AC_SL1500.jpg',
    filename: 'amz-balancefrom-cast-iron-plates.jpg'
  },
  {
    sku: 'AMZ-C2-ROW',
    name: 'Concept2 RowErg Indoor Rowing Machine with PM5 Monitor',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/concept2-rowerg.jpg',
    filename: 'amz-concept2-rowerg.jpg'
  },
  {
    sku: 'AMZ-NT-1750',
    name: 'NordicTrack Commercial 1750 Smart Folding Treadmill',
    source: 'https://images.contentstack.io/v3/assets/blt40913d6edfec40cc/bltc53d81ae86766ed7/69b46f7386fa00700aeb1a70/ntl17125_spec_Gallery1.png',
    filename: 'amz-nordictrack-1750-treadmill.png'
  },
  {
    sku: 'AMZ-SOL-F80',
    name: 'Sole Fitness F80 Commercial Folding Treadmill with Cushion Flex',
    source: 'https://solefitnessstore.com/cdn/shop/files/SOLE-F80-VV_83c4f90f-a668-4a68-a259-4acc3c806503.jpg',
    filename: 'amz-sole-f80-treadmill.jpg'
  },
  {
    sku: 'AMZ-HRZ-70',
    name: 'Horizon Fitness 7.0 AT Studio Series Smart Treadmill',
    source: 'https://cdn.shopify.com/s/files/1/0930/5558/2483/files/7.0at-05-hero.jpg',
    filename: 'amz-horizon-70-at-treadmill.jpg'
  },
  {
    sku: 'AMZ-SCH-AD7',
    name: 'Schwinn Fitness Airdyne AD7 High-Torque Air Resistance Bike',
    source: 'https://www.schwinnfitness.com/cdn/shop/files/schwinn-airdyne-ad7-1.png',
    filename: 'amz-schwinn-ad7-airbike.png'
  },
  {
    sku: 'AMZ-AST-BIK',
    name: 'Assault AirBike Classic Heavy Duty Fan Conditioning Bike',
    source: 'https://assets.roguefitness.com/v1/catalog/Conditioning/Endurance%20/Bikes/ASSAULTBIKE/2023%20Updated%20Images/ASSAULTBIKE-H_maixxf.png',
    filename: 'amz-assault-airbike-classic.png'
  },
  {
    sku: 'AMZ-SHF-1805',
    name: 'Sunny Health & Fitness Indoor Magnetic Cycling Bike (SF-B1805)',
    source: 'https://cdn.shopify.com/s/files/1/0052/7043/7978/products/SUNNY-_1_1aaaf4a7-b891-468a-87f9-9b6de1be1476.jpg',
    filename: 'amz-sunny-b1805-cycling-bike.jpg'
  },
  {
    sku: 'AMZ-ECH-EX5',
    name: 'Echelon Smart Connect EX-5 Commercial Studio Cycling Bike',
    source: 'https://cdn.shopify.com/s/files/1/2422/9487/files/connect-ex-5-ech01-ex5-ech01-ex5-1848785.png',
    filename: 'amz-echelon-ex5-bike.png'
  },
  {
    sku: 'AMZ-C2-SKI',
    name: 'Concept2 SkiErg Upper-Body Ski Ergometer with Floor Stand',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/concept2-skierg.png',
    filename: 'amz-concept2-skierg-stand.png'
  },
  {
    sku: 'AMZ-STM-SM3',
    name: 'StairMaster SM3 Commercial StepMill Revolving Stair Climber',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/stairmaster-stepmill.png',
    filename: 'amz-stairmaster-sm3-stepmill.png'
  },
  {
    sku: 'AMZ-BWF-M6',
    name: 'Bowflex Max Trainer M6 Hybrid Elliptical Stepper',
    source: 'https://cdn.shopify.com/s/files/1/0643/9570/6437/files/m6-in-home-f-ll.jpg',
    filename: 'amz-bowflex-m6-max-trainer.jpg'
  },
  {
    sku: 'AMZ-MRC-WTR',
    name: 'Merach Water Resistance Wooden Dual-Rail Rowing Machine',
    source: 'https://cdn.shopify.com/s/files/1/0507/1611/5119/files/R28R1.jpg',
    filename: 'amz-merach-water-rower.jpg'
  },
  {
    sku: 'AMZ-BWF-PR1000',
    name: 'Bowflex PR1000 Power Rod Home Gym Full-Body System',
    source: 'https://cdn.shopify.com/s/files/1/0643/9570/6437/files/bowflex-pr1000-home-gym-hero.png',
    filename: 'amz-bowflex-pr1000-gym.png'
  },
  {
    sku: 'AMZ-MRC-990',
    name: 'Marcy 150-lb Stack Multifunctional Home Gym Station (MWM-990)',
    source: 'https://cdn.shopify.com/s/files/1/0742/4629/1692/files/MWM-990_p_01.jpg',
    filename: 'amz-marcy-mwm990-home-gym.jpg'
  },
  {
    sku: 'AMZ-BDS-3000',
    name: 'Body-Solid EXM3000LPS Multi-Station Dual Stack Home Gym',
    source: 'https://cdn11.bigcommerce.com/s-2v01ommyhe/products/947/images/3056/EXM3000_Hero-noModels_DSF4037_1500px__49159.1735661924.386.513.jpg',
    filename: 'amz-bodysolid-exm3000lps-gym.jpg'
  },
  {
    sku: 'AMZ-MKL-CAGE',
    name: 'Mikolo Commercial Power Cage with Dual Cable Crossover Pulley',
    source: 'https://cdn.shopify.com/s/files/1/0705/5432/1194/files/k3-rack-r.jpg',
    filename: 'amz-mikolo-power-cage-crossover.jpg'
  },
  {
    sku: 'AMZ-RTF-CBL',
    name: 'RitFit Dual Stack Commercial Cable Crossover Machine',
    source: 'https://cdn.shopify.com/s/files/1/2350/9323/files/1._M1_8c60d18e-349e-4813-afd3-581da96911a5.jpg',
    filename: 'amz-ritfit-cable-crossover-machine.jpg'
  },
  {
    sku: 'AMZ-MJR-F22',
    name: 'Major Fitness F22 All-in-One Smith Machine Power Rack Station',
    source: 'https://cdn.shopify.com/s/files/1/0580/4484/2041/files/F22___1.png',
    filename: 'amz-major-fitness-f22-smith-machine.png'
  },
  {
    sku: 'AMZ-TGM-APEX',
    name: 'Total Gym APEX G5 Incline Bodyweight Workout Station',
    source: 'https://cdn.shopify.com/s/files/1/0830/2762/4151/files/total-gym-apex-g3-alone.webp',
    filename: 'amz-total-gym-apex-g5.webp'
  },
  {
    sku: 'AMZ-TRX-PRO',
    name: 'TRX All-in-One Suspension Trainer Bodyweight Training Kit',
    source: 'https://cdn.shopify.com/s/files/1/0554/1704/5132/files/pro4laydown.jpg',
    filename: 'amz-trx-suspension-trainer-kit.jpg'
  },
  {
    sku: 'AMZ-THG-PRO5',
    name: 'Theragun PRO Gen 5 Deep Tissue Percussive Massage Gun',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/amz-theragun-pro-gen5.png',
    filename: 'amz-theragun-pro-gen5.png'
  },
  {
    sku: 'AMZ-HYP-VLT2',
    name: 'Hyperice Hypervolt 2 Pro Cordless Percussion Massager',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/amz-hyperice-hypervolt2-pro.png',
    filename: 'amz-hyperice-hypervolt2-pro.png'
  },
  {
    sku: 'AMZ-TRG-GRID',
    name: 'TriggerPoint GRID Patented Multi-Density Foam Roller',
    source: 'https://traqtwdfhxduijhqsuwg.supabase.co/storage/v1/object/public/products/amz-triggerpoint-grid-roller.jpg',
    filename: 'amz-triggerpoint-grid-roller.jpg'
  },
  {
    sku: 'AMZ-IRN-BAR',
    name: 'Iron Gym Total Upper Body Workout Bar Doorway Pull-Up System',
    source: 'https://i5.walmartimages.com/seo/IRON-GYM-Total-Upper-Body-Workout-Bar_a3bc6cb1-6e72-4ca0-b23b-86d07d2c511e_1.01f4090ca4d7594c3d1c5c038864f6cf.jpeg',
    filename: 'amz-iron-gym-doorway-pullup-bar.jpg'
  },
  {
    sku: 'AMZ-GMR-BLT',
    name: 'Gymreapers 10mm Heavy Leather Lever Weightlifting Belt (IPF Approved)',
    localPath: 'C:\\Users\\Tanvir\\.gemini\\antigravity\\brain\\97c5e413-1346-478d-98c4-ef629c7b0f5c\\scratch\\gymreapers_leather_main.jpg',
    filename: 'amz-gymreapers-10mm-lever-belt.jpg'
  },
  {
    sku: 'AMZ-ROG-GRP',
    name: 'Rogue Fitness 3-Hole Gymnastics Carbon Hand Grips',
    source: 'https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Bodyweight%20and%20Gymnastics/Gymnastics%20/Grips/BK0005/BK0005-H_pxrlmt.png',
    filename: 'amz-rogue-gymnastics-hand-grips.png'
  },
  {
    sku: 'AMZ-PRF-ACU',
    name: 'ProsourceFit Acupressure Mat and Pillow Set for Muscle Relief',
    localPath: 'C:\\Users\\Tanvir\\.gemini\\antigravity\\brain\\97c5e413-1346-478d-98c4-ef629c7b0f5c\\scratch\\prosourcefit_mat.jpg',
    filename: 'amz-prosource-acupressure-mat-set.jpg'
  },
  {
    sku: 'AMZ-FTS-BND',
    name: 'Fit Simplify 5-Level Resistance Loop Exercise Bands Set',
    localPath: 'C:\\Users\\Tanvir\\.gemini\\antigravity\\brain\\97c5e413-1346-478d-98c4-ef629c7b0f5c\\scratch\\fs_band1.jpg',
    filename: 'amz-fit-simplify-resistance-loop-bands.jpg'
  },
  {
    sku: 'AMZ-ROG-STR',
    name: 'Rogue Ohio Heavy-Duty Padded Cotton Lifting Straps',
    localPath: 'C:\\Users\\Tanvir\\.gemini\\antigravity\\brain\\97c5e413-1346-478d-98c4-ef629c7b0f5c\\scratch\\rogue_ra0719.png',
    filename: 'amz-rogue-ohio-lifting-straps.png'
  },
  {
    sku: 'AMZ-BLF-MAT',
    name: 'BalanceFrom 1/2-Inch Extra Thick Anti-Tear High Density Yoga Mat',
    source: 'https://cdn.shopify.com/s/files/1/0977/2961/0015/files/81KUWxlaxOL._AC_SL1500.jpg',
    filename: 'amz-balancefrom-thick-yoga-mat.jpg'
  },
  {
    sku: 'AMZ-RNP-SCL',
    name: 'Renpho Smart Digital Bluetooth BMI Body Fat Composition Scale',
    source: 'https://cdn.shopify.com/s/files/1/0083/4630/4597/files/ES-32MD_CS20M__01_1f6eaa41-d841-48a6-b388-bed975c229b1.png',
    filename: 'amz-renpho-smart-bluetooth-scale.png'
  },
  {
    sku: 'AMZ-HRB-GLV',
    name: 'Harbinger BioForm Heat-Activated Padded Weightlifting Gloves',
    source: 'https://cdn.shopify.com/s/files/1/0918/3022/3129/files/xqqegyds0pkfox237uqm_fa880eb4-3e6a-4d19-98c6-0a33acadc27e.jpg',
    filename: 'amz-harbinger-bioform-lifting-gloves.jpg'
  },
  {
    sku: 'AMZ-RPM-ROPE',
    name: 'RPM Training Session4 Speed Cable Jump Rope with Dual Bearings',
    source: 'https://wolverson-fitness.co.uk/cdn/shop/files/SR104-TBK_REN1_800x-min.jpg',
    filename: 'amz-rpm-session4-speed-rope.jpg'
  },
  {
    sku: 'AMZ-JYF-BLC',
    name: 'Jayflex Hyperbell Adjustable Dumbbell to Barbell Converter Clamps',
    source: 'https://cdn.shopify.com/s/files/1/0136/4915/0011/files/HyperbellBundle_Kettlebell.png',
    filename: 'amz-jayflex-hyperbell-barbell-clamp.png'
  },
  {
    sku: 'AMZ-BLN-STR',
    name: 'BlenderBottle Strada 24oz Insulated Stainless Steel Shaker Cup',
    source: 'https://cdn.shopify.com/s/files/1/1099/1898/files/BB_Web_25oz_Strada_Sleek_Black_Grey_Turned_SC.png',
    filename: 'amz-blenderbottle-strada-stainless-shaker.png'
  }
];

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const arr = await res.arrayBuffer();
  return { buffer: Buffer.from(arr), contentType: res.headers.get('content-type') || 'image/jpeg' };
}

async function uploadAllToSupabase() {
  console.log(`\n================ STEP 1: UPLOAD 50 IMAGES TO SUPABASE STORAGE ================\n`);
  const finalMapping = {};

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    console.log(`[${i + 1}/${PRODUCTS.length}] Processing ${p.sku}: ${p.name}`);

    // If already in Supabase and filename matches, keep it
    if (p.source && p.source.includes('traqtwdfhxduijhqsuwg.supabase.co') && p.source.includes(p.filename)) {
      console.log(`  ⚡ Already in Supabase: ${p.source}`);
      finalMapping[p.sku] = p.source;
      continue;
    }

    let buf, cType;
    if (p.localPath && fs.existsSync(p.localPath)) {
      buf = fs.readFileSync(p.localPath);
      cType = p.filename.endsWith('.png') ? 'image/png' : p.filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      console.log(`  📂 Read from local file: ${p.localPath} (${Math.round(buf.length / 1024)} KB)`);
    } else {
      try {
        console.log(`  🌐 Downloading from: ${p.source.substring(0, 75)}...`);
        const fetched = await fetchBuffer(p.source);
        buf = fetched.buffer;
        cType = p.filename.endsWith('.png') ? 'image/png' : p.filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
        console.log(`  📥 Downloaded ${Math.round(buf.length / 1024)} KB (${cType})`);
      } catch (err) {
        console.error(`  ❌ Failed to download: ${err.message}`);
        continue;
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('products').upload(p.filename, buf, {
      contentType: cType,
      upsert: true
    });

    if (error) {
      console.error(`  ❌ Supabase upload failed for ${p.filename}:`, error.message);
      continue;
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${p.filename}`;
    console.log(`  ✔️ Uploaded to Supabase: ${publicUrl}`);
    finalMapping[p.sku] = publicUrl;
  }

  return finalMapping;
}

async function updateDatabases(mapping) {
  console.log(`\n================ STEP 2: DUAL-DATABASE SYNC (PRIMARY & BACKUP) ================\n`);
  const primaryPool = new Pool({ connectionString: PRIMARY_URL });
  const backupPool = new Pool({ connectionString: BACKUP_URL });

  for (const pool of [primaryPool, backupPool]) {
    const isPrimary = pool === primaryPool;
    const dbName = isPrimary ? 'PRIMARY DB (72.62.81.204:5432)' : 'BACKUP DB (2.25.150.87:5434)';
    console.log(`Syncing ${dbName}...`);

    let updated = 0;
    for (const p of PRODUCTS) {
      const targetUrl = mapping[p.sku];
      if (!targetUrl) continue;

      const pRes = await pool.query('SELECT id FROM products WHERE sku = $1', [p.sku]);
      if (pRes.rows.length === 0) continue;
      const productId = pRes.rows[0].id;

      // Replace images in product_images table
      await pool.query('DELETE FROM product_images WHERE "productId" = $1', [productId]);
      await pool.query(
        'INSERT INTO product_images (id, "productId", url, alt, "sortOrder") VALUES ($1, $2, $3, $4, $5)',
        ['img_' + Math.random().toString(36).substring(2, 11), productId, targetUrl, p.name, 1]
      );
      updated++;
    }
    console.log(`  ✔️ ${dbName}: Successfully updated ${updated}/50 products with dedicated Supabase CDN images.\n`);
  }

  await primaryPool.end();
  await backupPool.end();
}

async function verifyCatalog() {
  console.log(`\n================ STEP 3: CATALOG AUDIT & DUPLICATE CHECK ================\n`);
  const pool = new Pool({ connectionString: PRIMARY_URL });

  const totalRes = await pool.query('SELECT COUNT(*) FROM products');
  const totalProducts = parseInt(totalRes.rows[0].count, 10);

  const imagesRes = await pool.query('SELECT COUNT(*) FROM product_images');
  const totalImages = parseInt(imagesRes.rows[0].count, 10);

  const dupesRes = await pool.query(`
    SELECT pi.url, COUNT(DISTINCT pi."productId") as prod_count, array_agg(p.name) as prods
    FROM product_images pi
    JOIN products p ON pi."productId" = p.id
    GROUP BY pi.url
    HAVING COUNT(DISTINCT pi."productId") > 1
    ORDER BY prod_count DESC
  `);

  console.log(`Total Products in Catalog: ${totalProducts}`);
  console.log(`Total Images in Catalog:   ${totalImages}`);
  console.log(`Duplicate Image URLs:      ${dupesRes.rows.length}`);

  if (dupesRes.rows.length > 0) {
    console.error('❌ DUPLICATES DETECTED:');
    dupesRes.rows.forEach(r => {
      console.log(`  URL: ${r.url} (${r.prod_count} products)`);
      r.prods.forEach(n => console.log('    - ' + n));
    });
  } else {
    console.log('🎉 100% PERFECT: ZERO DUPLICATE IMAGES DETECTED ACROSS THE ENTIRE CATALOG!');
  }

  await pool.end();
}

async function main() {
  const t0 = Date.now();
  const mapping = await uploadAllToSupabase();
  fs.writeFileSync(path.join(__dirname, 'amazon-final-mapping.json'), JSON.stringify(mapping, null, 2));

  await updateDatabases(mapping);
  await verifyCatalog();

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nAll done in ${sec}s!`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
