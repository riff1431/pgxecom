const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public' });

async function list() {
  const res = await pool.query(`
    SELECT p.id, p.name, p.slug, p.sku, pi.url
    FROM products p
    LEFT JOIN product_images pi ON pi."productId" = p.id AND pi."sortOrder" = 1
    ORDER BY p.name ASC
  `);
  console.log('Total Products in DB:', res.rows.length);
  res.rows.forEach((r, idx) => {
    console.log(`[${String(idx+1).padStart(2)}] ${r.sku?.padEnd(14)} | ${r.name.substring(0, 48).padEnd(48)} | ${r.url ? r.url.substring(0, 50) : 'NO IMAGE'}`);
  });
  await pool.end();
}

list().catch(console.error);
