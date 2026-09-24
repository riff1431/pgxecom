import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database for PGX International Fitness Store...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {
      name: 'PGX Admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      isBanned: false,
    },
    create: {
      email: 'admin@store.com',
      name: 'PGX Admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // International Shipping Zones
  const zones = [
    { name: 'Standard International Shipping', slug: 'intl_standard', cost: 15.0, isActive: true },
    { name: 'Express Worldwide Courier', slug: 'intl_express', cost: 29.0, isActive: true },
    { name: 'European Union Zone', slug: 'eu_zone', cost: 9.9, isActive: true },
  ];

  for (const zone of zones) {
    await prisma.shippingZone.upsert({
      where: { slug: zone.slug },
      update: { cost: zone.cost, name: zone.name, isActive: true },
      create: zone,
    });
  }
  console.log('✅ International shipping zones created');

  // PGX Fitness Categories
  const categories = [
    { name: 'Cardio Equipment', slug: 'cardio-equipment', icon: '🏃', sortOrder: 1 },
    { name: 'Strength Equipment', slug: 'strength-equipment', icon: '🏋️', sortOrder: 2 },
    { name: 'Home Gym', slug: 'home-gym', icon: '⚡', sortOrder: 3 },
    { name: 'Accessories', slug: 'accessories', icon: '🧘', sortOrder: 4 },
    { name: 'Apparel', slug: 'apparel', icon: '👕', sortOrder: 5 },
    { name: 'Bags', slug: 'bags', icon: '🎒', sortOrder: 6 },
    { name: 'Wellness', slug: 'wellness', icon: '💧', sortOrder: 7 },
    { name: 'Home & Office', slug: 'home-office', icon: '🪑', sortOrder: 8 },
    { name: 'Bundles', slug: 'bundles', icon: '🎁', sortOrder: 9 },
  ];

  const categoryMap = new Map<string, string>();
  const placeholderImg = '/uploads/placeholder-product.jpg';

  for (const cat of categories) {
    const seededCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        image: placeholderImg,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        image: placeholderImg,
      },
    });

    categoryMap.set(cat.slug, seededCategory.id);
  }
  console.log('✅ PGX Categories seeded');

  // PGX Products Catalog from Reference Screenshot
  const pgxProducts = [
    // Featured Equipment
    {
      name: 'PGX Pro Treadmill X1',
      slug: 'pgx-pro-treadmill-x1',
      description: 'High-performance commercial grade smart folding treadmill with up to 22km/h speed, interactive incline training, and shock absorption deck.',
      shortDesc: 'Smart • Foldable • 22km/h',
      price: 1899.0,
      comparePrice: 2199.0,
      stock: 25,
      categorySlug: 'cardio-equipment',
      isFeatured: true,
      sku: 'PGX-TRD-01',
    },
    {
      name: 'PGX Smart Exercise Bike',
      slug: 'pgx-smart-exercise-bike',
      description: 'Whisper-quiet magnetic resistance indoor cycling bike with HD touchscreen, companion fitness app integration, and ergonomic racing saddle.',
      shortDesc: 'Interactive • Quiet • App Ready',
      price: 1299.0,
      comparePrice: 1499.0,
      stock: 30,
      categorySlug: 'cardio-equipment',
      isFeatured: true,
      sku: 'PGX-BIK-01',
    },
    {
      name: 'PGX Adjustable Dumbbells',
      slug: 'pgx-adjustable-dumbbells',
      description: 'Precision dial-adjusted dumbbell set from 5kg to 50kg, replacing 15 sets of weights in one space-saving compact footprint.',
      shortDesc: '5-50kg Set • Space Saving',
      price: 599.0,
      comparePrice: 699.0,
      stock: 50,
      categorySlug: 'strength-equipment',
      isFeatured: true,
      sku: 'PGX-DMB-01',
    },
    {
      name: 'PGX Power Rack Package',
      slug: 'pgx-power-rack-package',
      description: 'Heavy duty commercial steel power cage including multi-grip pull-up station, adjustable spotter arms, flat-incline bench, and 120kg bumper plates.',
      shortDesc: 'Rack • Bench • 120kg Plates',
      price: 1599.0,
      comparePrice: 1899.0,
      stock: 15,
      categorySlug: 'strength-equipment',
      isFeatured: true,
      sku: 'PGX-RCK-01',
    },
    {
      name: 'PGX Rowing Machine',
      slug: 'pgx-rowing-machine',
      description: 'Dynamic air resistance commercial rower for total body conditioning and cardiovascular endurance with Bluetooth performance monitor.',
      shortDesc: 'Air Resistance • Full Body',
      price: 1099.0,
      comparePrice: 1299.0,
      stock: 20,
      categorySlug: 'cardio-equipment',
      isFeatured: true,
      sku: 'PGX-ROW-01',
    },
    {
      name: 'PGX Home Gym System',
      slug: 'pgx-home-gym-system',
      description: 'All-in-one multi-station cable crossover and functional trainer with 100kg dual precision weight stacks for complete body workouts.',
      shortDesc: 'All-in-One • 100kg Stack',
      price: 2499.0,
      comparePrice: 2899.0,
      stock: 12,
      categorySlug: 'home-gym',
      isFeatured: true,
      sku: 'PGX-GYM-01',
    },

    // Everyday Essentials & Activewear
    {
      name: 'PGX Performance T-Shirt',
      slug: 'pgx-performance-tshirt',
      description: 'Ultra-lightweight, sweat-wicking athletic tee built with 4-way stretch fabric for maximum training mobility and breathability.',
      shortDesc: "Men's | Black",
      price: 34.99,
      comparePrice: 45.0,
      stock: 120,
      categorySlug: 'apparel',
      isFeatured: false,
      sku: 'PGX-APP-01',
    },
    {
      name: 'PGX Leggings',
      slug: 'pgx-leggings',
      description: 'High-waisted compression tights featuring non-slip waistband, squat-proof moisture-wicking weave, and ergonomic side pockets.',
      shortDesc: "Women's | Black",
      price: 49.99,
      comparePrice: 65.0,
      stock: 95,
      categorySlug: 'apparel',
      isFeatured: false,
      sku: 'PGX-APP-02',
    },
    {
      name: 'PGX Training Shoes',
      slug: 'pgx-training-shoes',
      description: 'Stable, grounded cross-training shoes engineered with high-traction grip soles and breathable structured knit upper.',
      shortDesc: 'Unisex | Breathable',
      price: 89.99,
      comparePrice: 110.0,
      stock: 60,
      categorySlug: 'apparel',
      isFeatured: false,
      sku: 'PGX-SHO-01',
    },
    {
      name: 'PGX Gym Bag',
      slug: 'pgx-gym-bag',
      description: 'Water-resistant duffel bag with ventilated shoe compartment, dry/wet separation pocket, and heavy-duty reinforced shoulder strap.',
      shortDesc: 'Spacious | Durable',
      price: 59.99,
      comparePrice: 79.99,
      stock: 80,
      categorySlug: 'bags',
      isFeatured: false,
      sku: 'PGX-BAG-01',
    },
    {
      name: 'PGX Stainless Bottle',
      slug: 'pgx-stainless-bottle',
      description: 'Double-wall vacuum insulated stainless steel sports bottle that keeps your hydration iced cold for up to 24 hours.',
      shortDesc: '750ml | Insulated',
      price: 59.99,
      comparePrice: 69.99,
      stock: 140,
      categorySlug: 'wellness',
      isFeatured: false,
      sku: 'PGX-BOT-01',
    },
    {
      name: 'PGX Yoga Mat',
      slug: 'pgx-yoga-mat',
      description: 'Premium anti-slip textured 6mm eco-friendly mat offering superior joint cushioning and stability for yoga, pilates, and floor work.',
      shortDesc: 'Anti-Slip | 6mm',
      price: 29.99,
      comparePrice: 39.99,
      stock: 110,
      categorySlug: 'accessories',
      isFeatured: false,
      sku: 'PGX-MAT-01',
    },
    {
      name: 'PGX Resistance Bands',
      slug: 'pgx-resistance-bands',
      description: 'Set of 5 heavy-duty natural latex loop resistance bands varying from extra-light to extra-heavy for mobility and resistance training.',
      shortDesc: 'Set of 5 | Varied Resistance',
      price: 24.99,
      comparePrice: 34.99,
      stock: 200,
      categorySlug: 'accessories',
      isFeatured: false,
      sku: 'PGX-BND-01',
    },
    {
      name: 'PGX Wireless Headphones',
      slug: 'pgx-wireless-headphones',
      description: 'Sweat-proof over-ear sports headphones with active noise cancellation, deep bass profile, and 40-hour battery life.',
      shortDesc: 'Noise Cancelling',
      price: 79.99,
      comparePrice: 99.99,
      stock: 75,
      categorySlug: 'accessories',
      isFeatured: false,
      sku: 'PGX-HDP-01',
    },

    // Bundles
    {
      name: 'PGX Complete Home Gym Bundle',
      slug: 'bundle-complete-home-gym',
      description: 'Power Rack, Adjustable Bench, 120kg Weight Plates, Barbell & Dumbbells, Floor Mat, Accessories Pack.',
      shortDesc: 'Best Value Home Gym Setup',
      price: 2999.0,
      comparePrice: 3499.0,
      stock: 10,
      categorySlug: 'bundles',
      isFeatured: true,
      sku: 'PGX-BDL-01',
    },
    {
      name: 'PGX Cardio Essentials Bundle',
      slug: 'bundle-cardio-essentials',
      description: 'Treadmill X1, Exercise Bike, Rowing Machine, Heart Rate Monitor.',
      shortDesc: 'Complete Cardio Performance Suite',
      price: 3499.0,
      comparePrice: 3899.0,
      stock: 8,
      categorySlug: 'bundles',
      isFeatured: true,
      sku: 'PGX-BDL-02',
    },
    {
      name: 'PGX Strength Starter Bundle',
      slug: 'bundle-strength-starter',
      description: 'Adjustable Dumbbells, Training Bench, Kettlebells Set, Resistance Bands, Gym Mat.',
      shortDesc: 'Essential Strength & Conditioning Setup',
      price: 1199.0,
      comparePrice: 1399.0,
      stock: 15,
      categorySlug: 'bundles',
      isFeatured: true,
      sku: 'PGX-BDL-03',
    },
    {
      name: 'PGX Lifestyle Pack',
      slug: 'bundle-lifestyle-pack',
      description: 'Apparel Set (3 pieces), Gym Bag, Stainless Bottle, Wireless Headphones, Towel, Accessories.',
      shortDesc: 'Everyday Active Lifestyle Package',
      price: 499.0,
      comparePrice: 599.0,
      stock: 25,
      categorySlug: 'bundles',
      isFeatured: true,
      sku: 'PGX-BDL-04',
    },
  ];

  for (const prod of pgxProducts) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: prod.slug },
        data: {
          name: prod.name,
          description: prod.description,
          shortDesc: prod.shortDesc,
          price: prod.price,
          comparePrice: prod.comparePrice,
          stock: prod.stock,
          categoryId: categoryId,
          isFeatured: prod.isFeatured,
          sku: prod.sku,
        },
      });

      // Update or create product image
      await prisma.productImage.deleteMany({
        where: { productId: existing.id },
      });
      await prisma.productImage.create({
        data: {
          productId: existing.id,
          url: placeholderImg,
          alt: prod.name,
          sortOrder: 1,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          shortDesc: prod.shortDesc,
          price: prod.price,
          comparePrice: prod.comparePrice,
          stock: prod.stock,
          categoryId: categoryId,
          isFeatured: prod.isFeatured,
          sku: prod.sku,
          images: {
            create: [{ url: placeholderImg, alt: prod.name, sortOrder: 1 }],
          },
        },
      });
    }
  }
  console.log('✅ PGX Product Catalog seeded');

  // Store settings for PGX
  const settings = [
    { key: 'store_name', value: 'PGX', group: 'general' },
    { key: 'store_logo', value: '/logo.png', group: 'general' },
    {
      key: 'store_description',
      value: 'PGX — Lifestyle, Fitness, Gear, Everyday. Premium fitness equipment, apparel and everyday essentials.',
      group: 'general',
    },
    { key: 'store_phone', value: '+1 (800) 555-0199', group: 'contact' },
    { key: 'store_email', value: 'support@pgxfitness.com', group: 'contact' },
    { key: 'store_address', value: 'Amsterdam / London / Global Hubs', group: 'contact' },
    { key: 'hero_title', value: 'A STRONGER TOMORROW.', group: 'hero' },
    {
      key: 'hero_subtitle',
      value: 'Premium fitness equipment, apparel and everyday essentials for a healthier, happier you.',
      group: 'hero',
    },
    { key: 'hero_badge', value: 'DISCIPLINE TODAY.', group: 'hero' },
    { key: 'currency', value: '€', group: 'general' },
  ];

  for (const setting of settings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ PGX Store settings saved');

  console.log('🎉 Seeding complete for PGX International Fitness!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
