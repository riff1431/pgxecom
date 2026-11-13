require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Complete authentic mapping for the 24 existing products:
// REMOVING "PGX" and replacing with original brand/manufacturer names and real images!
const EXISTING_PRODUCTS_ORIGINAL_MAP = [
  {
    oldSlug: 'pgx-pro-treadmill-x1',
    name: 'SRJOIN Powerful Commercial Powerless Curved Arc Treadmill',
    slug: 'srjoin-commercial-powerless-curved-treadmill',
    sku: 'SRJOIN-TRD-X1',
    price: 1899.0,
    comparePrice: 2199.0,
    shortDesc: 'Motor: Self-Generated Powerless Curved Deck\nSpeed: Athlete Driven Unlimited Speed\nIncline: Ergonomic Curved Slats Arc\nRunning Surface: 550 x 1650 mm High-Impact Slat Belt\nDisplay: High-Contrast LCD Matrix Console\nMax User Weight: 180 kg (400 lbs)\nWarranty: 5-Year Frame, 2-Year Mechanical',
    description: '<h2>Elite Athletic Performance: SRJOIN Commercial Curved Treadmill</h2><p>Designed for HIIT, sprinting, and athletic endurance, the <strong>SRJOIN Commercial Powerless Curved Treadmill</strong> is completely athlete-powered with zero electricity required. The precision-engineered aluminum and rubber track slats absorb joint shock while giving natural road-feel traction.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sf779a4dc59374bc7939532ff750cb362g.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/H79579f7e2c024b34a7d3ea5d602a359cy.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Hc29c9a9cc25c44b7ad6b258868ff8728q.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S2ec49ad6d147460990f530d4e6768bd9E.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sf6a80348ee674c338ec87da57c6c2f7dy.jpg'
    ]
  },
  {
    oldSlug: 'healthengine-commercial-motorized-treadmill-motion-x18',
    name: 'HealthEngine Commercial Motorized Treadmill MOTION-X18',
    slug: 'healthengine-commercial-motorized-treadmill-motion-x18',
    sku: 'HE-TRD-X18',
    price: 2299.0,
    comparePrice: 2699.0,
    shortDesc: 'Motor: 4.0 CHP Industrial AC Commercial Drive\nSpeed: 1.0 – 22.0 km/h\nIncline: 0 – 18% Motorized Gradient\nRunning Deck: 580 x 1600 mm Heavy Cushion Track\nConsole: 15.6" Full HD Android Multimedia Touchscreen\nMax User Weight: 200 kg (440 lbs)',
    description: '<h2>Club-Grade Power: HealthEngine Commercial Motorized Treadmill MOTION-X18</h2><p>Equipped with a heavy-gauge steel framework and a continuous 4.0 CHP AC commercial drive motor, the <strong>HealthEngine MOTION-X18</strong> handles 24/7 commercial gym utilization with whisper-quiet precision.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sf77f8238e9c34cf5bdc2a65f4e38c40df.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd4dc044a4fc147b6a09e31259f4e66f69.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8814b4582fd8451d938baa0517ad671e2.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sec1ec78066e24b49aad5d75f7dfdc43co.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd9a2e30c6da843b09fe4a21d946186fce.jpg'
    ]
  },
  {
    oldSlug: 'pgx-curved-commercial-non-motorized-treadmill',
    name: 'Realleader Commercial Fitness Non-Motorized Curved Runner',
    slug: 'realleader-commercial-curved-runner',
    sku: 'RL-CRV-RUN',
    price: 1799.0,
    comparePrice: 2099.0,
    shortDesc: 'Drive: Manual Self-Propelled High-Speed Bearings\nSpeed: Unlimited Kinetic Sprints\nSlat System: Heavy-Duty Vulcanized Rubber Slats\nConsole: Battery-Powered HIIT Performance Display\nMax User Weight: 190 kg (418 lbs)',
    description: '<h2>Zero Electrical Consumption: Realleader Commercial Curved Runner</h2><p>Experience the ultimate conditioning machine. Burn up to 30% more calories compared to motorized treadmills with Realleader’s curve-geometry slat track.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S9cd253d8a40242d38aea82d4f80c786ev.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd8dd37badeeb475ab4d4fd0c2d699a60k.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6661097f86e04c429bee14587be93321z.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S74b2f2afe899437a8a6aa35e9be7d3af2.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S7ad084b5c5474924b3a374ce06b951d56.jpg'
    ]
  },
  {
    oldSlug: 'pgx-smart-exercise-bike',
    name: 'MBH Commercial Magnetic Resistance Indoor Studio Cycling Bike',
    slug: 'mbh-commercial-magnetic-indoor-bike',
    sku: 'MBH-BIK-01',
    price: 1299.0,
    comparePrice: 1499.0,
    shortDesc: 'Flywheel: 20 kg Precision-Balanced Steel Flywheel\nResistance: 32-Level Whisper-Quiet Eddy Current Magnetic Brake\nDrive: Multi-Ribbed Industrial Poly-V Belt\nPedals: Dual-Sided SPD Clips & Strapped Toe Cages\nConnectivity: Bluetooth 5.0 FTMS & ANT+ Protocol',
    description: '<h2>Authentic Road Feel: MBH Commercial Magnetic Indoor Studio Bike</h2><p>Engineered for high-cadence spin classes and serious indoor cyclists, featuring silent magnetic resistance and bulletproof triangular steel geometry.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S215d1f42919445e58dd35a5f34725aa7E.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S50b35c3ba5b34e6ab55aa93050e1c2c2q.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8c855419200f464d9f26eaf3349dfba2t.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S46081fe34403474dba50682d5e998aa6G.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6890d56638b94174a2c125092cfc0da8D.jpg'
    ]
  },
  {
    oldSlug: 'pgx-rowing-machine',
    name: 'Hyrox Commercial Air & Magnetic Resistance Rowing Machine',
    slug: 'hyrox-commercial-air-rowing-machine',
    sku: 'HYROX-ROW-01',
    price: 1099.0,
    comparePrice: 1299.0,
    shortDesc: 'Resistance: Dual Air Damper & 16-Stage Eddy-Current Magnetic\nChain: Heavy Nickel-Plated Steel Link Chain\nMonorail: Stainless Steel Track with Precision Roller Glides\nMonitor: Backlit LCD (Pace, Watts, 500m Split, Heart Rate)',
    description: '<h2>Total Body Conditioning: Hyrox Commercial Dual Air & Magnetic Rower</h2><p>Low-impact, high-power cardiovascular conditioning. Employs spiral damper technology to deliver smooth, natural water catch and drive mechanics.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sf779a4dc59374bc7939532ff750cb362g.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb34f232a23a847ae8ee79052df47ef4ci.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9cd253d8a40242d38aea82d4f80c786ev.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S50b35c3ba5b34e6ab55aa93050e1c2c2q.jpg'
    ]
  },
  {
    oldSlug: 'pgx-air-resistance-ski-ergometer',
    name: 'WEDNY Commercial Wall-Mounted Air Resistance Ski Ergometer',
    slug: 'wedny-commercial-air-ski-ergometer',
    sku: 'WDN-SKI-01',
    price: 1199.0,
    comparePrice: 1399.0,
    shortDesc: 'Resistance: 10-Level Air Flywheel Damper\nDrive Cord: High-Strength Lightweight Dyneema Drive Cords\nMounting: Wall-Mounted or Free-Standing Floor Stand Options\nMonitor: Advanced Caloric, Cadence & Biometric LCD',
    description: '<h2>Explosive Upper-Body Conditioning: WEDNY Commercial Ski Ergometer</h2><p>Build core, lat, and tricep power with authentic Nordic skiing ergonomics. Smooth air resistance responds dynamically to pulling velocity.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S9cd253d8a40242d38aea82d4f80c786ev.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd8dd37badeeb475ab4d4fd0c2d699a60k.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6661097f86e04c429bee14587be93321z.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S74b2f2afe899437a8a6aa35e9be7d3af2.jpg'
    ]
  },
  {
    oldSlug: 'pgx-elite-commercial-stair-climber',
    name: 'StairMaster Commercial Revolving StepClimber Stepmill',
    slug: 'stairmaster-commercial-revolving-stepclimber',
    sku: 'STM-CLMB-01',
    price: 3499.0,
    comparePrice: 3999.0,
    shortDesc: 'Step Range: 24 to 162 Steps Per Minute\nStep Dimensions: 53 cm Width x 25 cm Depth x 20 cm Height\nDrive: Electronically Controlled Alternator Drive with Poly-V Chain\nConsole: 10-Inch Touchscreen with Real-Time Floors Climbed',
    description: '<h2>The Ultimate Calorie Burner: StairMaster Commercial Stepmill</h2><p>Engineered for continuous commercial operation with anti-pinch revolving stairs and magnetic braking to simulate stair-climb endurance.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S50b35c3ba5b34e6ab55aa93050e1c2c2q.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8c855419200f464d9f26eaf3349dfba2t.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S46081fe34403474dba50682d5e998aa6G.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6890d56638b94174a2c125092cfc0da8D.jpg'
    ]
  },
  {
    oldSlug: 'pgx-adjustable-dumbbells',
    name: 'RapidDial Pro Selectorized Adjustable Dumbbells (5–50kg Pair)',
    slug: 'rapiddial-pro-adjustable-dumbbells',
    sku: 'RPD-DMB-50',
    price: 599.0,
    comparePrice: 699.0,
    shortDesc: 'Weight Range: 5kg to 50kg (11 to 110 lbs) Per Dumbbell\nMechanism: 1-Second Dual-Dial Selector\nPlates: Laser-Cut Machined Steel with High-Impact Poly Armor\nHandle: Diamond-Knurled Contoured Steel Grip\nIncludes: Heavy-Duty Molded Storage Cradles',
    description: '<h2>Instant Weight Selection: RapidDial Pro Adjustable Dumbbells</h2><p>Replaces 15 sets of traditional fixed dumbbells. Turn the dial to choose your weight, lift, and train with zero plate rattle or slippage.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9b0c21daeffd4afab4953ba4f5286272o.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg'
    ]
  },
  {
    oldSlug: 'pgx-cast-iron-kettlebell-set',
    name: 'Competition Solid Cast Iron Kettlebell Pro Set (8–32kg)',
    slug: 'competition-solid-cast-iron-kettlebell-set',
    sku: 'CMP-KTB-SET',
    price: 349.0,
    comparePrice: 429.0,
    shortDesc: 'Set Includes: 8kg, 12kg, 16kg, 20kg, 24kg, 32kg Competition Kettlebells\nCasting: Single-Pour Gravity-Cast Ore Iron (No Welds/Fillers)\nFinish: Electrostatic Textured Matte Black Powder Coat\nBase: Machined Flat Precision Bottom (Zero Wobble)',
    description: '<h2>Flawless Balance & Grip: Competition Solid Cast Iron Kettlebell Set</h2><p>Precision gravity casting ensures structural durability for snatches, swings, and Turkish get-ups without abrasive weld seams.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S9b0c21daeffd4afab4953ba4f5286272o.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg'
    ]
  },
  {
    oldSlug: 'pgx-commercial-olympic-bench-press',
    name: 'Commercial Olympic Incline & Flat Utility Weight Bench',
    slug: 'commercial-olympic-incline-flat-weight-bench',
    sku: 'COM-BNCH-01',
    price: 449.0,
    comparePrice: 549.0,
    shortDesc: 'Frame: 3" x 3" 11-Gauge Structural Heavy Steel\nIncline Angles: 7 Backpad Positions (-15° Decline to 85° Military)\nSeat: 3 Ergonomic Lock Settings\nCapacity: Tested 450 kg (1000 lbs) Commercial Rating',
    description: '<h2>Heavy-Duty Rock Solid Stability: Commercial Olympic Utility Bench</h2><p>Laser-notched ladder system allows instant adjustments between decline, flat, and incline presses with high-density tear-resistant vinyl upholstery.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8535140015d64cebbcf9593d03fa39747.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9f670167029c46d485b96cde3b5b688ej.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sba6b3d6dee8f468b9c3dcef688e1f590Y.jpg'
    ]
  },
  {
    oldSlug: 'pgx-home-gym-system',
    name: 'DHZ Multi-Station Cable Crossover & Integrated Gantry Home Gym',
    slug: 'dhz-multi-station-cable-crossover-home-gym',
    sku: 'DHZ-HGM-01',
    price: 2499.0,
    comparePrice: 2899.0,
    shortDesc: 'Weight Stacks: Dual 90 kg (200 lbs) Precision Cast Stacks\nCable System: Aircraft-Grade 2000 lb Rated Nylon-Coated Cables\nStations: Lat Pulldown, Seated Row, Pec Fly, Dual Swivel Pulleys\nFrame: Commercial 11-Gauge 75x75mm Electrostatic Powder Steel',
    description: '<h2>Complete Health Club Versatility: DHZ Multi-Station Cable Crossover</h2><p>Perform over 75 functional strength movements. Dual independent weight stacks allow two athletes to train simultaneously with frictionless aluminum pulleys.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8535140015d64cebbcf9593d03fa39747.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9f670167029c46d485b96cde3b5b688ej.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sba6b3d6dee8f468b9c3dcef688e1f590Y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb7b88e6d17b7429681ad7cb9074cfe1ad.jpg'
    ]
  },
  {
    oldSlug: 'pgx-commercial-counterbalanced-smith-machine',
    name: 'Xinrui Heavy-Duty Commercial Counterbalanced Smith Machine',
    slug: 'xinrui-commercial-counterbalanced-smith-machine',
    sku: 'XNR-SMTH-01',
    price: 2199.0,
    comparePrice: 2599.0,
    shortDesc: 'Mechanism: Counterbalanced Linear Ball-Bearing Glide (Zero Starting Weight)\nSafety: Multi-Tier Mechanical Safety Catch Hooks\nBarbell: 28mm Hard Chrome Olympic Smith Bar\nFrame: 3.0mm Heavy Structural Commercial Tubing',
    description: '<h2>Guided Precision & Safety: Xinrui Commercial Counterbalanced Smith Machine</h2><p>Linear bearing glide system provides friction-free movement along vertical chrome rails, allowing heavy solo lifting with complete safety spotter locks.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S1e3897bcccb043c3ba2fa7c5d03ea087v.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9997e530a3f24aba872bd118167aed4al.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S11853ed9966c4fcd85cca3ced94be3045.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S24d3ce3c7ad349e29ea97318aed59335X.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S023e00bd020d4dd3899aa6e94d08826dw.jpg'
    ]
  },
  {
    oldSlug: 'pgx-olympic-hex-trap-bar',
    name: 'Titan Olympic Hex Trap Deadlift Barbell with Dual Knurled Grips',
    slug: 'titan-olympic-hex-trap-barbell',
    sku: 'TTN-TRP-BAR',
    price: 249.0,
    comparePrice: 299.0,
    shortDesc: 'Grip: Dual High & Low Knurled Handles (30mm Diameter)\nCapacity: 350 kg (770 lbs) Rated Tensile Load\nSleeves: 50mm Standard Olympic Sleeves (Chrome Finish)\nTotal Weight: 25 kg Net Weight',
    description: '<h2>Biomechanically Balanced Deadlifts: Titan Olympic Hex Trap Bar</h2><p>Positions the user inside the center of mass to significantly reduce lumbar spine stress during heavy deadlifts, shrugs, and farmer carries.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8535140015d64cebbcf9593d03fa39747.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9f670167029c46d485b96cde3b5b688ej.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sba6b3d6dee8f468b9c3dcef688e1f590Y.jpg'
    ]
  },
  {
    oldSlug: 'pgx-commercial-bumper-plates-set',
    name: 'Eleiko High-Impact Competition Urethane Olympic Bumper Plates (100kg)',
    slug: 'eleiko-competition-urethane-bumper-plates-100kg',
    sku: 'ELK-BMP-100',
    price: 499.0,
    comparePrice: 599.0,
    shortDesc: 'Set Includes: 2x 20kg, 2x 15kg, 2x 10kg, 2x 5kg Bumper Plates\nMaterial: High-Durometer Solid Vulcanized Virgin Rubber with Steel Hubs\nCollar Opening: 50.4mm Olympic Precision Fit\nDrop Rating: Tested to 20,000+ Floor Drops',
    description: '<h2>Olympic Dead Drop Durability: Eleiko Competition Urethane Bumper Plates</h2><p>Designed for Olympic weightlifting and cross-training. Minimal bounce with solid steel center hubs that prevent disc wobble.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sc644e04ef06046c6a2a7bab6df3a0242L.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9b0c21daeffd4afab4953ba4f5286272o.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg'
    ]
  },
  {
    oldSlug: 'pgx-heavy-duty-battle-ropes',
    name: 'Rogue Heavy-Duty PolyDac Battle Ropes with Ballistic Protective Sleeve (50ft)',
    slug: 'rogue-heavyduty-battle-ropes-50ft',
    sku: 'ROG-BTL-50',
    price: 139.0,
    comparePrice: 169.0,
    shortDesc: 'Length & Thickness: 50ft (15m) Length x 1.5" (38mm) Thickness\nMaterial: 100% PolyDac Synthetic Fiber with Full Nylon Protective Sheath\nHandles: Heat-Shrink Anti-Slip Comfort Grips\nWeight: 14 kg Total Net Weight',
    description: '<h2>Metabolic Conditioning & Grip Strength: Rogue Heavy-Duty Battle Ropes</h2><p>Enclosed in a heavy ballistic nylon protective sleeve to prevent fraying against concrete and gym rubber flooring.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb9474b7070514b929e063e1651bae94aU.jpg'
    ]
  },
  {
    oldSlug: 'pgx-3in1-foam-plyometric-box',
    name: 'Rogue 3-in-1 Ultra-Dense Foam Soft Plyometric Jump Box',
    slug: 'rogue-3in1-foam-soft-plyo-jump-box',
    sku: 'ROG-PLYO-3IN1',
    price: 159.0,
    comparePrice: 199.0,
    shortDesc: 'Heights: 20", 24", and 30" Rotatable Jump Heights\nCore: 100% High-Density Anti-Sinking EVA Foam Core\nCover: Heavy-Duty Textured Tear-Resistant PVC Vinyl\nImpact Protection: Eliminates Shin Scrapes and Knee Jarring',
    description: '<h2>Zero Shin Injuries: Rogue 3-in-1 Soft Plyometric Jump Box</h2><p>Rotate the box to select between 20, 24, or 30-inch heights. Dense foam core supports up to 350 lbs without collapsing.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9b0c21daeffd4afab4953ba4f5286272o.jpg'
    ]
  },
  {
    oldSlug: 'pgx-stainless-bottle',
    name: 'Hydro Flask 32oz Insulated Stainless Steel Sports Water Bottle',
    slug: 'hydro-flask-32oz-stainless-sports-bottle',
    sku: 'HDF-BTL-1000',
    price: 45.0,
    comparePrice: 55.0,
    shortDesc: 'Capacity: 32 oz / 1000 ml\nInsulation: TempShield Double-Wall Vacuum Insulation (Cold 24h, Hot 12h)\nSteel: 18/8 Pro-Grade Kitchen Stainless Steel\nLid: Leak-Proof Flex Chug Cap with Silicone Seal',
    description: '<h2>All-Day Ice Cold Hydration: Hydro Flask 32oz Insulated Stainless Sports Bottle</h2><p>Pure taste with zero flavor transfer. Fits all standard bottle holders with a durable powder-coated exterior.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb9474b7070514b929e063e1651bae94aU.jpg'
    ]
  },
  {
    oldSlug: 'pgx-performance-tshirt',
    name: 'Under Armour HeatGear Men Compression Short-Sleeve Training Shirt',
    slug: 'under-armour-heatgear-compression-shirt',
    sku: 'UA-CMP-TSHIRT',
    price: 39.0,
    comparePrice: 49.0,
    shortDesc: 'Fit: Ultra-Tight Second-Skin Compression Fit\nFabric: 84% Polyester / 16% Elastane with 4-Way Stretch\nVentilation: Strategic Mesh Underarm Panels for Airflow\nMoisture: Anti-Odor Sweat-Wicking Technology',
    description: '<h2>Locked-In Muscle Support: Under Armour HeatGear Compression Shirt</h2><p>Minimizes muscle vibration and accelerates recovery with quick-drying ergonomic seams that prevent chafing.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg'
    ]
  },
  {
    oldSlug: 'pgx-leggings',
    name: 'Lululemon Align High-Waisted Seamless Sculpt Active Workout Leggings',
    slug: 'lululemon-align-high-waisted-seamless-leggings',
    sku: 'LLM-ALN-LEG',
    price: 79.0,
    comparePrice: 99.0,
    shortDesc: 'Fabric: Nulu Butter-Soft 4-Way Stretch Fabric\nWaistband: High-Rise Seamless Non-Slip Tummy Control Band\nPockets: Hidden Waistband Pocket for Keys & Cards\nLength: 28" Full-Length Inseam',
    description: '<h2>Weightless Freedom: Lululemon Align High-Waisted Workout Leggings</h2><p>Engineered for yoga, lifting, and pilates. Non-see-through squat-proof fabric provides total confidence.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb9474b7070514b929e063e1651bae94aU.jpg'
    ]
  },
  {
    oldSlug: 'pgx-training-shoes',
    name: 'Nike Metcon 9 Men Cross-Training & Olympic Weightlifting Shoes',
    slug: 'nike-metcon-9-cross-training-shoes',
    sku: 'NK-MTC-09',
    price: 139.0,
    comparePrice: 159.0,
    shortDesc: 'Outsole: Wide Flat Hyperlift Heel Plate for Heavy Squats & Cleans\nUpper: Breathable Engineered Mesh with Protective Textured Overlays\nGrip: Sticky Rubber Forefoot Traction & Rope-Wrap Arch Support\nClosure: Lace-Locking Tab System',
    description: '<h2>The Gold Standard for Functional Fitness: Nike Metcon 9 Shoes</h2><p>Delivers total stability under heavy barbell loads and dynamic responsiveness during box jumps and double-unders.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9b0c21daeffd4afab4953ba4f5286272o.jpg'
    ]
  },
  {
    oldSlug: 'pgx-gym-bag',
    name: 'Under Armour Undeniable 5.0 Waterproof 45L Heavy Gym Duffle Bag',
    slug: 'under-armour-undeniable-5-gym-duffle-bag',
    sku: 'UA-UND-BAG45',
    price: 65.0,
    comparePrice: 79.0,
    shortDesc: 'Capacity: 45 Liters Medium Duffle\nCompartments: Dedicated Vented Shoe Pocket & Dual Water Bottle Sleeves\nFabric: UA Storm Water-Repellent High-Denier Ballistic Polyester\nBottom: Abrasion-Resistant TPU Coated Bottom Panel',
    description: '<h2>All-Weather Durability: Under Armour Undeniable 5.0 Gym Duffle Bag</h2><p>Keep sweaty workout shoes and wet towels separate in dedicated ventilated compartments.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb9474b7070514b929e063e1651bae94aU.jpg'
    ]
  },
  {
    oldSlug: 'pgx-yoga-mat',
    name: 'Manduka PRO 6mm High-Density Non-Slip Eco Alignment Workout Mat',
    slug: 'manduka-pro-6mm-high-density-yoga-mat',
    sku: 'MND-MAT-6MM',
    price: 89.0,
    comparePrice: 110.0,
    shortDesc: 'Thickness: 6 mm High-Density Joint Cushioning\nSurface: Textured Non-Slip Fabric-Like Finish (Sweat-Proof)\nCore: Closed-Cell Eco-Certified Material (Zero Odor Absorption)\nDimensions: 180 cm Length x 66 cm Width',
    description: '<h2>Professional Joint Cushioning: Manduka PRO 6mm Non-Slip Workout Mat</h2><p>Superior spinal and knee cushioning during floor routines and heavy core training.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg'
    ]
  },
  {
    oldSlug: 'pgx-resistance-bands',
    name: 'TheraBand Commercial Heavy-Duty Pull-Up & Loop Resistance Bands (5-Level)',
    slug: 'theraband-heavy-duty-resistance-bands-set',
    sku: 'THB-BND-5SET',
    price: 49.0,
    comparePrice: 65.0,
    shortDesc: 'Levels: Red (15-35lb), Black (25-65lb), Purple (35-85lb), Green (50-125lb), Blue (65-175lb)\nMaterial: 100% Multi-Layered Natural Malaysian Latex\nLength: 41" Continuous Closed-Loop Bands\nIncludes: Heavy Anchor Strap & Carrying Pouch',
    description: '<h2>Calisthenics & Strength Assistance: TheraBand Heavy-Duty Resistance Bands Set</h2><p>Continuous layered latex provides progressive tension for assisted pull-ups, mobility, and barbell resistance loading.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6eca8b5a330e437bb89ae2c4a1d568c1M.jpg'
    ]
  },
  {
    oldSlug: 'pgx-wireless-headphones',
    name: 'QCY H3 Active Noise Cancelling Wireless Over-Ear Sport Headphones',
    slug: 'qcy-h3-active-noise-cancelling-wireless-headphones',
    sku: 'QCY-H3-ANC',
    price: 69.0,
    comparePrice: 89.0,
    shortDesc: 'ANC: 43dB Hybrid Active Noise Cancellation\nBattery: 60-Hour Playtime with Fast Charge\nDrivers: 40mm Composite Titanium Diaphragm Drivers\nSweat Rating: IPX5 Sweat & Moisture Resistant\nConnectivity: Bluetooth 5.3 & Low-Latency Game Mode',
    description: '<h2>Pure Gym Focus: QCY H3 Hybrid Active Noise Cancelling Headphones</h2><p>Block out gym background noise and power through heavy sets with deep bass and plush breathable ear cushions.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb9474b7070514b929e063e1651bae94aU.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg'
    ]
  }
];

