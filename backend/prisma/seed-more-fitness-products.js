require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const newProducts = [
  {
    name: 'PGX Commercial Olympic Incline & Flat Bench Press',
    slug: 'pgx-commercial-olympic-bench-press',
    sku: 'PGX-BNCH-01',
    categorySlug: 'strength-equipment',
    price: 449.0,
    comparePrice: 549.0,
    stock: 25,
    weight: '48 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: `Frame: 3" x 3" 11-Gauge Structural Heavy Steel\nIncline Positions: 7 Backpad Angles (-15° Decline to 85° Incline)\nSeat Adjustments: 3 Ergonomic Seat Levels\nUpholstery: High-Density Commercial Foam with Tear-Proof Marine Vinyl\nCapacity: 450 kg (1000 lbs) Test Load Rating\nTransport: Built-in Heavy Rubber Wheels & Grab Handle\nWarranty: Lifetime Frame, 3-Year Upholstery`,
    description: `<h2>Engineered for Heavy Lifting: PGX Commercial Olympic Utility Bench</h2><p>The <strong>PGX Commercial Olympic Bench Press</strong> is built for the most grueling powerlifting and bodybuilding workouts. Constructed with commercial 11-gauge 3x3-inch laser-cut steel, this bench delivers total rock-solid stability with zero frame flex under 450 kg loads.</p><h3>Key Features</h3><ul><li><strong>7 Precision Locking Positions:</strong> Smooth laser-notched ladder system allows instant transitions from decline, flat, and military upright angles.</li><li><strong>Zero-Gap Pad Architecture:</strong> High-density multi-layered foam pad eliminates lower back gaps for maximal spinal support.</li><li><strong>Sweat & Tear Resistant Marine Vinyl:</strong> Commercial-grade textured upholstery provides anti-slip traction during heavy barbell bench presses.</li><li><strong>Integrated Transport Wheels:</strong> Heavy-duty non-marking urethane wheels and front knurled handle make relocation around the gym effortless.</li></ul><h3>Specifications</h3><table><tbody><tr><td><strong>Frame Gauge</strong></td><td>11-Gauge (3.0 mm) Laser-Cut Steel</td></tr><tr><td><strong>Pad Thickness</strong></td><td>70 mm Commercial High-Density Composite</td></tr><tr><td><strong>Max Load Capacity</strong></td><td>450 kg / 1000 lbs</td></tr><tr><td><strong>Footprint</strong></td><td>142 cm (L) x 62 cm (W) x 45 cm (H flat)</td></tr><tr><td><strong>Bench Weight</strong></td><td>48 kg</td></tr><tr><td><strong>Warranty</strong></td><td>Lifetime Frame, 3-Year Upholstery & Moving Parts</td></tr></tbody></table>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Commercial Olympic Bench Press In Gym Studio'
      }
    ]
  },
  {
    name: 'PGX Commercial Cast Iron Kettlebell Pro Set (8–32kg)',
    slug: 'pgx-cast-iron-kettlebell-set',
    sku: 'PGX-KTB-SET',
    categorySlug: 'strength-equipment',
    price: 349.0,
    comparePrice: 429.0,
    stock: 35,
    weight: '100 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: `Set Includes: 8kg, 12kg, 16kg, 20kg, 24kg, 32kg Competition Kettlebells\nCasting: Single-Piece Gravity-Cast Solid Ore Iron\nFinish: Electrostatic Matte Black Powder Coat for Optimal Chalk Retention\nBase: Machined Flat Precision Base (Zero Wobble on Floor)\nColor Coding: International Color-Coded Handle Bands for Instant Weight ID\nWarranty: 5-Year Structural Replacement Warranty`,
    description: `<h2>Flawless Balance & Grip: PGX Pro Cast Iron Kettlebell Set</h2><p>Designed for Russian kettlebell swings, Turkish get-ups, and explosive snatches, the <strong>PGX Pro Kettlebell Set</strong> is cast from a single pour of molten iron with zero welded seams, seams, or plastic fillers. The micro-textured matte powder coating provides superior grip traction with or without chalk.</p><h3>Key Features</h3><ul><li><strong>Single-Piece Gravity Casting:</strong> Eliminates weld points for unbreakable structural durability during heavy outdoor drops.</li><li><strong>Color-Coded Handle Bands:</strong> Conforms to international Olympic standards for quick identification during high-intensity intervals.</li><li><strong>Machined Flat Precision Bottom:</strong> Perfectly level base prevents rolling or tipping during renegade rows and push-ups.</li><li><strong>Smooth Non-Abrasive Handle:</strong> Uniform 35mm handle diameter delivers frictionless rotation without tearing hands.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Commercial Cast Iron Kettlebell Pro Set'
      }
    ]
  },
  {
    name: 'PGX Commercial Air Resistance Ski Ergometer',
    slug: 'pgx-air-resistance-ski-ergometer',
    sku: 'PGX-SKI-01',
    categorySlug: 'cardio-equipment',
    price: 1199.0,
    comparePrice: 1399.0,
    stock: 18,
    weight: '38 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: `Resistance: Dynamic Air Damper with 10 Airflow Aperture Settings\nDrive: High-Strength Lightweight Kevlar Drive Cords\nHandles: Ergonomic Strapless Moisture-Proof Grips\nConsole: Backlit PM5-Style Matrix Display (Watts, Pace, Calories, Bluetooth FTMS)\nMounting: Free-Standing Floor Stand (Included) or Direct Wall Mount\nFootprint: 60 x 127 x 216 cm with Floor Stand\nWarranty: 5-Year Frame, 2-Year Electronics & Cords`,
    description: `<h2>Explosive Upper-Body Conditioning: PGX Commercial Ski Ergometer</h2><p>Build core stamina, lats, triceps, and cardiovascular threshold with the <strong>PGX Commercial Ski Ergometer</strong>. Replicating the biomechanics of Nordic cross-country skiing, this machine provides an intense full-body calorie burn with zero joint compression.</p><h3>Key Features</h3><ul><li><strong>Precision Air Resistance Flywheel:</strong> The 10-level spiral damper lets you tailor air volume to mimic gentle flats or steep mountain climbs.</li><li><strong>High-Tensile Kevlar Drive Cords:</strong> Kevlar cords are significantly lighter and smoother than steel chains, providing instant response at top cadence.</li><li><strong>Advanced Matrix Console:</strong> Displays real-time wattage, stroke rate, calories burned, 500m split pace, and interval programming.</li><li><strong>Versatile Dual-Mount Architecture:</strong> Operates on the included heavy anti-slip steel floor stand or bolts directly to standard concrete/wood stud walls.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Commercial Air Resistance Ski Ergometer in Modern Gym'
      }
    ]
  },
  {
    name: 'PGX Curved Commercial Non-Motorized Treadmill',
    slug: 'pgx-curved-commercial-non-motorized-treadmill',
    sku: 'PGX-CURV-01',
    categorySlug: 'cardio-equipment',
    price: 2299.0,
    comparePrice: 2699.0,
    stock: 15,
    weight: '145 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: `Drive: 100% Self-Powered Kinetic Track (Zero Electricity Consumption)\nRunning Surface: 60 Aluminum Reinforced Rubber Slats\nResistance: 4-Stage Magnetic Resistance Lever (Run, Sled Push, Walk, Sprint)\nCalorie Burn: Up to 30% Higher Than Motorized Treadmills\nMax Speed: Unlimited Athlete-Driven Velocity\nMax User Weight: 180 kg (400 lbs)\nWarranty: 10-Year Frame, 5-Year Slat Belt, 2-Year Console`,
    description: `<h2>Zero Electricity, Unlimited Speed: PGX Curved Non-Motorized Treadmill</h2><p>Experience natural human locomotion with the <strong>PGX Curved Commercial Treadmill</strong>. Featuring an ergonomic curved slat-belt system powered purely by your stride, this machine promotes natural midfoot striking, recruits posterior chain muscles, and burns up to 30% more energy than standard treadmills.</p><h3>Key Features</h3><ul><li><strong>100% Athlete-Powered:</strong> No motor, no electrical plugs. You control acceleration, velocity, and braking instantaneously.</li><li><strong>Commercial Slat-Belt Design:</strong> Molded heavy-duty rubber slats glide over 112 sealed precision bearings with virtually zero friction.</li><li><strong>4-Level Multi-Drive Magnetic Brake:</strong> Shift into high resistance to simulate heavy sled pushes or reduce tension for maximum sprint intervals.</li><li><strong>Indestructible Commercial Chassis:</strong> Thick gauge powder-coated tubular steel frame built for high-traffic crossfit boxes and athletic academies.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Curved Commercial Non-Motorized Treadmill Training View'
      }
    ]
  },
  {
    name: 'PGX Commercial Counterbalanced Smith Machine',
    slug: 'pgx-commercial-counterbalanced-smith-machine',
    sku: 'PGX-SMTH-01',
    categorySlug: 'home-gym',
    price: 1899.0,
    comparePrice: 2299.0,
    stock: 12,
    weight: '180 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: `Angle: 7-Degree Biomechanical Natural Motion Incline\nBearings: High-Precision Linear Recirculating Ball Bearings\nCounterbalance: Integrated Pulley Counterweight System (Starting Weight: 5 kg)\nLockouts: 14 Laser-Cut Safety Hooks with Heavy Spring Collars\nStorage: 6 Integrated Stainless Olympic Weight Horns\nCapacity: 450 kg (1000 lbs) Maximum Bar Load\nWarranty: Lifetime Frame, 5-Year Moving Parts`,
    description: `<h2>Safe Solo Heavy Lifting: PGX Commercial Counterbalanced Smith Machine</h2><p>Push your physical limits with total confidence using the <strong>PGX Counterbalanced Smith Machine</strong>. Engineered with an authentic 7-degree biomechanical track and counterweighted internal pulleys, this station relieves starting resistance down to just 5 kg, making it ideal for both explosive warm-ups and max-effort bench presses and squats.</p><h3>Key Highlights</h3><ul><li><strong>Linear Bearing Fluidity:</strong> Hardened steel guide rods paired with industrial linear ball bearings guarantee silky smooth travel with zero binding.</li><li><strong>7-Degree Physiological Path:</strong> Mirrors the natural biomechanical arc of upper and lower body movements for safer shoulder and knee kinematics.</li><li><strong>Dual Adjustable Safety Stops:</strong> Heavy-gauge spring-loaded safety stops protect lifters from failed reps without relying on a human spotter.</li><li><strong>Olympic Plate Storage:</strong> Six stainless steel pegs keep your bumper and iron plates organized directly on the machine frame.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Commercial Counterbalanced Smith Machine & Cable System'
      }
    ]
  },
  {
    name: 'PGX Olympic Hex Trap Deadlift Bar with Dual Knurled Grips',
    slug: 'pgx-olympic-hex-trap-bar',
    sku: 'PGX-TRP-01',
    categorySlug: 'strength-equipment',
    price: 219.0,
    comparePrice: 269.0,
    stock: 40,
    weight: '25 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: `Sleeves: Olympic 50 mm (2-Inch) Hard Chrome Rotating Sleeves\nHandles: Dual-Height Raised & Flush 32mm Diamond Knurled Grips\nCapacity: 350 kg (770 lbs) Max Load Rating\nGeometry: Open-Hex Walk-Through Architecture for Unrestricted Lunges\nFinish: Matte Black Zinc Body with Hardened Chrome Sleeves\nWarranty: 5-Year Structural Integrity Warranty`,
    description: `<h2>Save Your Spine, Maximize Output: PGX Olympic Hex Trap Bar</h2><p>The <strong>PGX Olympic Hex Trap Bar</strong> aligns the center of gravity directly through your hips and spine, drastically reducing shearing forces on the lumbar vertebrae during heavy deadlifts, shrugs, and farmer carries.</p><h3>Key Features</h3><ul><li><strong>Dual-Height Knurled Grips:</strong> Alternate between high handles for partial-range deadlifts and low handles for standard Olympic floor pulls.</li><li><strong>Walk-Through Open Frame:</strong> Allows deep lunges, farmer walks, and overhead presses without shin interference.</li><li><strong>Machined 50mm Olympic Sleeves:</strong> Compatible with all standard Olympic cast iron and rubber bumper plates.</li><li><strong>Built-In Barbell Jack:</strong> Designed with integrated floor feet so you can slide plates on and off in seconds without straining.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Olympic Hex Trap Deadlift Bar with Heavy Weights'
      }
    ]
  },
  {
    name: 'PGX High-Impact Commercial Olympic Bumper Plates Set (100kg)',
    slug: 'pgx-commercial-bumper-plates-set',
    sku: 'PGX-BMP-100',
    categorySlug: 'strength-equipment',
    price: 499.0,
    comparePrice: 599.0,
    stock: 30,
    weight: '100 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: `Set Composition: 2x 20kg, 2x 15kg, 2x 10kg, 2x 5kg Bumper Plates\nRubber: 100% High-Density Virgin Vulcanized Rubber\nCenter Hub: Precision Stamped Stainless Steel Co-Molded Ring\nDurometer: 88 Shore A (Dead Bounce Formula to Protect Platforms)\nDiameter: Standard 450 mm IWF Outer Diameter\nWarranty: 3-Year Drop Warranty`,
    description: `<h2>Dead-Bounce Durability: PGX High-Impact Commercial Bumper Plates</h2><p>Manufactured from premium vulcanized virgin rubber, the <strong>PGX Commercial Bumper Plates Set</strong> delivers a true dead-bounce when dropped from overhead, protecting both your Olympic barbells and lifting platforms from shock damage.</p><h3>Key Highlights</h3><ul><li><strong>100% Virgin Rubber Composition:</strong> Produces minimal bounce and zero toxic solvent odors common in recycled rubber plates.</li><li><strong>Co-Molded Stainless Steel Inserts:</strong> Precision 50.4mm inner ring anchored deep into the rubber core prevents hub separation under repeated drops.</li><li><strong>Consistent 450mm Diameter:</strong> Distributes load evenly across all plates on the barbell sleeve for uniform impact.</li><li><strong>Debossed Matte Lettering:</strong> Clean contrasting white weight markings will never rub off or fade over time.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX High-Impact Commercial Olympic Bumper Plates on Barbell'
      }
    ]
  },
  {
    name: 'PGX Elite Commercial Revolving Stair Climber / Stepmill',
    slug: 'pgx-elite-commercial-stair-climber',
    sku: 'PGX-STR-01',
    categorySlug: 'cardio-equipment',
    price: 3299.0,
    comparePrice: 3899.0,
    stock: 10,
    weight: '170 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: `Stair Dimensions: 53 cm (W) x 25 cm (D) x 20 cm (H) Deep Stairs\nSpeed Range: 24 to 164 Steps Per Minute (20 Resistance Levels)\nDrive: Industrial ECB Eddy Current Magnetic Brake with Heavy Chain\nConsole: 15.6" HD Touchscreen with Virtual Climbing Landmarks\nSafety: Optical Infrared Safety Stop Sensors at Base\nMax User Weight: 180 kg (400 lbs)\nWarranty: 5-Year Frame, 3-Year Motor & Transmission, 2-Year Console`,
    description: `<h2>Peak Lower-Body Conditioning: PGX Elite Revolving Stair Climber</h2><p>Torch calories while sculpting glutes, quads, and calves with the <strong>PGX Elite Commercial Stair Climber</strong>. Built with heavy-duty commercial steps, an eddy-current electromagnetic braking system, and interactive virtual climbing routes (Empire State Building, Eiffel Tower, Mount Everest).</p><h3>Key Features</h3><ul><li><strong>Full-Depth Commercial Steps:</strong> Revolving 20cm step height accommodates larger shoe sizes with textured anti-slip treads.</li><li><strong>Infrared Auto-Stop Sensor:</strong> Instantly halts stair rotation if an object or foot breaks the lower safety light beam.</li><li><strong>Multi-Grip Ergonomic Handrails:</strong> Integrated heart rate pulse sensors, thumb resistance controls, and phone/tablet ledge.</li><li><strong>High-Torque Drive Transmission:</strong> Engineered for 24/7 commercial gym utilization with quiet low-maintenance operation.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Elite Commercial Stair Climber in Club Studio'
      }
    ]
  },
  {
    name: 'PGX Heavy-Duty Battle Ropes with Protective Ballistic Sleeve (50ft)',
    slug: 'pgx-heavy-duty-battle-ropes',
    sku: 'PGX-BTL-50',
    categorySlug: 'accessories',
    price: 119.0,
    comparePrice: 149.0,
    stock: 45,
    weight: '14 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: `Length & Thickness: 50 Feet (15.2 Meters) x 2.0-Inch (50 mm) Diameter\nMaterial: 100% High-Density Multi-Strand Poly-Dacron\nProtection: Full-Length Ballistic 840D Nylon Sleeve\nHandles: 9.5" Extra-Long Heat-Shrink Ergonomic Handles\nIncluded: Heavy Steel Wall/Floor Anchor Bracket with Concrete Bolts\nWarranty: 2-Year Anti-Fraying Replacement Warranty`,
    description: `<h2>Explosive Conditioning & Core Power: PGX 50ft Heavy-Duty Battle Ropes</h2><p>Deliver devastating metabolic waves, slams, and spirals with the <strong>PGX 50ft Commercial Battle Rope</strong>. Braided with 100% industrial poly-dacron fibers and fully encased in an abrasion-resistant ballistic nylon protective sleeve to prevent fraying on concrete and turf.</p><h3>Key Highlights</h3><ul><li><strong>100% Poly-Dacron Heavy Weave:</strong> Provides fluid wave undulations without stiff kinks or shed fibers.</li><li><strong>Full-Coverage Protective Sheath:</strong> Shields internal fibers against friction wear on outdoor asphalt, gravel, or gym turf.</li><li><strong>Heat-Shrink Ergonomic Grips:</strong> Textured 9.5-inch non-slip grips protect lifters from blisters and guarantee secure control.</li><li><strong>Heavy Steel Anchor Included:</strong> High-tensile steel mounting kit allows secure anchoring in seconds.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX Heavy-Duty Battle Ropes Wave Conditioning'
      }
    ]
  },
  {
    name: 'PGX 3-in-1 High-Density Foam Plyometric Jump Box',
    slug: 'pgx-3in1-foam-plyometric-box',
    sku: 'PGX-PLY-01',
    categorySlug: 'accessories',
    price: 159.0,
    comparePrice: 199.0,
    stock: 30,
    weight: '16 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: `Heights: 3 Heights in 1 Box (20", 24", 30" / 50cm, 60cm, 75cm)\nCore: High-Density Solid Compressed EVA Foam (Zero Sag or Deformity)\nCover: Commercial Textured 1000D Anti-Slip Vinyl with Zipper Closure\nSafety: Soft Impact Absorbing Edges (Guaranteed Zero Shin Scrapes)\nMax Load: 200 kg (440 lbs) Jumper Weight Rating\nWarranty: 3-Year Core Resiliency Warranty`,
    description: `<h2>Explosive Power with Zero Shin Scrapes: PGX 3-in-1 Foam Plyo Box</h2><p>Unlock explosive vertical jump height and bounding power with the <strong>PGX 3-in-1 Foam Plyometric Box</strong>. Unlike traditional wooden or metal boxes that cause painful scraped shins on missed jumps, this dense EVA foam absorbs impact while maintaining firm landing stability.</p><h3>Key Features</h3><ul><li><strong>3 Adjustable Heights:</strong> Rotate the box to alternate between 20\", 24\", or 30\" heights to progress jumping power.</li><li><strong>Ultra-Dense Foam Core:</strong> Premium dense composite core won't collapse, buckle, or tip over under heavy athletic landings.</li><li><strong>Heavy Anti-Slip Textured Cover:</strong> Tear-resistant vinyl wipes clean easily and provides maximum shoe traction.</li><li><strong>Zero-Injury Confidence:</strong> Allows athletes to jump at maximum intensity without the psychological fear of missed jumps.</li></ul>`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
        alt: 'PGX 3-in-1 Foam Plyometric Jump Box in Training Facility'
      }
    ]
  }
];

