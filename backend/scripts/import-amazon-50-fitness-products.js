const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const PRIMARY_URL = 'postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public';
const BACKUP_URL = 'postgresql://pgxshop:XxkJ9rWMHlgAusrCUzKs@2.25.150.87:5434/pgxshop?schema=public';

// 50 Amazon Best-Seller Real Gym & Fitness Products
const amazonProducts = [
  // ─── STRENGTH & FREE WEIGHTS (15 Products) ───
  {
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
    slug: 'bowflex-selecttech-552-adjustable-dumbbells',
    sku: 'AMZ-BWF-552',
    categorySlug: 'strength-equipment',
    price: 429.00,
    comparePrice: 549.00,
    stock: 40,
    weight: '48 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Adjustability: 5 to 52.5 lbs per dumbbell (2.5 lb increments)\nMechanism: Rapid Turn-Dial Weight Selector\nReplaces: 15 pairs of traditional dumbbells\nTray: Heavy molded storage cradles included\nWarranty: 2-Year Bowflex Warranty',
    description: '<h2>The #1 Best-Selling Adjustable Dumbbells on Amazon: Bowflex SelectTech 552</h2><p>With just the turn of a dial, you can automatically change your resistance from 5 lbs all the way up to 52.5 lbs per dumbbell. No more picking up 15 different pairs of dumbbells to get the results you want. The <strong>Bowflex SelectTech 552</strong> delivers an entire gym rack of weights into one ultra-compact footprint.</p><h3>Key Features</h3><ul><li><strong>15 Weight Settings in One:</strong> Adjusts in 2.5-pound increments up to the first 25 pounds, allowing gradual strength progression.</li><li><strong>Smooth Molding:</strong> Durable molding around metal plates provides smooth lift-off and quieter workouts with no clanking.</li><li><strong>Total-Body Versatility:</strong> Suitable for heavy shrugs, lunges, curls, and lateral raises.</li></ul><h3>Specifications</h3><table><tbody><tr><td><strong>Weight Range</strong></td><td>5 to 52.5 lbs (2.5 to 24 kg)</td></tr><tr><td><strong>Dimensions</strong></td><td>43 x 21 x 23 cm per dumbbell</td></tr><tr><td><strong>Material</strong></td><td>Steel, High-Impact Thermoplastic Rubber</td></tr><tr><td><strong>Included</strong></td><td>Pair of dumbbells & 2 storage cradles</td></tr></tbody></table>',
    images: [
      { url: 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?auto=format&fit=crop&w=1200&q=80', alt: 'Bowflex SelectTech 552 Adjustable Dumbbells in Gym' },
      { url: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=1200&q=80', alt: 'Bowflex Dial Close Up' }
    ]
  },
  {
    name: 'CAP Barbell 150-lb Rubber Hex Dumbbell Set with A-Frame Rack',
    slug: 'cap-barbell-150lb-rubber-hex-dumbbell-set',
    sku: 'AMZ-CAP-150',
    categorySlug: 'strength-equipment',
    price: 289.00,
    comparePrice: 349.00,
    stock: 25,
    weight: '68 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Set Includes: 5, 10, 15, 20, 25 lb pairs (150 lbs total)\nRack: Solid steel A-frame vertical dumbbell rack included\nHeads: ASTM A48 Class 20 grey iron coated with natural rubber\nGrip: Contoured ergonomic chrome-plated knurled handles',
    description: '<h2>Heavy-Duty Commercial Durability: CAP Barbell 150-lb Rubber Hex Set</h2><p>The <strong>CAP Barbell 150-lb Rubber Hex Dumbbell Set</strong> provides the quintessential foundation for any home or garage gym. Built with solid cast iron heads encased in virgin rubber to protect flooring, prevent roll-away accidents, and dampen noise.</p><h3>Highlights</h3><ul><li><strong>Anti-Roll Hexagonal Design:</strong> Hex heads prevent dumbbells from rolling across floor between sets.</li><li><strong>Ergonomic Knurled Grips:</strong> Ergonomically contoured medium-depth knurling provides maximum grip security.</li><li><strong>Space-Saving A-Frame Rack:</strong> Heavy gauge steel stand maximizes floor space while keeping weights organized.</li></ul>',
    images: [
      { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80', alt: 'CAP Barbell Rubber Hex Dumbbell Rack' }
    ]
  },
  {
    name: 'PowerBlock Elite USA Commercial Expandable Dumbbells (5–50 lbs)',
    slug: 'powerblock-elite-usa-expandable-dumbbells',
    sku: 'AMZ-PWB-ELITE',
    categorySlug: 'strength-equipment',
    price: 399.00,
    comparePrice: 479.00,
    stock: 30,
    weight: '46 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Range: 5 to 50 lbs per hand (Expandable up to 90 lbs with stage kits)\nOrigin: Made in USA with precision welded steel\nSelector: Magnetic polypropylene selector pin rated for 500 lbs\nReplaces: 16 pairs of standard dumbbells\nWarranty: 10-Year Home Warranty',
    description: '<h2>Engineered & Made in the USA: PowerBlock Elite USA Dumbbells</h2><p>Engineered for compact power, <strong>PowerBlock Elite USA</strong> dumbbells provide unmatched balance with an open handle architecture that permits full wrist clearance for all upper and lower body movements.</p><h3>Key Features</h3><ul><li><strong>Magnetic Selector Pin:</strong> Slide the color-coded selector pin to lock desired weight in under a second.</li><li><strong>Expandable Architecture:</strong> Start with Stage 1 (50 lbs) and expand up to 70 or 90 lbs with add-on kits.</li><li><strong>Welded Steel Construction:</strong> Urethane-coated solid steel plates resist bending or breaking under heavy usage.</li></ul>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', alt: 'PowerBlock Elite USA Dumbbells' }
    ]
  },
  {
    name: 'FLYBIRD Multi-Position Heavy-Duty Adjustable Weight Bench (800 lbs)',
    slug: 'flybird-heavy-duty-adjustable-weight-bench',
    sku: 'AMZ-FLY-BNCH',
    categorySlug: 'strength-equipment',
    price: 159.00,
    comparePrice: 199.00,
    stock: 50,
    weight: '14 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Capacity: 800 lbs Real Test Load Rating\nAdjustability: 7 back positions & 3 seat positions\nFoldable: 1-second fast folding for compact under-bed storage\nPadding: 2" thick high-density rebound foam\nWarranty: 1-Year Full Coverage',
    description: '<h2>Amazon Best-Seller: FLYBIRD 800 lb Adjustable Incline/Decline Bench</h2><p>Designed with input from professional fitness coaches, the <strong>FLYBIRD Weight Bench</strong> utilizes heavy commercial-gauge steel to deliver a rock-solid, wobble-free foundation for bench presses, dumbbell rows, and sit-ups.</p><h3>Features</h3><ul><li><strong>Triangular Mechanical Structure:</strong> High-strength triangular engineering ensures 800 lbs stability.</li><li><strong>Automatic Fast Folding:</strong> Folds into a compact 31" x 12" shape in seconds for closet or under-bed storage.</li><li><strong>Anti-Wear PU Leather:</strong> Waterproof, non-slip, and easily sanitizable after sweaty workouts.</li></ul>',
    images: [
      { url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80', alt: 'FLYBIRD Adjustable Weight Bench' }
    ]
  },
  {
    name: 'Rogue Fitness Ohio Bar 20kg Cerakote Olympic Barbell',
    slug: 'rogue-fitness-ohio-bar-20kg-cerakote',
    sku: 'AMZ-ROG-OHIO',
    categorySlug: 'strength-equipment',
    price: 325.00,
    comparePrice: 375.00,
    stock: 20,
    weight: '20 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Tensile Strength: 190,000 PSI Machined Steel\nFinish: Advanced Cerakote Polymer Ceramic Coating (Corrosion Proof)\nBushings: Composite bronze bushings with smooth spin\nKnurling: Dual Olympic & Powerlifting Knurl Marks\nWarranty: Lifetime Warranty Against Bending',
    description: '<h2>The Standard in Barbell Excellence: Rogue Ohio Bar (Cerakote)</h2><p>Manufactured in Columbus, Ohio, the <strong>Rogue 20kg Ohio Bar</strong> is the crown jewel of Olympic weightlifting and powerlifting. Features a 190,000 PSI steel shaft with advanced Cerakote finish that delivers 100x more corrosion resistance than standard chrome.</p><h3>Key Specifications</h3><table><tbody><tr><td><strong>Bar Weight</strong></td><td>20 kg (44 lbs)</td></tr><tr><td><strong>Shaft Diameter</strong></td><td>28.5 mm</td></tr><tr><td><strong>Loadable Sleeve Length</strong></td><td>16.40 inches</td></tr><tr><td><strong>Sleeve Finish</strong></td><td>Matte Black Hard Chrome</td></tr></tbody></table>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Rogue Fitness Ohio Barbell' }
    ]
  },
  {
    name: 'Yes4All Solid Cast Iron Kettlebell Set (10, 15, 20, 25 lbs)',
    slug: 'yes4all-solid-cast-iron-kettlebell-set',
    sku: 'AMZ-YES-KTB',
    categorySlug: 'strength-equipment',
    price: 139.00,
    comparePrice: 179.00,
    stock: 35,
    weight: '32 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Casting: Single-piece solid cast iron with no welds\nFinish: Black powder-coated finish prevents corrosion & improves grip\nBase: Flat machined bottom for stable floor exercises\nHandle: Wide textured handle for one or two-handed swings',
    description: '<h2>Unmatched Value & Durability: Yes4All Cast Iron Kettlebell Set</h2><p>Cast from heavy-gauge molten iron without scrap metal or cheap plastic fills, the <strong>Yes4All Kettlebell Set</strong> provides smooth rotation, reliable balance, and ergonomic traction for swings, snatches, and Turkish get-ups.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80', alt: 'Yes4All Cast Iron Kettlebells' }
    ]
  },
  {
    name: 'Synergee Commercial Olympic Bumper Plates (260 lb Complete Set)',
    slug: 'synergee-commercial-olympic-bumper-plates-260lb',
    sku: 'AMZ-SYN-BMP',
    categorySlug: 'strength-equipment',
    price: 499.00,
    comparePrice: 620.00,
    stock: 15,
    weight: '118 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Set Breakdown: Pairs of 45, 35, 25, 15, 10 lb Olympic bumper plates\nMaterial: High-density 100% low-bounce virgin rubber\nHub: Stainless steel 2-inch center collars\nDurometer: 88 Shore A true dead-bounce formula',
    description: '<h2>Zero Bounce, Floor-Safe Drops: Synergee Commercial Bumper Plates</h2><p>Whether performing heavy clean and jerks or deadlift triples, <strong>Synergee Bumper Plates</strong> feature a dead-bounce durometer to protect your bar, platforms, and flooring from impact damage.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', alt: 'Synergee Bumper Plates on Barbell' }
    ]
  },
  {
    name: 'HulkFit Pro Series Multi-Function Adjustable Power Cage',
    slug: 'hulkfit-pro-series-multi-function-power-cage',
    sku: 'AMZ-HLK-CAGE',
    categorySlug: 'strength-equipment',
    price: 369.00,
    comparePrice: 450.00,
    stock: 18,
    weight: '75 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Steel: 2.5" x 2.5" 11-Gauge Tubular Steel Frame\nWeight Capacity: 1000 lbs Static Load Rating\nIncludes: Multi-Grip Pull-Up Bar, J-Hooks, Safety Spotter Arms\nFootprint: 47" x 44" x 81" (Fits standard 8ft ceilings)',
    description: '<h2>Heavy Commercial Power: HulkFit Pro Series Power Cage</h2><p>Engineered for serious lifters training solo at home, the <strong>HulkFit Power Cage</strong> features extra-long safety spotter arms, multiple anchor hooks for resistance bands, and a knurled multi-grip pull-up station.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=80', alt: 'HulkFit Multi-Function Power Cage' }
    ]
  },
  {
    name: 'A2ZCARE Olympic Hex Weight Trap Deadlift Bar with Raised Grips',
    slug: 'a2zcare-olympic-hex-trap-deadlift-bar',
    sku: 'AMZ-A2Z-TRAP',
    categorySlug: 'strength-equipment',
    price: 179.00,
    comparePrice: 220.00,
    stock: 28,
    weight: '24 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Capacity: 750 lbs Max Capacity\nHandles: Dual diamond-knurled raised & flush handles\nSleeves: 10-inch loadable Olympic 2-inch chrome sleeves\nMaterial: High-tensile solid carbon steel',
    description: '<h2>Max Weight with Minimal Lumbar Strain: A2ZCARE Hex Trap Bar</h2><p>The <strong>A2ZCARE Olympic Hex Trap Bar</strong> changes the mechanical lever arm during deadlifts by placing the lifter inside the bar rather than behind it, isolating quadriceps and glutes while drastically relieving lower back stress.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80', alt: 'Olympic Hex Trap Deadlift Bar' }
    ]
  },
  {
    name: 'Ironmaster Quick-Lock Heavy Adjustable Dumbbell System (75 lbs)',
    slug: 'ironmaster-quick-lock-adjustable-dumbbell-system',
    sku: 'AMZ-IRN-MST',
    categorySlug: 'strength-equipment',
    price: 749.00,
    comparePrice: 849.00,
    stock: 12,
    weight: '70 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Range: 5 to 75 lbs in 2.5 lb increments per dumbbell\nDurability: 100% Solid Steel & Iron (Indestructible Drop-Safe Design)\nIncluded: Dumbbell stand with plate storage shelves\nWarranty: Lifetime Warranty',
    description: '<h2>The Strongest Drop-Safe Adjustable Dumbbells in the World: Ironmaster Quick-Lock</h2><p>Unlike fragile plastic dials, <strong>Ironmaster Quick-Lock Dumbbells</strong> use a heavy threaded locking screw that can be dropped onto gym mats with zero fear of breaking internal gears or pins.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=1200&q=80', alt: 'Ironmaster Quick-Lock Dumbbells' }
    ]
  },
  {
    name: 'Titan Fitness T-2 Series Short Power Squat Rack',
    slug: 'titan-fitness-t2-series-short-power-rack',
    sku: 'AMZ-TTN-T2',
    categorySlug: 'strength-equipment',
    price: 349.00,
    comparePrice: 420.00,
    stock: 22,
    weight: '62 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Height: 71" Low-Ceiling Friendly Profile\nCapacity: 850 lbs Rack Capacity\nSteel: 2" x 2" 12-Gauge Uprights with 1" hole spacing\nIncludes: Pair of J-Hooks and 24" Safety Pipe Bars',
    description: '<h2>Designed for Low-Ceiling Basements: Titan T-2 Short Power Rack</h2><p>At just 71 inches tall, the <strong>Titan T-2 Series Short Power Rack</strong> fits perfectly into tight basement gyms while delivering commercial-level safety for squats and bench presses.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', alt: 'Titan Fitness Power Squat Rack' }
    ]
  },
  {
    name: 'Marcy Olympic Weight Plate Tree with Vertical Bar Holder',
    slug: 'marcy-olympic-weight-plate-tree-vertical-bar-holder',
    sku: 'AMZ-MRC-TREE',
    categorySlug: 'strength-equipment',
    price: 89.00,
    comparePrice: 119.00,
    stock: 45,
    weight: '12 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Capacity: Holds up to 1000 lbs of 2" Olympic Plates\nStorage: 6 Plate Pegs + 2 Vertical Barbell Holders\nBase: Triangular triangular anti-tip stability frame\nFinish: Electrostatic dark grey hammertone powder coat',
    description: '<h2>Total Gym Floor Organization: Marcy Olympic Weight Tree</h2><p>Organize your barbells and Olympic weight plates cleanly in one place with the heavy-duty <strong>Marcy Plate Tree</strong>.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80', alt: 'Marcy Olympic Weight Plate Tree' }
    ]
  },
  {
    name: 'DMoose Commercial Olympic Barbell Aluminum Locking Collars (Pair)',
    slug: 'dmoose-olympic-barbell-aluminum-locking-collars',
    sku: 'AMZ-DMS-CLR',
    categorySlug: 'strength-equipment',
    price: 34.99,
    comparePrice: 45.00,
    stock: 80,
    weight: '0.4 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Material: Aircraft-grade CNC machined aluminum\nClamp: Rubber-padded quick-cam locking lever\nFit: Standard 2-inch Olympic barbell sleeves\nLocking: Won\'t slip even during high-repetition cleans or drops',
    description: '<h2>Zero-Slip Barbell Security: DMoose Aluminum Olympic Collars</h2><p>Engineered for high-impact Olympic lifting, these quick-locking aircraft aluminum collars clamp securely to 2-inch sleeves with zero scratching.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'DMoose Aluminum Barbell Collars' }
    ]
  },
  {
    name: 'Iron Bull Strength Advanced Squat Pad & Hip Thrust Neck Protector',
    slug: 'iron-bull-strength-advanced-squat-pad',
    sku: 'AMZ-IBS-PAD',
    categorySlug: 'strength-equipment',
    price: 26.95,
    comparePrice: 35.00,
    stock: 90,
    weight: '0.35 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Core: 1.3" thick high-density rubberized memory foam\nCover: Breathable matte nylon with non-slip velcro straps\nFit: Fits all standard and Olympic barbells securely\nProtection: Relieves neck, trap, and pelvic bruising',
    description: '<h2>Pain-Free Heavy Hip Thrusts & Squats: Iron Bull Barbell Pad</h2><p>Relieve painful barbell pressure during heavy squats, lunges, and glute bridges with high-density ergonomic foam that distributes weight evenly across your body.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', alt: 'Iron Bull Barbell Squat Pad' }
    ]
  },
  {
    name: 'BalanceFrom Cast Iron Olympic 2-Inch Weight Plates Set (105 lbs)',
    slug: 'balancefrom-cast-iron-olympic-weight-plates-set',
    sku: 'AMZ-BLF-PLT',
    categorySlug: 'strength-equipment',
    price: 199.00,
    comparePrice: 249.00,
    stock: 30,
    weight: '48 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Set: 2x 25 lb, 2x 15 lb, 2x 10 lb, 2x 2.5 lb Cast Iron Plates\nCenter: 2-inch solid stainless steel center hole\nHandles: 3-hole grip handle design for easy loading and off-bar exercises',
    description: '<h2>Classic Iron Power: BalanceFrom Olympic Cast Iron Grip Plates</h2><p>Featuring an ergonomic 3-hole grip cutout, these cast iron Olympic plates can also be used as standalone weights for Russian twists, halo raises, and farmer walks.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', alt: 'BalanceFrom Cast Iron Olympic Plates' }
    ]
  },

  // ─── CARDIO & MACHINES (12 Products) ───
  {
    name: 'Concept2 RowErg Indoor Rowing Machine with PM5 Monitor',
    slug: 'concept2-rowerg-indoor-rowing-machine-pm5',
    sku: 'AMZ-C2-ROW',
    categorySlug: 'cardio-equipment',
    price: 990.00,
    comparePrice: 1150.00,
    stock: 25,
    weight: '26 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Standard: The recognized gold standard in world indoor rowing\nFlywheel: Spiral damper air resistance with 10 resistance settings\nMonitor: Advanced PM5 performance monitor with Bluetooth FTMS\nStorage: Quick-release separating frame into two parts without tools',
    description: '<h2>The World Standard in Rowing: Concept2 RowErg</h2><p>Engineered by rowers for athletes, the <strong>Concept2 RowErg</strong> is recognized by Olympic rowers and CrossFit athletes worldwide for its precision fly-wheel feedback, rugged reliability, and data accuracy.</p><h3>Highlights</h3><ul><li><strong>PM5 Performance Monitor:</strong> Connects via Bluetooth to Concept2 ErgData, Zwift, Kinomap, and Strava.</li><li><strong>Adjustable Air Resistance:</strong> Damper lever regulates airflow to the flywheel to customize feel from a sleek racing shell to a heavy boat.</li><li><strong>Separates for Storage:</strong> Disassembles easily into two segments for effortless upright corner storage.</li></ul>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Concept2 RowErg with PM5 Monitor' }
    ]
  },
  {
    name: 'NordicTrack Commercial 1750 Smart Folding Treadmill',
    slug: 'nordictrack-commercial-1750-smart-folding-treadmill',
    sku: 'AMZ-NT-1750',
    categorySlug: 'cardio-equipment',
    price: 1999.00,
    comparePrice: 2499.00,
    stock: 15,
    weight: '140 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Motor: 3.75 CHP Commercial Plus Motor\nScreen: 14" Tilt & Pivot HD Interactive Smart Touchscreen\nIncline/Decline: -3% Decline to +15% Incline\nDeck: 22" x 60" Commercial Running Belt with Runners Flex Cushioning\nSpeed: 0 to 12 MPH 1-Touch Speed Controls',
    description: '<h2>Interactive Fitness Leader: NordicTrack Commercial 1750</h2><p>Experience true outdoor terrain simulation with auto-adjusting incline and decline (-3% to 15%) that syncs with real-world trail runs and interactive coach-led sessions.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80', alt: 'NordicTrack 1750 Smart Treadmill' }
    ]
  },
  {
    name: 'Sole Fitness F80 Commercial Folding Treadmill with Cushion Flex',
    slug: 'sole-fitness-f80-commercial-folding-treadmill',
    sku: 'AMZ-SOL-F80',
    categorySlug: 'cardio-equipment',
    price: 1699.00,
    comparePrice: 1999.00,
    stock: 18,
    weight: '128 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Motor: 3.5 HP High-Torque Continuous Duty Motor\nDeck: Whisper-Quiet Cushion Flex Shock Absorption (reduces joint impact by 40%)\nDisplay: 10.1" Android-Powered Touchscreen Console with Screen Mirroring\nCapacity: 375 lbs Heavy User Capacity',
    description: '<h2>Bulletproof Warranty & Quiet Power: Sole Fitness F80</h2><p>Sole treadmills have been voted best-in-class by Consumer Reports year after year. The F80 features an extra-thick steel frame and precision-balanced commercial rollers.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?auto=format&fit=crop&w=1200&q=80', alt: 'Sole F80 Folding Treadmill' }
    ]
  },
  {
    name: 'Horizon Fitness 7.0 AT Studio Series Smart Treadmill',
    slug: 'horizon-fitness-70-at-studio-series-treadmill',
    sku: 'AMZ-HRZ-70',
    categorySlug: 'cardio-equipment',
    price: 999.00,
    comparePrice: 1299.00,
    stock: 20,
    weight: '115 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Motor: 3.0 CHP Rapid-Sync Motor (33% faster speed & incline changes)\nControls: QuickDial Ergonomic Palm Wheel Controls\nConnectivity: Advanced Bluetooth connects to Peloton app, Zwift, and Nike Run Club\nDeck: 20" x 60" 3-Zone Variable Response Cushioning',
    description: '<h2>Built for Streaming HIIT Studio Workouts: Horizon 7.0 AT</h2><p>Designed specifically for streaming HIIT classes, the Horizon 7.0 AT features responsive QuickDial roller controls that let you jump between speeds and inclines without missing a beat.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80', alt: 'Horizon 7.0 AT Studio Treadmill' }
    ]
  },
  {
    name: 'Schwinn Fitness Airdyne AD7 High-Torque Air Resistance Bike',
    slug: 'schwinn-fitness-airdyne-ad7-air-resistance-bike',
    sku: 'AMZ-SCH-AD7',
    categorySlug: 'cardio-equipment',
    price: 899.00,
    comparePrice: 1099.00,
    stock: 16,
    weight: '52 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Drive: Single-stage direct belt drive for instantaneous power transfer\nFan: 26-blade perimeter-weighted high-momentum steel fan\nResistance: Progressive air resistance (the harder you pedal, the harder it gets)\nHandles: Multi-position handgrips for targeted upper-body recruitment',
    description: '<h2>Infinite Resistance Wind Machine: Schwinn Airdyne AD7</h2><p>The Schwinn Airdyne AD7 features a whisper-quiet belt drive and 26-blade fan that converts pure athlete effort into cardiovascular power.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=1200&q=80', alt: 'Schwinn Airdyne AD7 Air Bike' }
    ]
  },
  {
    name: 'Assault AirBike Classic Heavy Duty Fan Conditioning Bike',
    slug: 'assault-airbike-classic-fan-conditioning-bike',
    sku: 'AMZ-AST-BIK',
    categorySlug: 'cardio-equipment',
    price: 749.00,
    comparePrice: 899.00,
    stock: 22,
    weight: '44 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Frame: Heavy-duty 20-gauge steel with industrial powder coat\nBearings: 20 sealed cartridge bearings at every pivot point\nConsole: High-contrast LCD with Tabata, intervals, and heart rate targets\nMax User Weight: 350 lbs',
    description: '<h2>The Official Conditioning Bike of CrossFit: Assault AirBike Classic</h2><p>Designed to test cardiovascular fortitude, the Assault AirBike combines upper-body pushing and pulling with high-resistance pedaling to push VO2 max limits.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Assault AirBike Classic' }
    ]
  },
  {
    name: 'Sunny Health & Fitness Indoor Magnetic Cycling Bike (SF-B1805)',
    slug: 'sunny-health-fitness-indoor-magnetic-cycling-bike',
    sku: 'AMZ-SHF-1805',
    categorySlug: 'cardio-equipment',
    price: 399.00,
    comparePrice: 499.00,
    stock: 35,
    weight: '57 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Flywheel: 44 lb Precision Chrome Flywheel\nResistance: Micro-adjustable contactless magnetic resistance\nDrive: Smooth and silent Poly-V belt drive\nAdjustability: 4-Way adjustable seat & 4-way adjustable handlebars',
    description: '<h2>Unbeatable Quality in Its Price Range: Sunny SF-B1805</h2><p>Featuring a massive 44-pound flywheel and silent magnetic resistance, the SF-B1805 gives you commercial studio cycling performance at an accessible price point.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=1200&q=80', alt: 'Sunny Health Indoor Cycling Bike' }
    ]
  },
  {
    name: 'Echelon Smart Connect EX-5 Commercial Studio Cycling Bike',
    slug: 'echelon-smart-connect-ex5-studio-cycling-bike',
    sku: 'AMZ-ECH-EX5',
    categorySlug: 'cardio-equipment',
    price: 699.00,
    comparePrice: 899.00,
    stock: 20,
    weight: '50 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Flywheel: 28 lb rear-mounted flywheel protects mechanics from sweat\nResistance: 32 levels of motorized magnetic resistance with index lever\nMount: 180° rotating console mount for off-bike strength & yoga training\nPedals: Dual SPD clips and toe baskets',
    description: '<h2>Smart Interactive Cycling: Echelon Smart Connect EX-5</h2><p>Features a rear-mounted flywheel to keep electronics and magnets safe from corrosive sweat, with 32 motorized resistance levels.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=1200&q=80', alt: 'Echelon Smart Connect EX-5 Bike' }
    ]
  },
  {
    name: 'Concept2 SkiErg Upper-Body Ski Ergometer with Floor Stand',
    slug: 'concept2-skierg-upper-body-ski-ergometer',
    sku: 'AMZ-C2-SKI',
    categorySlug: 'cardio-equipment',
    price: 1150.00,
    comparePrice: 1300.00,
    stock: 14,
    weight: '38 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Drive: Lightweight high-strength drive cords for smooth response\nFlywheel: Spiral damper airflow control (1 to 10)\nConsole: PM5 monitor with Bluetooth/Ant+ connectivity\nStand: Heavy steel floor stand included with caster transport wheels',
    description: '<h2>Core & Upper Body Engine: Concept2 SkiErg</h2><p>Brings Nordic cross-country skiing indoors to develop explosive core power, lat endurance, and leg drive with low impact.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80', alt: 'Concept2 SkiErg with Stand' }
    ]
  },
  {
    name: 'StairMaster SM3 Commercial StepMill Revolving Stair Climber',
    slug: 'stairmaster-sm3-commercial-stepmill-stair-climber',
    sku: 'AMZ-STM-SM3',
    categorySlug: 'cardio-equipment',
    price: 3499.00,
    comparePrice: 4200.00,
    stock: 8,
    weight: '102 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Steps: Revolving staircase with 6" deep x 9" high steps\nSpeed: 26 to 162 steps per minute\nDisplay: Backlit LCD with calorie burn, heart rate, and landmark goals\nHeight Clearance: Requires only an 8-foot standard residential ceiling',
    description: '<h2>The Ultimate Calorie-Torching Machine: StairMaster SM3</h2><p>Get the authentic gym stair climber workout in your home with a compact residential footprint designed for standard 8ft ceilings.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80', alt: 'StairMaster SM3 StepMill' }
    ]
  },
  {
    name: 'Bowflex Max Trainer M6 Hybrid Elliptical Stepper',
    slug: 'bowflex-max-trainer-m6-hybrid-elliptical',
    sku: 'AMZ-BWF-M6',
    categorySlug: 'cardio-equipment',
    price: 1299.00,
    comparePrice: 1499.00,
    stock: 18,
    weight: '67 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Burn Rate: Combines low impact of an elliptical with calorie burn of a stepper\nResistance: 16 computer-controlled magnetic and air resistance levels\nScreen: Interactive burn rate meter & backlit magnetic console\nFootprint: Ultra-compact footprint fits anywhere',
    description: '<h2>Max Calorie Burn in 14 Minutes: Bowflex Max Trainer M6</h2><p>Designed around Bowflex\'s signature 14-minute interval program, the M6 burns up to 2.5x more calories per minute than standard cardio machines.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80', alt: 'Bowflex Max Trainer M6' }
    ]
  },
  {
    name: 'Merach Water Resistance Wooden Dual-Rail Rowing Machine',
    slug: 'merach-water-resistance-wooden-rowing-machine',
    sku: 'AMZ-MRC-WTR',
    categorySlug: 'cardio-equipment',
    price: 499.00,
    comparePrice: 650.00,
    stock: 22,
    weight: '32 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Wood: 100% Solid Solid Oak Wood Frame\nWater Tank: Polycarbonate leak-proof tank with hydro-blade paddles\nSound: Authentic soothing water rush sound during every stroke\nStorage: Stands upright on end in under 2 sq ft',
    description: '<h2>Soothing Real-Water Rowing: Merach Wooden Water Rower</h2><p>Crafted with real natural solid oak and dual wooden rails, this water rower provides organic hydro resistance that responds dynamically to stroke speed.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Merach Wooden Water Rower' }
    ]
  },

  // ─── HOME GYM & MULTI-STATIONS (8 Products) ───
  {
    name: 'Bowflex PR1000 Power Rod Home Gym Full-Body System',
    slug: 'bowflex-pr1000-power-rod-home-gym',
    sku: 'AMZ-BWF-PR1000',
    categorySlug: 'home-gym',
    price: 599.00,
    comparePrice: 799.00,
    stock: 20,
    weight: '65 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Resistance: Up to 210 lbs of Power Rod Progressive Resistance\nExercises: Over 30 full-body strength exercises\nBench: Converts into a rolling seat for aerobic rowing conditioning\nFootprint: Folds upright for minimal storage space',
    description: '<h2>Over 30 Exercises with Smooth Power Rods: Bowflex PR1000</h2><p>The iconic <strong>Bowflex PR1000</strong> provides 210 lbs of progressive resistance that feels smooth on joints with no heavy iron plates clattering.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', alt: 'Bowflex PR1000 Home Gym' }
    ]
  },
  {
    name: 'Marcy 150-lb Stack Multifunctional Home Gym Station (MWM-990)',
    slug: 'marcy-150lb-stack-multifunctional-home-gym-mwm990',
    sku: 'AMZ-MRC-990',
    categorySlug: 'home-gym',
    price: 499.00,
    comparePrice: 620.00,
    stock: 18,
    weight: '122 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Weight Stack: 150 lbs Selectorized Vinyl Coated Steel Stack\nStations: Dual function chest press & pec fly, lat pulldown, leg developer\nCables: 2000 lb aircraft-rated tensile cables\nFrame: Heavy-duty 14-gauge steel tubing',
    description: '<h2>Club-Style Pin Selector Gym at Home: Marcy MWM-990</h2><p>Features a 150-pound selectorized weight stack with safety lock, high and low pulleys, and dual-function press arms for comprehensive strength conditioning.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', alt: 'Marcy MWM-990 Stack Home Gym' }
    ]
  },
  {
    name: 'Body-Solid EXM3000LPS Multi-Station Dual Stack Home Gym',
    slug: 'body-solid-exm3000lps-multi-station-home-gym',
    sku: 'AMZ-BDS-3000',
    categorySlug: 'home-gym',
    price: 3699.00,
    comparePrice: 4299.00,
    stock: 6,
    weight: '340 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Stacks: Dual 210 lb Precision Weight Stacks (Supports 3 simultaneous users)\nStations: Leg press/calf raise, chest press, pec dec, lat pulldown, low pulley row\nWarranty: Full Commercial Lifetime In-Home Warranty',
    description: '<h2>3-User Simultaneous Commercial Power: Body-Solid EXM3000LPS</h2><p>The ultimate multi-station powerhouse. Three people can train simultaneously across multi-press, leg press, and cable stations.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=80', alt: 'Body-Solid EXM3000LPS Multi Station Gym' }
    ]
  },
  {
    name: 'Mikolo Commercial Power Cage with Dual Cable Crossover Pulley',
    slug: 'mikolo-commercial-power-cage-cable-crossover',
    sku: 'AMZ-MKL-CAGE',
    categorySlug: 'home-gym',
    price: 1499.00,
    comparePrice: 1799.00,
    stock: 10,
    weight: '160 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Steel: 11-Gauge 2" x 2" commercial grade steel\nPulleys: Dual adjustable independent cable crossovers\nAttachments: Lat bar, tricep rope, landmine, dip handles, J-hooks, spotters\nRating: 1200 lbs Max Static Cage Rating',
    description: '<h2>All-In-One Garage Gym Solution: Mikolo Power Cage Crossover</h2><p>Combines a squat rack, cable crossover, pull-up station, dip bar, and landmine attachment into a single freestanding heavy frame.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=80', alt: 'Mikolo Power Cage with Crossover' }
    ]
  },
  {
    name: 'RitFit Dual Stack Commercial Cable Crossover Machine',
    slug: 'ritfit-dual-stack-commercial-cable-crossover',
    sku: 'AMZ-RTF-CBL',
    categorySlug: 'home-gym',
    price: 1299.00,
    comparePrice: 1550.00,
    stock: 12,
    weight: '175 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Pulleys: 18 vertical adjustable positions per column\nStacks: Dual plate-loaded or weight-stack cable carriage\nBearings: Sealed aluminum ball-bearing pulleys for frictionless glide\nIncluded: Multi-grip pull up bar and multiple handle attachments',
    description: '<h2>Isolate Every Muscle Angle: RitFit Cable Crossover</h2><p>Designed with dual swivel pulleys that rotate 180 degrees, allowing precise unilateral and bilateral chest flies, cable woodchops, and tricep pushdowns.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', alt: 'RitFit Cable Crossover Machine' }
    ]
  },
  {
    name: 'Major Fitness F22 All-in-One Smith Machine Power Rack Station',
    slug: 'major-fitness-f22-all-in-one-smith-machine',
    sku: 'AMZ-MJR-F22',
    categorySlug: 'home-gym',
    price: 1899.00,
    comparePrice: 2299.00,
    stock: 8,
    weight: '210 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Smith Bar: Linear bearing guided Smith bar with 14 safety lockouts\nCrossover: Dual cable system with 2:1 and 1:1 pulley ratios\nCapacity: 1000 lbs Power Rack / 500 lbs Smith Bar Rating',
    description: '<h2>The Ultimate All-in-One Center: Major Fitness F22</h2><p>Merges a guided Smith machine with an Olympic free-weight power rack and dual adjustable pulleys for total training autonomy without spotters.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=80', alt: 'Major Fitness F22 Smith Machine' }
    ]
  },
  {
    name: 'Total Gym APEX G5 Incline Bodyweight Workout Station',
    slug: 'total-gym-apex-g5-incline-bodyweight-station',
    sku: 'AMZ-TGM-APEX',
    categorySlug: 'home-gym',
    price: 449.00,
    comparePrice: 599.00,
    stock: 25,
    weight: '33 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Levels: 10 calibrated incline levels for customized bodyweight resistance\nExercises: Over 80 upper, core, and lower body exercises\nIncludes: Wing attachment, squat stand, leg pull accessory, and exercise wall chart',
    description: '<h2>Natural Bodyweight Leverage: Total Gym APEX G5</h2><p>Utilizes your own body weight against gravity on a gliding board, delivering low-impact joint-safe resistance for cardio and strength.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', alt: 'Total Gym APEX G5' }
    ]
  },
  {
    name: 'TRX All-in-One Suspension Trainer Bodyweight Training Kit',
    slug: 'trx-all-in-one-suspension-trainer-kit',
    sku: 'AMZ-TRX-PRO',
    categorySlug: 'home-gym',
    price: 179.00,
    comparePrice: 219.00,
    stock: 50,
    weight: '1.2 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Capacity: Safety-tested up to 700 lbs of bodyweight pull\nAnchors: Suspension anchor, door anchor, and mesh travel carry bag\nStraps: Industrial grade nylon webbing with textured rubber hand grips',
    description: '<h2>Gym in a Bag: TRX All-in-One Suspension Trainer</h2><p>Anchor to any sturdy door, beam, or outdoor tree to unlock hundreds of functional core, pull, and push exercises using body angle resistance.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', alt: 'TRX Suspension Trainer' }
    ]
  },

  // ─── RECOVERY, MOBILITY & ACCESSORIES (15 Products) ───
  {
    name: 'Theragun PRO Gen 5 Deep Tissue Percussive Massage Gun',
    slug: 'theragun-pro-gen-5-percussive-massage-gun',
    sku: 'AMZ-THG-PRO5',
    categorySlug: 'accessories',
    price: 499.00,
    comparePrice: 599.00,
    stock: 35,
    weight: '1.3 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Amplitude: 16 mm deep muscle amplitude\nMotor: QuietForce commercial brushless motor with 60 lbs stall force\nArm: 4 adjustable arm angles for reaching hard-to-reach lower back and lats\nAttachments: 6 specialized attachments including dampener and supersoft',
    description: '<h2>The Medical-Grade Recovery Standard: Theragun PRO (Gen 5)</h2><p>Reaches 60% deeper into muscle tissue than standard consumer massage guns to accelerate post-workout lactic acid clearance and restore mobility.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', alt: 'Theragun PRO Percussive Massager' }
    ]
  },
  {
    name: 'Hyperice Hypervolt 2 Pro Cordless Percussion Massager',
    slug: 'hyperice-hypervolt-2-pro-cordless-massager',
    sku: 'AMZ-HYP-VLT2',
    categorySlug: 'accessories',
    price: 329.00,
    comparePrice: 399.00,
    stock: 30,
    weight: '1.2 kg',
    isFeatured: true,
    isHot: false,
    shortDesc: 'Speeds: 5 distinct percussion speed settings with digital dial\nPressure: Patented Pressure Sensor Technology with 3 LED indicators\nBattery: 3-hour lithium-ion battery life per charge\nNoise: Quiet Glide technology with 90W high-torque motor',
    description: '<h2>Warm Up & Recover Like NBA Athletes: Hypervolt 2 Pro</h2><p>Equipped with 5 percussion levels and digital speed dial to relieve muscle soreness and stiffness instantly.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', alt: 'Hyperice Hypervolt 2 Pro' }
    ]
  },
  {
    name: 'TriggerPoint GRID Patented Multi-Density Foam Roller',
    slug: 'triggerpoint-grid-patented-foam-roller',
    sku: 'AMZ-TRG-GRID',
    categorySlug: 'accessories',
    price: 39.99,
    comparePrice: 49.99,
    stock: 65,
    weight: '0.65 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Surface: Patented multi-density matrix mimics a massage therapist\'s hands\nCore: Rigid hollow core won\'t break or bend under 500 lbs of weight\nLength: 13-inch compact length fits easily in any gym bag\nMaterial: Premium EVA foam resists sweat degradation',
    description: '<h2>Physical Therapist Recommended: TriggerPoint GRID Foam Roller</h2><p>The textured matrix channels blood flow directly to tight fascia, breaking up knots in hamstrings, calves, and thoracic spine.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=80', alt: 'TriggerPoint GRID Foam Roller' }
    ]
  },
  {
    name: 'Iron Gym Total Upper Body Workout Bar Doorway Pull-Up System',
    slug: 'iron-gym-total-upper-body-workout-bar',
    sku: 'AMZ-IRN-BAR',
    categorySlug: 'accessories',
    price: 34.99,
    comparePrice: 45.00,
    stock: 75,
    weight: '2.1 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Mounting: Instant leverage fit with zero screws or drilling into door frames\nFit: Fits standard residential doorways (24" to 32" wide)\nGrips: 3 grip positions (narrow, neutral, and wide grip)\nCapacity: Tested to support up to 300 lbs',
    description: '<h2>Zero-Drilling Upper Body Fitness: Iron Gym Doorway Bar</h2><p>Hang in doorway in seconds using leverage mechanics to perform pull-ups, chin-ups, and hanging knee raises with zero screws or wall holes.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Iron Gym Doorway Pull-Up Bar' }
    ]
  },
  {
    name: 'Gymreapers 10mm Heavy Leather Lever Weightlifting Belt (IPF Approved)',
    slug: 'gymreapers-10mm-leather-lever-weightlifting-belt',
    sku: 'AMZ-GMR-BLT',
    categorySlug: 'accessories',
    price: 120.00,
    comparePrice: 150.00,
    stock: 40,
    weight: '1.4 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Thickness: 10 mm genuine vegetable-tanned leather\nLever: Matte black heavy zinc alloy quick-release lever buckle\nApproval: USAPL & IPF competition approved\nSupport: Uniform 4" width provides maximum intra-abdominal pressure',
    description: '<h2>Maximum Intra-Abdominal Squat Support: Gymreapers 10mm Lever Belt</h2><p>Built with 10mm genuine leather and a rapid-clamp lever buckle to lock your core rock-solid during 500+ lb squats and deadlifts.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80', alt: 'Gymreapers 10mm Leather Lever Belt' }
    ]
  },
  {
    name: 'Rogue Fitness 3-Hole Gymnastics Carbon Hand Grips',
    slug: 'rogue-fitness-3-hole-carbon-hand-grips',
    sku: 'AMZ-ROG-GRP',
    categorySlug: 'accessories',
    price: 49.50,
    comparePrice: 60.00,
    stock: 55,
    weight: '0.2 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Material: Carbon fiber textured composite grips to smooth and powder-coated bars\nProtection: Prevents palm rips, tears, and blisters during high-volume bar workouts\nWrist: Custom neoprene padded wrist wrap with heavy velcro strap',
    description: '<h2>Stick to the Bar with No Chalk: Rogue Carbon Hand Grips</h2><p>Specially formulated carbon fiber technology sticks to slick pull-up bars without slipping, saving your palms from painful blisters and tears.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', alt: 'Rogue Gymnastics Hand Grips' }
    ]
  },
  {
    name: 'ProsourceFit Acupressure Mat and Pillow Set for Muscle Relief',
    slug: 'prosourcefit-acupressure-mat-and-pillow-set',
    sku: 'AMZ-PRF-ACU',
    categorySlug: 'accessories',
    price: 29.99,
    comparePrice: 39.99,
    stock: 45,
    weight: '0.8 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Spikes: 7920 precision acupressure points stimulate circulation\nFabric: 100% natural cotton cover with eco plant-based foam interior\nPillow: Contoured neck pillow targets tension headaches and upper traps',
    description: '<h2>Holistic Back Pain & Muscle Relief: ProsourceFit Acupressure Mat</h2><p>Lying on this acupressure mat for just 15 minutes a day triggers endorphin release, relaxes tight spinal muscles, and improves sleep quality.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=80', alt: 'ProsourceFit Acupressure Mat' }
    ]
  },
  {
    name: 'Fit Simplify 5-Level Resistance Loop Exercise Bands Set',
    slug: 'fit-simplify-5-level-resistance-loop-bands-set',
    sku: 'AMZ-FTS-BND',
    categorySlug: 'accessories',
    price: 18.99,
    comparePrice: 24.99,
    stock: 120,
    weight: '0.25 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Levels: Extra Light, Light, Medium, Heavy, Extra Heavy bands\nLatex: 100% genuine natural eco-friendly Malaysian latex\nIncluded: Instructional booklet, eBook guide, and travel carry bag',
    description: '<h2>Over 100,000 5-Star Amazon Reviews: Fit Simplify Loop Bands</h2><p>Target glutes, hips, and shoulders with snap-proof progressive loop resistance bands that never roll up or pinch skin.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=1200&q=80', alt: 'Fit Simplify Loop Resistance Bands' }
    ]
  },
  {
    name: 'Rogue Ohio Heavy-Duty Padded Cotton Lifting Straps',
    slug: 'rogue-ohio-heavy-duty-cotton-lifting-straps',
    sku: 'AMZ-ROG-STR',
    categorySlug: 'accessories',
    price: 22.00,
    comparePrice: 28.00,
    stock: 85,
    weight: '0.15 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Material: Heavy-gauge woven cotton webbing with reinforced box-X stitching\nPadding: Sewn-in soft neoprene wrist pad for comfortable heavy pulls\nLength: 20-inch strap length wraps 2-3 times around standard barbells',
    description: '<h2>Lock Onto 600+ lbs with Zero Grip Fatigue: Rogue Ohio Straps</h2><p>Durable cotton webbing provides a softer, grippier hold on barbells than nylon or leather, keeping the bar locked in your hands during deadlifts.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Rogue Heavy Duty Lifting Straps' }
    ]
  },
  {
    name: 'BalanceFrom 1/2-Inch Extra Thick Anti-Tear High Density Yoga Mat',
    slug: 'balancefrom-extra-thick-anti-tear-yoga-mat',
    sku: 'AMZ-BLF-MAT',
    categorySlug: 'accessories',
    price: 24.99,
    comparePrice: 34.99,
    stock: 70,
    weight: '1.1 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Thickness: 1/2" (12.7 mm) high density joint cushion\nNon-Slip: Double-sided ribbed non-slip traction pattern\nIncluded: Elastic carrying strap with shoulder loop\nMaterial: Moisture-resistant closed-cell technology wipes clean with soap',
    description: '<h2>Maximum Joint Padding on Hard Floors: BalanceFrom 1/2" Mat</h2><p>Extra thick 1/2-inch cushioning comfortably cushions spine, hips, knees, and elbows on hard tile, concrete, and hardwood gym floors.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=80', alt: 'BalanceFrom Extra Thick Workout Mat' }
    ]
  },
  {
    name: 'Renpho Smart Digital Bluetooth BMI Body Fat Composition Scale',
    slug: 'renpho-smart-digital-bluetooth-body-fat-scale',
    sku: 'AMZ-RNP-SCL',
    categorySlug: 'wellness',
    price: 32.99,
    comparePrice: 45.00,
    stock: 60,
    weight: '1.4 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Metrics: Tracks 13 essential metrics including Body Fat %, Muscle Mass, BMI, Water Weight\nSync: Syncs automatically with Apple Health, Samsung Health, Google Fit, and Fitbit\nSensors: 4 high-precision BIA bioelectrical impedance sensors\nGlass: 6 mm tempered safety glass platform',
    description: '<h2>Amazon\'s Choice Smart Scale: Renpho Digital Body Composition Scale</h2><p>Track fat loss and muscle gain trends over time with high-precision sensors that sync instantly to your smartphone health app.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80', alt: 'Renpho Smart Digital Scale' }
    ]
  },
  {
    name: 'Harbinger BioForm Heat-Activated Padded Weightlifting Gloves',
    slug: 'harbinger-bioform-heat-activated-weightlifting-gloves',
    sku: 'AMZ-HRB-GLV',
    categorySlug: 'accessories',
    price: 39.99,
    comparePrice: 49.99,
    stock: 50,
    weight: '0.2 kg',
    isFeatured: false,
    isHot: false,
    shortDesc: 'Tech: BioForm clay contour pads mold to your hand under body heat\nLeather: Premium SpiderGrip genuine leather palm with tacky grip\nWrist: Dual integrated wrist wrap stabilizers protect joint extension',
    description: '<h2>Heat-Molded Palm Protection: Harbinger BioForm Gloves</h2><p>The specialized BioForm clay pads soften under hand heat to mold directly around knurled handles, eliminating pressure hotspots and calluses.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', alt: 'Harbinger Padded Weightlifting Gloves' }
    ]
  },
  {
    name: 'RPM Training Session4 Speed Cable Jump Rope with Dual Bearings',
    slug: 'rpm-training-session4-speed-cable-jump-rope',
    sku: 'AMZ-RPM-ROPE',
    categorySlug: 'accessories',
    price: 65.00,
    comparePrice: 75.00,
    stock: 45,
    weight: '0.2 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Bearings: Dual axis micro-precision ball bearing system\nHandles: 100% Precision-machined aluminum handles with diamond knurling\nCable: Bare or coated steel cable engineered for effortless double-unders',
    description: '<h2>The World Record Double-Under Rope: RPM Session4</h2><p>Used by CrossFit Games champions, the RPM Session4 dual-bearing system creates zero rotational friction for blazing speed double-unders.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=1200&q=80', alt: 'RPM Session4 Speed Jump Rope' }
    ]
  },
  {
    name: 'Jayflex Hyperbell Adjustable Dumbbell to Barbell Converter Clamps',
    slug: 'jayflex-hyperbell-dumbbell-to-barbell-converter',
    sku: 'AMZ-JYF-BLC',
    categorySlug: 'accessories',
    price: 149.00,
    comparePrice: 189.00,
    stock: 30,
    weight: '5.5 kg',
    isFeatured: true,
    isHot: true,
    shortDesc: 'Compatibility: Clamps securely onto Bowflex, PowerBlock, or standard hex dumbbells\nBarbell: Solid steel connecting bar turns dumbbells into a 200 lb barbell\nInstallation: Heavy-duty quick-release locking collar mechanism',
    description: '<h2>Turn Your Dumbbells into an Olympic Barbell: Jayflex Hyperbell</h2><p>Save money and space by clamping your existing dumbbells into the Hyperbell bar to perform heavy bench presses, overhead presses, and deadlifts.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'Jayflex Hyperbell Barbell Converter' }
    ]
  },
  {
    name: 'BlenderBottle Strada 24oz Insulated Stainless Steel Shaker Cup',
    slug: 'blenderbottle-strada-24oz-insulated-stainless-steel-shaker',
    sku: 'AMZ-BLN-STR',
    categorySlug: 'wellness',
    price: 24.99,
    comparePrice: 32.00,
    stock: 90,
    weight: '0.4 kg',
    isFeatured: false,
    isHot: true,
    shortDesc: 'Insulation: Double-wall vacuum insulation keeps protein shakes ice cold 24 hours\nCap: Push-button open flip cap with safety slide lock\nMixer: Patented 316 surgical-grade stainless steel BlenderBall whisk included\nSteel: Odor & stain-resistant 18/8 food grade steel',
    description: '<h2>Ice Cold Shakes with Push-Button Lock: BlenderBottle Strada</h2><p>Double-wall vacuum insulation ensures your post-workout protein shake stays ice-cold, while the surgical steel whisk ball blends powder with zero clumps.</p>',
    images: [
      { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80', alt: 'BlenderBottle Strada Insulated Steel Shaker' }
    ]
  }
];

