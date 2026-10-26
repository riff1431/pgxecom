require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const productsData = [
  {
    slug: 'pgx-pro-treadmill-x1',
    name: 'PGX Pro Commercial Treadmill X1',
    sku: 'PGX-TRD-X1',
    price: 1899.0,
    comparePrice: 2199.0,
    weight: '125 kg',
    shortDesc: `Motor: 3.5 CHP Commercial Grade AC Motor\nSpeed Range: 1.0 – 22.0 km/h\nIncline: 0 – 15% Powered Auto Incline\nRunning Surface: 550 x 1520 mm Orthopedic Belt\nDisplay: 10.1" Full HD Touchscreen Console\nMax User Weight: 160 kg (352 lbs)\nCushioning: PGX CloudFlex 8-Point Shock Absorption\nWarranty: Lifetime Frame, 5-Year Motor, 2-Year Parts`,
    description: `<h2>Experience Elite Performance with the PGX Pro Commercial Treadmill X1</h2><p>Engineered for high-intensity athletes and commercial fitness environments, the <strong>PGX Pro Treadmill X1</strong> delivers club-level power and durability into your training space. Featuring a high-torque <strong>3.5 CHP commercial AC drive motor</strong> and a spacious orthopedic running deck, the X1 is purpose-built to withstand strenuous marathon training and explosive sprint intervals.</p><h3>Key Performance Highlights</h3><ul><li><strong>High-Torque 3.5 CHP Drive System:</strong> Maintains ultra-quiet, stutter-free velocity up to 22 km/h without thermal throttling.</li><li><strong>Dynamic 15% Auto Incline:</strong> Simulates challenging hill climbs and outdoor terrain to boost calorie burn and target glutes and hamstrings.</li><li><strong>CloudFlex 8-Point Cushioning Deck:</strong> Multi-layer elastomer shock absorption minimizes joint stress and knee impact by up to 35% compared to asphalt.</li><li><strong>Interactive 10.1" Touchscreen:</strong> Real-time biometric metrics, heart-rate zone visualization, cinematic virtual run routes, and Bluetooth audio syncing.</li><li><strong>Heavy-Gauge Precision Steel Frame:</strong> Precision robotically welded frame engineered for stability with zero wobble even at top speed.</li></ul><h3>Technical Specifications</h3><table><tbody><tr><td><strong>Motor</strong></td><td>3.5 CHP Continuous / 5.5 HP Peak Commercial AC</td></tr><tr><td><strong>Speed Range</strong></td><td>1.0 - 22.0 km/h (Quick-Speed Hotkeys)</td></tr><tr><td><strong>Running Area</strong></td><td>550 x 1520 mm (22 x 60 inches)</td></tr><tr><td><strong>Max User Weight</strong></td><td>160 kg / 352 lbs</td></tr><tr><td><strong>Incline Range</strong></td><td>0 to 15 Levels Motorized Auto Incline</td></tr><tr><td><strong>Deck System</strong></td><td>25mm Reversible Phenolic Commercial Deck</td></tr><tr><td><strong>Connectivity</strong></td><td>Bluetooth 5.2, FTMS Protocol, Kinomap & Zwift Compatible</td></tr><tr><td><strong>Warranty</strong></td><td>Lifetime Frame, 5-Year Motor, 2-Year Electronics & Labor</td></tr></tbody></table>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Pro Commercial Treadmill X1 Front View' },
      { url: 'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Pro Commercial Treadmill X1 In Action' }
    ]
  },
  {
    slug: 'pgx-smart-exercise-bike',
    name: 'PGX Smart Magnetic Indoor Cycling Bike',
    sku: 'PGX-BIK-01',
    price: 1299.0,
    comparePrice: 1499.0,
    weight: 54,
    shortDesc: `Flywheel: 18 kg Precision-Balanced Chrome Flywheel\nResistance: 32-Level Whisper-Quiet Magnetic Resistance\nDrive System: Poly-V Multi-Ribbed Belt Drive\nPedals: Dual-Sided SPD Clips & Toe Cages\nConnectivity: Bluetooth 5.0 FTMS & Ant+ Compatible\nMax User Weight: 150 kg (330 lbs)\nHandlebars: 4-Way Adjustable Aerodynamic Racing Grips\nWarranty: 5-Year Frame, 2-Year Parts`,
    description: `<h2>Professional Studio Ride at Home: PGX Smart Magnetic Exercise Bike</h2><p>Designed for pure cycling performance, the <strong>PGX Smart Magnetic Exercise Bike</strong> combines whisper-quiet frictionless magnetic resistance with an ultra-smooth 18 kg precision flywheel. Whether you're attacking steep hill intervals or sustaining high-cadence endurance rides, the reinforced triangular frame provides unmatched stiffness and ride ergonomics.</p><h3>Key Features</h3><ul><li><strong>18 kg Balanced Perimeter Flywheel:</strong> Generates authentic road-feel momentum for realistic pedal cadence.</li><li><strong>Silent Magnetic Resistance (SMR):</strong> Contact-free eddy-current braking system delivers 32 resistance levels with zero wear, tear, or maintenance noise.</li><li><strong>Poly-V Industrial Belt Drive:</strong> Eliminates chain vibrations and grease, ensuring a quiet workout that won't disturb your household.</li><li><strong>4-Way Precision Micro-Adjustability:</strong> Ergonomic saddle and multi-grip aero handlebars adjust vertically and horizontally to accommodate riders from 5'0" to 6'6".</li><li><strong>Smart App Ecosystem Integration:</strong> Syncs effortlessly via Bluetooth FTMS with Peloton Digital, Zwift, Kinomap, and Strava.</li></ul><h3>Specifications</h3><table><tbody><tr><td><strong>Flywheel Weight</strong></td><td>18 kg / 40 lbs Precision Balanced</td></tr><tr><td><strong>Resistance Type</strong></td><td>32-Level Manual/Digital Magnetic Resistance</td></tr><tr><td><strong>Max Rider Weight</strong></td><td>150 kg / 330 lbs</td></tr><tr><td><strong>Drive Mechanism</strong></td><td>Heavy-Duty Poly-V Belt</td></tr><tr><td><strong>Q-Factor</strong></td><td>168 mm Commercial Geometry</td></tr><tr><td><strong>Dimensions</strong></td><td>125 x 54 x 118 cm</td></tr><tr><td><strong>Warranty</strong></td><td>5-Year Frame, 2-Year Electronic Components</td></tr></tbody></table>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Smart Magnetic Indoor Cycling Bike' },
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Smart Bike Studio Perspective' }
    ]
  },
  {
    slug: 'pgx-adjustable-dumbbells',
    name: 'PGX Selectorized Pro Adjustable Dumbbells (5–50kg Set)',
    sku: 'PGX-DMB-PRO',
    price: 599.0,
    comparePrice: 699.0,
    weight: 100,
    shortDesc: `Weight Range: 5 kg to 50 kg (11 to 110 lbs) Per Dumbbell\nAdjustability: 1-Second Dual-Dial Mechanism\nReplaces: 15 Traditional Dumbbell Sets\nPlates: Precision Machined Laser-Cut Steel with Urethane Coating\nHandle: Diamond-Knurled Contoured Grip\nStorage: Heavy-Duty Molded Storage Trays Included\nWarranty: 3-Year Mechanical Warranty`,
    description: `<h2>Ultimate Space-Saving Strength: PGX Selectorized Adjustable Dumbbells</h2><p>Declutter your training area while unlocking commercial versatility with the <strong>PGX Selectorized Adjustable Dumbbell Set</strong>. Utilizing a rapid dual-dial selector system, effortlessly alternate from 5 kg warm-ups to 50 kg compound movements in under two seconds. Engineered with heavy-duty urethane-coated steel plates, each dumbbell delivers quiet operation and bulletproof structural integrity.</p><h3>Engineering & Design Features</h3><ul><li><strong>15 Weight Settings in 1 Compact Unit:</strong> Replaces an entire commercial dumbbell rack, saving over 80% of floor space.</li><li><strong>Rapid Dial Selection:</strong> Turn the dial to your target weight, lift, and the interlocking dovetail teeth lock the selected plates securely into position.</li><li><strong>Laser-Cut Steel Core:</strong> Built without brittle cast iron or plastic tabs, surviving high-volume commercial workouts without slipping.</li><li><strong>Ergonomic Diamond Knurling:</strong> Aircraft-grade knurled steel handle delivers positive grip traction with zero slip even during heavy sweat sessions.</li></ul><h3>Specifications</h3><table><tbody><tr><td><strong>Weight Increments</strong></td><td>5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 45, 50 kg</td></tr><tr><td><strong>Plates Material</strong></td><td>Machined Steel Plates with High-Impact Poly Armor</td></tr><tr><td><strong>Handle Diameter</strong></td><td>32 mm Knurled Steel</td></tr><tr><td><strong>Tray Footprint</strong></td><td>44 x 24 cm per cradle</td></tr><tr><td><strong>Warranty</strong></td><td>3-Year Comprehensive Mechanical Replacement Warranty</td></tr></tbody></table>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Selectorized Adjustable Dumbbells on Rack' },
      { url: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Adjustable Dumbbells Knurled Handle View' }
    ]
  },
  {
    slug: 'pgx-rowing-machine',
    name: 'PGX Precision Commercial Air & Magnetic Rower',
    sku: 'PGX-ROW-01',
    price: 1099.0,
    comparePrice: 1299.0,
    weight: 42,
    shortDesc: `Resistance: Dual Air Damper & 16-Level Magnetic Resistance\nMonorail: Stainless Steel Track with High-Impact Rollers\nConsole: Backlit Performance LCD with Watts, Pace & Split 500m\nDrive: High-Tensile Steel Link Chain\nFootrests: Adjustable Flex-Foot with Quick-Release Straps\nMax User Weight: 175 kg (385 lbs)\nStorage: Quick-Release Separating Frame for Easy Storage\nWarranty: 5-Year Frame, 2-Year Mechanical & Monitor`,
    description: `<h2>Total Body Conditioning: PGX Commercial Air & Magnetic Rower</h2><p>Engage over 86% of your body’s muscle groups with the <strong>PGX Commercial Air & Magnetic Rower</strong>. Designed with a dual air-resistance flywheel and 16-stage magnetic resistance system, this rower delivers smooth catch-and-drive mechanics that simulate rowing on open water, providing low-impact cardiovascular endurance and explosive anaerobic power.</p><h3>Key Features</h3><ul><li><strong>Hybrid Air & Magnetic Drag:</strong> The spiral air damper regulates airflow to the flywheel, while the magnetic system provides targeted resistance for power sprints.</li><li><strong>Stainless Steel Seat Track:</strong> Ultra-smooth aluminum and stainless steel monorail guarantees effortless seat glide through every stroke phase.</li><li><strong>Backlit Performance Monitor:</strong> Tracks 500m split time, watts output, stroke rate (SPM), calories burned, total distance, and Bluetooth heart rate.</li><li><strong>Space-Saving Quick Disconnect:</strong> Breaks down effortlessly into two lightweight segments without tools for upright closet or corner storage.</li></ul><h3>Specifications</h3><table><tbody><tr><td><strong>Monorail Length</strong></td><td>137 cm (Accommodates inseams up to 38")</td></tr><tr><td><strong>Chain / Cord</strong></td><td>Nickel-Plated Steel Chain in Fully Enclosed Housing</td></tr><tr><td><strong>Max User Weight</strong></td><td>175 kg / 385 lbs</td></tr><tr><td><strong>Stored Dimensions</strong></td><td>64 x 84 x 137 cm (Upright)</td></tr><tr><td><strong>Machine Weight</strong></td><td>42 kg</td></tr><tr><td><strong>Warranty</strong></td><td>5-Year Structural Frame, 2-Year Electronics & Wear Items</td></tr></tbody></table>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Commercial Air Rower in Studio' },
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Rower Performance Setup' }
    ]
  },
  {
    slug: 'pgx-home-gym-system',
    name: 'PGX Multi-Station Home Gym & Cable Crossover System',
    sku: 'PGX-HGM-01',
    price: 2499.0,
    comparePrice: 2899.0,
    weight: 285,
    shortDesc: `Frame: 3" x 3" 11-Gauge Heavy Structural Steel\nStacks: Dual 90 kg (200 lbs) Precision Cast Iron Weight Stacks\nCable System: Aircraft-Grade 2000 lb Rated Nylon-Coated Cables\nStations: High/Low Pulleys, Pec Fly, Chest Press, Lat Pulldown, Leg Extension\nPulleys: Aluminum Sealed Ball-Bearing Pulleys\nFootprint: 210 x 165 x 215 cm\nWarranty: Lifetime Frame, 5-Year Cables & Pulleys`,
    description: `<h2>Commercial Versatility in One Machine: PGX Multi-Station Home Gym</h2><p>Transform any room into a full-scale private health club with the <strong>PGX Multi-Station Home Gym System</strong>. Built around dual 90 kg precision-machined weight stacks and aircraft-rated cable systems, this powerhouse allows up to two users to train simultaneously across more than 75 distinct strength movements.</p><h3>Key Features</h3><ul><li><strong>Comprehensive Multi-Station Design:</strong> Seamlessly transition between chest press, seated row, lat pulldown, pec-fly, ab crunches, and standing leg curls.</li><li><strong>Industrial Grade Steel Construction:</strong> Fabricated with commercial 11-gauge 75x75mm tubular steel finished in durable anti-corrosion electrostatic powder coat.</li><li><strong>Ultra-Smooth Pulley Movement:</strong> CNC-machined aluminum pulleys with Japanese deep-groove sealed ball bearings ensure frictionless glide with zero drag.</li><li><strong>Multi-Position Adjustable Backrest:</strong> High-density tear-resistant vinyl upholstery with lumbar contouring supports heavy presses with optimal spinal alignment.</li></ul><h3>Specifications</h3><table><tbody><tr><td><strong>Weight Stacks</strong></td><td>Dual 90 kg / 200 lbs Precision Stacks (1:1 and 2:1 ratio options)</td></tr><tr><td><strong>Cable Rating</strong></td><td>Military Spec 2000 lbs Tensile Strength</td></tr><tr><td><strong>Footprint Dimensions</strong></td><td>210 cm (L) x 165 cm (W) x 215 cm (H)</td></tr><tr><td><strong>Machine Weight</strong></td><td>285 kg</td></tr><tr><td><strong>Included Attachments</strong></td><td>Lat Bar, Tricep Rope, Revolving Low Row Bar, Ankle Strap, D-Handles</td></tr><tr><td><strong>Warranty</strong></td><td>Lifetime Frame, 5-Year Pulleys & Cables, 2-Year Upholstery</td></tr></tbody></table>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Multi-Station Home Gym & Cable Machine' },
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Multi-Station Weight Stack View' }
    ]
  },
  {
    slug: 'pgx-performance-tshirt',
    name: 'PGX Seamless Pro Compression Performance T-Shirt',
    sku: 'PGX-APP-01',
    price: 45.0,
    comparePrice: 55.0,
    weight: 0.2,
    shortDesc: `Material: 88% Moisture-Wicking Poly / 12% Elastane Spandex\nFit: Athletic Ergonomic Raglan Cut\nTechnology: Anti-Odor Silver-Ion Micro-Mesh & Quick-Dry\nBreathability: Laser-Cut Targeted Ventilation Zones\nSeams: Flatlock Anti-Chafing Stitching\nCare: Machine Washable, Shape-Retaining Fabric`,
    description: `<h2>Peak Athletic Comfort: PGX Seamless Compression Performance Tee</h2><p>Designed for intense training regimens, the <strong>PGX Seamless Performance T-Shirt</strong> utilizes advanced 4-way stretch fiber engineering to eliminate friction and elevate mobility. Engineered with moisture-wicking capillary microfibers and targeted laser-cut ventilation zones, stay cool and focused through the most demanding workouts.</p><h3>Key Highlights</h3><ul><li><strong>Sweat-Wicking Thermoregulation:</strong> Pulls perspiration away from skin surface to accelerate evaporation.</li><li><strong>Flatlock Seam Construction:</strong> Zero chafing during repetitive barbell or dumbbell movements.</li><li><strong>Anti-Bacterial Silver Shield:</strong> Naturally neutralizes odor-causing microbes to maintain fresh performance wear.</li><li><strong>Reinforced Collar & Hem:</strong> Retains crisp shape wash after wash without stretching or sagging.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Seamless Pro Compression Tee' }
    ]
  },
  {
    slug: 'pgx-leggings',
    name: 'PGX High-Waisted Sculpt Active Training Leggings',
    sku: 'PGX-APP-02',
    price: 65.0,
    comparePrice: 79.0,
    weight: 0.25,
    shortDesc: `Fabric: 75% Polyamide Microfiber / 25% Lycra Spandex\nWaistband: 4.5" High-Rise Non-Slip Supportive Compression Band\nFeatures: 100% Squat-Proof, Zero-Sheer Guaranteed, Deep Side Drop-In Pockets\nStitching: Reinforced Gusseted Crotch for Unrestricted Mobility\nLength: 7/8 Ankle Inseam`,
    description: `<h2>Squat-Proof Support: PGX High-Waisted Sculpt Active Leggings</h2><p>Engineered for high-intensity lifting, HIIT conditioning, and mobility flows, the <strong>PGX Sculpt Active Leggings</strong> deliver a second-skin compressive feel that hugs your contours without restriction. Tested under heavy Olympic lifting squats to guarantee 100% opacity and zero slipping.</p><h3>Key Features</h3><ul><li><strong>100% Squat-Proof Opacity:</strong> High-density dual-interlock knit fabric prevents transparency under heavy stretches.</li><li><strong>Contoured Supportive Waistband:</strong> Stays locked in place without rolling down or digging during sprints or burpees.</li><li><strong>Dual Drop-In Phone Pockets:</strong> Ergonomically angled side storage fits large smartphones securely during cardio.</li><li><strong>Anti-Microbial Quick-Dry Fiber:</strong> Dries 3x faster than cotton while resisting pillage and lint accumulation.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Sculpt Active Training Leggings' }
    ]
  },
  {
    slug: 'pgx-training-shoes',
    name: 'PGX Apex Elite Cross-Training & Lifting Shoes',
    sku: 'PGX-APP-03',
    price: 135.0,
    comparePrice: 160.0,
    weight: 0.85,
    shortDesc: `Drop: 4mm Heel-to-Toe Functional Training Drop\nSole: High-Traction Diamond Gum Rubber Outsole with Rope-Wrap Guard\nMidsole: Dual-Density EVA Compound for Heavy Squat Stability & Sprint Cushioning\nUpper: Breathable Ripstop Ballistic Mesh with TPU Lateral Cage\nClosure: Reinforced Lace-Lock System with Padded Ankle Collar`,
    description: `<h2>Engineered for Power & Agility: PGX Apex Elite Cross-Training Shoes</h2><p>From heavy barbell cleans to box jumps and sled pushes, the <strong>PGX Apex Elite Training Shoe</strong> provides the wide-base platform and responsive lateral stability required by modern athletes. Featuring a firm heel cup for zero power leakage and a flexible forefoot for explosive agility drills.</p><h3>Key Features</h3><ul><li><strong>Zero-Compression Stable Heel:</strong> Provides a rigid foundation for deadlifts and squats with maximum ground contact.</li><li><strong>High-Grip Rope-Wrap Outsole:</strong> High-friction rubber wraps around medial and lateral arches for abrasion-resistant rope climbs.</li><li><strong>Breathable Ballistic Ripstop Mesh:</strong> Keeps feet cool while reinforced TPU overlays protect high-wear zones.</li><li><strong>Wide Anatomical Toe Box:</strong> Allows natural toe splay under heavy loads for improved balance and power transfer.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Apex Elite Cross-Training Shoes' }
    ]
  },
  {
    slug: 'pgx-gym-bag',
    name: 'PGX Tactical Waterproof Heavy Gym Duffle Bag (45L)',
    sku: 'PGX-BAG-01',
    price: 85.0,
    comparePrice: 110.0,
    weight: 1.2,
    shortDesc: `Capacity: 45 Liters Heavy Duty Storage\nMaterial: 900D Military-Grade Water-Repellent Oxford Polyester\nCompartments: Ventilated Shoe Garage, Wet/Dry Waterproof Zipper Pocket, Padded Laptop Sleeve\nZippers: Waterproof YKK AquaGuard Hardware\nStraps: Breathable Air-Mesh Ergonomic Detachable Shoulder Harness`,
    description: `<h2>Rugged & Organized: PGX Tactical Waterproof Gym Duffle (45L)</h2><p>Built like a tank for the dedicated gym-goer, the <strong>PGX Tactical 45L Duffle</strong> organizes all your lifting gear, knee sleeves, lifting belt, sneakers, and shaker bottles in military-grade weather-resistant compartments.</p><h3>Key Highlights</h3><ul><li><strong>Dedicated Ventilated Shoe Garage:</strong> Keeps dirty workout footwear isolated with dual breathable grommets.</li><li><strong>Internal Waterproof Wet-Pocket:</strong> Sealed pouch for sweaty gym wear or swimming gear without moisture leakage.</li><li><strong>MOLLE Webbing System:</strong> Modular attachment loops on exterior for clipping keys, carabiners, and water bottles.</li><li><strong>Padded Heavy-Duty Straps:</strong> Dual-layer high-density foam distributes weight evenly across shoulder and back.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Tactical Waterproof Heavy Gym Duffle Bag' }
    ]
  },
  {
    slug: 'pgx-stainless-bottle',
    name: 'PGX Pro Thermal Insulated Stainless Steel Sports Bottle (1000ml)',
    sku: 'PGX-WEL-01',
    price: 35.0,
    comparePrice: 45.0,
    weight: 0.45,
    shortDesc: `Capacity: 1000 ml (32 oz)\nInsulation: TempShield Double-Wall Vacuum Insulation (24h Cold / 12h Hot)\nSteel: 18/8 Pro-Grade Kitchen Stainless Steel (BPA & Phthalate Free)\nCap: Leakproof Chug Spout Lid with Integrated Carry Loop\nFinish: Scratch-Resistant Matte Powder Coat with Laser-Engraved Logo`,
    description: `<h2>Ice-Cold Hydration Every Rep: PGX Pro Thermal Steel Bottle</h2><p>Keep your BCAAs and hydration ice-cold throughout your longest training sessions with the <strong>PGX Pro 1000ml Vacuum Insulated Bottle</strong>. Crafted with 18/8 food-grade stainless steel that never transfers flavors or sweats on your equipment.</p><h3>Key Features</h3><ul><li><strong>Double-Wall Vacuum Insulation:</strong> Keeps liquids icy cold for up to 24 hours or steaming hot for 12 hours.</li><li><strong>Zero Condensation Sweat-Free Exterior:</strong> Keeps hands dry and grip secure on weights and machines.</li><li><strong>Food-Grade 18/8 Steel:</strong> Pure taste guarantee with zero metallic aftertaste or microplastic leaching.</li><li><strong>Wide-Mouth Architecture:</strong> Easily accommodates large ice cubes and protein powder scoops.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Pro Thermal Insulated Steel Sports Bottle' }
    ]
  },
  {
    slug: 'pgx-yoga-mat',
    name: 'PGX High-Density Non-Slip Eco Alignment Workout Mat',
    sku: 'PGX-ACC-01',
    price: 55.0,
    comparePrice: 70.0,
    weight: 1.1,
    shortDesc: `Thickness: 8 mm High-Density Joint-Protective Cushioning\nMaterial: Eco-Friendly Non-Toxic Recycled TPE\nGrip: Laser-Etched Body Alignment System & Dual-Texture Wave Traction\nDimensions: 183 x 66 cm (72 x 26 inches)\nIncluded: Elastic Quick-Carry Strap with Shoulder Loop`,
    description: `<h2>Superior Joint Protection: PGX High-Density Non-Slip Workout Mat</h2><p>Whether practicing dynamic yoga vinyasas, core abdominal circuits, or post-lift mobility stretches, the <strong>PGX 8mm Alignment Workout Mat</strong> provides the cushion and stability needed to protect wrists, knees, and spine on hard gym floors.</p><h3>Key Highlights</h3><ul><li><strong>8mm High-Density Cushioning:</strong> Premium rebound material absorbs pressure points without compromising balance.</li><li><strong>Laser-Etched Alignment Lines:</strong> Guides posture and hand/foot placement for safe, balanced mechanics.</li><li><strong>Dual-Sided Anti-Skid Texture:</strong> Firmly grips hardwood, concrete, or carpeted surfaces with zero sliding.</li><li><strong>Closed-Cell Waterproof Surface:</strong> Blocks sweat and bacteria from penetrating the interior foam for easy wipe-downs.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=80', alt: 'PGX High-Density Non-Slip Workout Mat' }
    ]
  },
  {
    slug: 'pgx-resistance-bands',
    name: 'PGX Pro Heavy-Duty Loop & Tube Resistance Bands Set (5-Level)',
    sku: 'PGX-ACC-02',
    price: 39.0,
    comparePrice: 49.0,
    weight: 0.9,
    shortDesc: `Resistance: 5 Color-Coded Levels (10 lbs up to 150 lbs Stackable Tension)\nMaterial: 100% Multi-Layer Natural Malaysian Latex\nIncludes: 5 Heavy Tube Bands, 2 Soft-Grip Foam Handles, 2 Ankle Straps, Door Anchor & Travel Pouch\nSnap-Proof: Inner Anti-Snap Safety Cord Engineering\nWarranty: 2-Year Full Replacement Guarantee`,
    description: `<h2>Full-Body Resistance Anywhere: PGX Pro 5-Level Resistance Bands Set</h2><p>Build muscle, warm up joints, and rehabilitate mobility with the <strong>PGX Pro Heavy-Duty Resistance Set</strong>. Formulated from premium layered natural Malaysian latex for smooth, progressive tension without sudden snapping.</p><h3>Key Features</h3><ul><li><strong>Up to 150 lbs of Stackable Tension:</strong> Combine yellow (10lb), blue (20lb), green (30lb), black (40lb), and red (50lb) for customized resistance.</li><li><strong>Anti-Snap Inner Safety Core:</strong> High-strength nylon safety tether prevents overstretching and snap-back injury.</li><li><strong>Heavy-Duty Steel Carabiners:</strong> Welded D-rings and industrial zinc carabiners withstand max tension loads.</li><li><strong>Compact Carry Bag Included:</strong> Pack a full home gym workout into a carry pouch weighing under 1.2 kg.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Pro Heavy-Duty Resistance Bands Set' }
    ]
  },
  {
    slug: 'pgx-wireless-headphones',
    name: 'PGX Active Noise Cancelling Wireless Sport Over-Ear Headphones',
    sku: 'PGX-ACC-03',
    price: 179.0,
    comparePrice: 219.0,
    weight: 0.28,
    shortDesc: `Sound: 40 mm Beryllium Drivers with BassBoost Audio Profile\nNoise Cancellation: Hybrid Active Noise Cancellation (Up to -38dB)\nBattery: 45 Hours Playtime (Quick-Charge 10 min = 5 hours)\nSweat Resistance: IPX7 Nano-Coated Waterproof Protection\nEar Cushions: Breathable Protein Leather with Cooling Gel Layer\nConnectivity: Bluetooth 5.3 Low Latency Multipoint`,
    description: `<h2>Immersive Training Focus: PGX Active Noise Cancelling Sport Headphones</h2><p>Silence gym chatter and lock into your workout zone with the <strong>PGX Active Noise Cancelling Sport Headphones</strong>. Custom-tuned with 40mm beryllium drivers, experience punchy bass, crisp highs, and an ergonomic secure fit designed to stay locked during intense sprints and heavy deadlifts.</p><h3>Key Features</h3><ul><li><strong>Hybrid ANC -38dB Technology:</strong> Dual microphones detect and invert exterior noise for uninterrupted focus.</li><li><strong>IPX7 Sweat & Water Proofing:</strong> Internal nano-coating withstands torrential sweat and post-workout rinses.</li><li><strong>Cooling Gel Protein Leather Cushions:</strong> Dissipates heat buildup around ears during extended training sessions.</li><li><strong>45-Hour Battery Endurance:</strong> Over a month of workouts on a single charge with Type-C rapid refueling.</li></ul>`,
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', alt: 'PGX Active Noise Cancelling Wireless Sport Headphones' }
    ]
  }
];