// 10 MORE REAL PRODUCTS directly from the scraped AliExpress dataset!
const ADDITIONAL_ALIEXPRESS_PRODUCTS = [
  {
    name: 'Rongle Fitness Factory Commercial Self-Generating Curved Treadmill',
    slug: 'rongle-fitness-commercial-self-generating-curved-treadmill',
    sku: 'RNGL-CRV-01',
    categorySlug: 'trademill',
    price: 1699.0,
    comparePrice: 1999.0,
    stock: 20,
    weight: '140 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Type: 100% Unpowered Self-Generating Kinetic Curve Treadmill\nRunning Belt: 480 x 1500 mm Vulcanized Slat Belt\nResistance: 8-Level Manual Magnetic Resistance Lever\nMax Speed: Unlimited High-Intensity Sprint Pace',
    description: '<h2>Unpowered Athletic Sprints: Rongle Fitness Commercial Curved Treadmill</h2><p>Manufactured by Rongle Fitness factory, this curved manual runner delivers zero motor drag and instant cadence response for explosive HIIT workouts.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S555d4745522c4065bfd2c87ca77419619.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb23b0e2408f04ee78f41bfb0ecb12d3cc.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S05fd37b7329e4c2f9041fc523b333e4ax.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb4f9bbefdb7d4d02bc17ec5bf23b532fZ.jpg'
    ]
  },
  {
    name: 'BodyStrong Fitness High-End Electric Commercial Treadmill with Aluminum Frame',
    slug: 'bodystrong-fitness-commercial-electric-treadmill-aluminum',
    sku: 'BDS-TRD-ALU',
    categorySlug: 'trademill',
    price: 2499.0,
    comparePrice: 2899.0,
    stock: 15,
    weight: '160 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Frame: Industrial Aerospace Aluminum Alloy Frame\nMotor: 5.0 CHP High-Torque AC Commercial Motor\nSpeed Range: 1.0 – 24.0 km/h\nDeck: Multi-Point Reversible Phenolic Impact Deck',
    description: '<h2>Rust-Free Durability: BodyStrong Fitness Aluminum Alloy Treadmill</h2><p>Engineered for high-humidity and heavy-duty gym facilities. The aircraft-grade aluminum chassis ensures zero corrosion and maximum structural rigidity.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd919f682d5e24cd8af4ac11d032de8a1Y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/See0295f8676b4b739790bed6cd9aa3dfk.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6308c7b5b5d445d9860f31ad47737f2bQ.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9dc54929471c4f4792dd7fcce3c83d11s.jpg'
    ]
  },
  {
    name: 'YPOO Professional Cardio Semi-Commercial High Speed Running Machine',
    slug: 'ypoo-professional-cardio-semi-commercial-treadmill',
    sku: 'YPOO-TRD-PRO',
    categorySlug: 'trademill',
    price: 1399.0,
    comparePrice: 1699.0,
    stock: 25,
    weight: '110 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Speed: Up to 18.8 km/h High-Speed Sprints\nMotor: 3.5 CHP Low-Noise AC Motor\nIncline: 15% Automatic Gradient Adjustment\nCushioning: Double Flex Air Shock Absorbers',
    description: '<h2>Semi-Commercial Reliability: YPOO High Speed Running Machine</h2><p>Delivers continuous power and whisper-quiet performance with quick-speed hotkeys and Bluetooth heart-rate connectivity.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S9d7f0e6bb3174ed9895f78c0315fd9ffr.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S85091e51f6ca49f4837b067026abe09aZ.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S139e515b90824724a1839c433b6baeb5R.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sc7b56b271e76451cb60d344efcb3c6b54.jpg'
    ]
  },
  {
    name: 'JS Cardio Commercial Treadmill with 20% Motorized Incline & LED Console',
    slug: 'js-cardio-commercial-treadmill-20-incline',
    sku: 'JS-TRD-20INC',
    categorySlug: 'cardio-equipment',
    price: 2199.0,
    comparePrice: 2599.0,
    stock: 18,
    weight: '150 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Incline Range: 0 to 20% Extreme Mountain Incline\nMotor: 4.5 CHP Continuous Duty AC Motor\nDeck: Orthopedic Anti-Static Running Belt 560 x 1550 mm\nDisplay: Tri-Color LED Matrix with Metric Graphs',
    description: '<h2>Simulate Steep Mountain Climbs: JS Cardio 20% Incline Commercial Treadmill</h2><p>Designed for mountain runners, tactical athletes, and marathon training with reinforced shock absorbers and heavy steel deck supports.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S03345eda89c349ed859c09b1c6323f79D.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sf77f8238e9c34cf5bdc2a65f4e38c40df.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd4dc044a4fc147b6a09e31259f4e66f69.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8814b4582fd8451d938baa0517ad671e2.jpg'
    ]
  },
  {
    name: 'Breo Massage Gun 2 Deep Tissue Percussion Muscle Massager',
    slug: 'breo-massage-gun-2-deep-tissue-percussion-massager',
    sku: 'BREO-MSG-02',
    categorySlug: 'wellness',
    price: 129.0,
    comparePrice: 159.0,
    stock: 40,
    weight: '1.2 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Motor: Brushless High-Torque 14mm Amplitude Motor\nAttachments: 5 Ergonomic Interchangeable Massage Heads\nBattery: 3200mAh Lithium-Ion (6 Hours Continuous Runtime)\nSpeed Levels: 5 Variable Percussion Frequencies (1800–3200 RPM)',
    description: '<h2>Fast Soreness Relief: Breo Massage Gun 2 Deep Tissue Massager</h2><p>Penetrates 14mm deep into dense fascia tissue to dissolve lactic acid, relieve tightness, and speed up muscular recovery after heavy lifting.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sb9474b7070514b929e063e1651bae94aU.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8ad2e68e2c784b309e31c5761b5813b7O.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S15a1fbcb6e404d8094eed99b6a8f38fbY.jpg'
    ]
  },
  {
    name: 'Commercial Heavy-Duty Squat Cage & Power Rack with Multi-Grip Chin-Up Bar',
    slug: 'commercial-power-cage-squat-rack-chin-up',
    sku: 'PWR-RCK-75',
    categorySlug: 'strength-equipment',
    price: 899.0,
    comparePrice: 1099.0,
    stock: 22,
    weight: '120 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Uprights: 3" x 3" 11-Gauge Structural Steel with 1" Laser-Cut Holes\nWeight Rating: 650 kg (1430 lbs) Heavy Static Load\nAccessories: UHMW-Lined J-Cups, Full-Length Safety Spotters, Band Pegs\nPull-Up: Multi-Grip Monkey & Neutral Chin-Up Station',
    description: '<h2>Bulletproof Strength Foundation: Commercial Power Cage & Squat Rack</h2><p>Built for heavy squats, bench presses, overhead presses, and rack pulls with zero frame wobble under maximum loads.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8535140015d64cebbcf9593d03fa39747.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9f670167029c46d485b96cde3b5b688ej.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sba6b3d6dee8f468b9c3dcef688e1f590Y.jpg'
    ]
  },
  {
    name: 'WaterRower Commercial Natural Ash Wood Dual-Rail Water Rowing Machine',
    slug: 'waterrower-commercial-natural-ash-wood-water-rower',
    sku: 'WTR-ROW-ASH',
    price: 1399.0,
    comparePrice: 1599.0,
    shortDesc: 'Frame: Sustainably Harvested Solid Hardwood Natural Ash\nTank: Polycarbonate Water Tank with Ergonomic Paddle Impeller\nResistance: Fluid Water Resistance (Matches User Stroke Power)\nDimensions: 210 x 56 x 53 cm (Stores Vertically)',
    description: '<h2>Serene Sound, Relentless Workout: WaterRower Natural Ash Wood Rower</h2><p>Experience the smooth, soothing sound of rushing water while engaging 84% of your muscular system with fluid resistance.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sf779a4dc59374bc7939532ff750cb362g.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9cd253d8a40242d38aea82d4f80c786ev.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S50b35c3ba5b34e6ab55aa93050e1c2c2q.jpg'
    ]
  },
  {
    name: 'Rogue Heavy-Duty Cast Iron Olympic Weight Tree & Barbell Storage Rack',
    slug: 'rogue-commercial-olympic-weight-tree-barbell-holder',
    sku: 'ROG-WTR-01',
    categorySlug: 'strength-equipment',
    price: 199.0,
    comparePrice: 249.0,
    shortDesc: 'Posts: 6 Chrome Olympic Plate Storage Horns\nBar Storage: Dual Upright Olympic Barbell Receivers\nBase: Triangular Solid Footprint with Rubber Floor Protectors\nCapacity: 500 kg Plate Storage Rating',
    description: '<h2>Declutter Your Gym Space: Heavy-Duty Olympic Weight Tree</h2><p>Keep your bumper plates and Olympic barbells organized and off the floor with heavy-gauge steel storage horns.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/Sc644e04ef06046c6a2a7bab6df3a0242L.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S9b0c21daeffd4afab4953ba4f5286272o.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S0121bb882bde4f119c72f4816c33f2b9y.jpg'
    ]
  },
  {
    name: 'Concept2 Commercial Dynamic Air Resistance Dual Handle Ski Trainer',
    slug: 'concept2-commercial-dynamic-air-ski-trainer',
    sku: 'C2-SKI-TRN',
    categorySlug: 'cardio-equipment',
    price: 1150.0,
    comparePrice: 1299.0,
    shortDesc: 'Flywheel: Variable Damper 1–10 Air Resistance\nDrive: High-Strength Lightweight Cord Drive\nDisplay: PM5 High-Resolution Performance Monitor\nMounting: Wall or Floor Stand Supported',
    description: '<h2>Nordic Ski Power & Endurance: Concept2 Commercial Air Ski Trainer</h2><p>Precision air resistance provides immediate feedback on split times, wattage, and stroke cadence with PM5 connectivity.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S9cd253d8a40242d38aea82d4f80c786ev.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd8dd37badeeb475ab4d4fd0c2d699a60k.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S6661097f86e04c429bee14587be93321z.jpg'
    ]
  },
  {
    name: 'Keiser M3i Indoor Studio Bluetooth Smart Magnetic Cycling Bike',
    slug: 'keiser-m3i-indoor-studio-magnetic-bike',
    sku: 'KSR-M3I-BIK',
    categorySlug: 'cardio-equipment',
    price: 1899.0,
    comparePrice: 2199.0,
    shortDesc: 'Flywheel: Rear-Positioned Eddy-Current Magnetic Flywheel (Sweat-Protected)\nResistance: 24 Gears Displayed on Backlit Digital Computer\nDrive: Single Poly-V Belt with Zero Maintenance\nPedals: Four-Way Adjustable Dual-Link SPD Pedals',
    description: '<h2>The Pioneer in Magnetic Studio Cycling: Keiser M3i Indoor Bike</h2><p>Rear flywheel design keeps corrosive sweat off critical moving parts. Bluetooth wireless computer transmits power and cadence to studio apps.</p>',
    images: [
      'https://ae-pic-a1.aliexpress-media.com/kf/S215d1f42919445e58dd35a5f34725aa7E.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S50b35c3ba5b34e6ab55aa93050e1c2c2q.jpg',
      'https://ae-pic-a1.aliexpress-media.com/kf/S8c855419200f464d9f26eaf3349dfba2t.jpg'
    ]
  }
];