async function seedDatabase(dbUrl, dbName) {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting 50 Amazon Fitness Products Import on: [${dbName}]`);
  console.log(`======================================================`);

  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const categories = await prisma.category.findMany();
    const catMap = new Map(categories.map(c => [c.slug, c.id]));
    const fallbackCatId = catMap.get('strength-equipment') || categories[0].id;

    let count = 0;
    for (const item of amazonProducts) {
      const categoryId = catMap.get(item.categorySlug) || fallbackCatId;

      // Upsert product
      const product = await prisma.product.upsert({
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

      // Clear existing images and insert new ones
      await prisma.productImage.deleteMany({
        where: { productId: product.id }
      });

      for (let i = 0; i < item.images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: item.images[i].url,
            alt: item.images[i].alt,
            sortOrder: i + 1
          }
        });
      }

      count++;
      if (count % 10 === 0 || count === amazonProducts.length) {
        console.log(`✅ [${count}/${amazonProducts.length}] Processed for ${dbName}: "${item.name}"`);
      }
    }

    const totalProducts = await prisma.product.count();
    const totalImages = await prisma.productImage.count();
    console.log(`\n🎉 Success on [${dbName}]: Total Products = ${totalProducts}, Total Images = ${totalImages}`);
    return { dbName, totalProducts, totalImages };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function run() {
  console.log('⚡ Starting Dual-Database Sync for 50 Amazon Fitness Products...\n');
  const t0 = Date.now();

  // 1. Primary DB
  const primaryResult = await seedDatabase(PRIMARY_URL, 'PRIMARY DB (72.62.81.204:5432)');

  // 2. Backup DB
  const backupResult = await seedDatabase(BACKUP_URL, 'BACKUP DB (2.25.150.87:5434)');

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n================ FINAL DUAL-DB SYNC SUMMARY ================');
  console.log(`Primary Database: ${primaryResult.totalProducts} products | ${primaryResult.totalImages} images`);
  console.log(`Backup Database:  ${backupResult.totalProducts} products | ${backupResult.totalImages} images`);
  console.log(`Duration:         ${durationSec}s`);
  console.log(`Parity Status:    ${primaryResult.totalProducts === backupResult.totalProducts ? '100% EXACT PARITY ✔️' : 'MISMATCH ❌'}`);
  console.log('============================================================\n');
}

run().catch(err => {
  console.error('❌ Dual-DB import failed:', err);
  process.exit(1);
});