async function main() {
  console.log('🚀 Seeding 10 additional professional fitness equipment products...');

  // Map category slugs to DB IDs
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.slug, c.id]));

  let count = 0;
  for (const item of newProducts) {
    const categoryId = catMap.get(item.categorySlug) || catMap.get('strength-equipment') || categories[0].id;

    const upserted = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        sku: item.sku,
        price: item.price,
        comparePrice: item.comparePrice,
        stock: item.stock,
        weight: item.weight,
        shortDesc: item.shortDesc,
        description: item.description,
        isFeatured: item.isFeatured,
        isHot: item.isHot,
        categoryId: categoryId,
        isActive: true
      },
      create: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        price: item.price,
        comparePrice: item.comparePrice,
        stock: item.stock,
        weight: item.weight,
        shortDesc: item.shortDesc,
        description: item.description,
        isFeatured: item.isFeatured,
        isHot: item.isHot,
        categoryId: categoryId,
        isActive: true
      }
    });

    // Delete existing images for this product & insert new verified images
    await prisma.productImage.deleteMany({
      where: { productId: upserted.id }
    });

    for (let i = 0; i < item.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: upserted.id,
          url: item.images[i].url,
          alt: item.images[i].alt,
          sortOrder: i + 1
        }
      });
    }

    count++;
    console.log(`✅ [${count}/${newProducts.length}] Seeded: "${item.name}" (SKU: ${item.sku})`);
  }

  const total = await prisma.product.count();
  console.log(`\n🎉 Done! Added 10 new products. Total catalog count is now: ${total} products.`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding new products:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