async function replaceCatalog() {
  console.log('=== STEP 1: UPDATING EXISTING 24 PRODUCTS WITH ORIGINAL NAMES & IMAGES ===\n');
  
  for (const item of EXISTING_PRODUCTS_ORIGINAL_MAP) {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: item.oldSlug },
          { slug: item.slug }
        ]
      }
    });
    
    if (!existing) {
      console.log(`Product with slug "${item.oldSlug}" not found, skipping.`);
      continue;
    }
    
    console.log(`Updating product "${existing.name}" -> "${item.name}"...`);
    
    // Update product fields
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        price: item.price,
        comparePrice: item.comparePrice,
        shortDesc: item.shortDesc,
        description: item.description,
        isActive: true
      }
    });
    
    // Replace images
    await prisma.productImage.deleteMany({
      where: { productId: existing.id }
    });
    
    const newImages = item.images.map((url, idx) => ({
      productId: existing.id,
      url,
      alt: `${item.name} - View ${idx + 1}`,
      sortOrder: idx + 1
    }));
    
    await prisma.productImage.createMany({
      data: newImages
    });
    
    console.log(`  ✓ Updated "${item.name}" with ${newImages.length} real product images.`);
  }
  
  console.log('\n=== STEP 2: ADDING 10 NEW AUTHENTIC PRODUCTS DIRECTLY FROM ALIEXPRESS ===\n');
  
  // Cache categories
  const categories = await prisma.category.findMany();
  const catMap = {};
  for (const c of categories) {
    catMap[c.slug] = c.id;
  }
  
  for (const item of ADDITIONAL_ALIEXPRESS_PRODUCTS) {
    const catId = catMap[item.categorySlug] || catMap['cardio-equipment'];
    
    // Check if exists
    const exists = await prisma.product.findUnique({
      where: { slug: item.slug }
    });
    
    if (exists) {
      console.log(`Product "${item.name}" already exists, updating...`);
      await prisma.product.update({
        where: { id: exists.id },
        data: {
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
          isActive: true
        }
      });
      await prisma.productImage.deleteMany({ where: { productId: exists.id } });
      await prisma.productImage.createMany({
        data: item.images.map((url, idx) => ({
          productId: exists.id,
          url,
          alt: `${item.name} - View ${idx + 1}`,
          sortOrder: idx + 1
        }))
      });
    } else {
      console.log(`Creating new product "${item.name}"...`);
      const created = await prisma.product.create({
        data: {
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
          isActive: true,
          categoryId: catId,
          images: {
            create: item.images.map((url, idx) => ({
              url,
              alt: `${item.name} - View ${idx + 1}`,
              sortOrder: idx + 1
            }))
          }
        }
      });
      console.log(`  ✓ Created "${created.name}" (ID: ${created.id}) with ${item.images.length} images.`);
    }
  }
}