async function main() {
  console.log('🚀 Starting Fitness Catalog Enhancement on remote database...');
  let updatedCount = 0;

  for (const item of productsData) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { images: true }
    });

    if (!existing) {
      console.log(`⚠️ Product with slug "${item.slug}" not found, skipping.`);
      continue;
    }

    // 1. Update product main info
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: item.name,
        sku: item.sku,
        price: item.price,
        comparePrice: item.comparePrice,
        weight: typeof item.weight === 'number' ? `${item.weight} kg` : item.weight,
        shortDesc: item.shortDesc,
        description: item.description,
        isActive: true,
        isFeatured: true
      }
    });

    // 2. Replace placeholder images with high-resolution fitness photography
    await prisma.productImage.deleteMany({
      where: { productId: existing.id }
    });

    for (let i = 0; i < item.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: existing.id,
          url: item.images[i].url,
          alt: item.images[i].alt,
          sortOrder: i + 1
        }
      });
    }

    updatedCount++;
    console.log(`✅ [${updatedCount}/${productsData.length}] Updated: "${item.name}" with ${item.images.length} images.`);
  }

  console.log(`\n🎉 Successfully upgraded ${updatedCount} products with realistic fitness instruments, rich specs, and HD photography!`);
}

main()
  .catch((e) => {
    console.error('❌ Update script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