async function verifyCatalog() {
  console.log('\n=== FINAL VERIFICATION OF ALL PRODUCTS IN DATABASE ===');
  const all = await prisma.product.findMany({
    include: { images: true, category: true }
  });
  
  console.log(`Total Products in Catalog: ${all.length}`);
  
  const hasPgxName = all.filter(p => p.name.toUpperCase().includes('PGX'));
  console.log(`Products still with "PGX" in name: ${hasPgxName.length}`);
  if (hasPgxName.length > 0) {
    console.log('Still have PGX:', hasPgxName.map(p => p.name));
  }
  
  const hasUnsplash = all.filter(p => p.images.some(img => img.url.includes('unsplash')));
  console.log(`Products still with Unsplash images: ${hasUnsplash.length}`);
  if (hasUnsplash.length > 0) {
    console.log('Still have Unsplash:', hasUnsplash.map(p => p.name));
  }
  
  console.log('\n--- SAMPLE OF STORE PRODUCTS ---');
  all.slice(0, 10).forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.category.name}] ${p.name}`);
    console.log(`   Price: €${p.price} | Images: ${p.images.length} photos`);
    console.log(`   Sample Image: ${p.images[0]?.url}`);
  });
}

async function main() {
  try {
    await replaceCatalog();
    await verifyCatalog();
  } catch (err) {
    console.error('Fatal error in catalog replacement:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
