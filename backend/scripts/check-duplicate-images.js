const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public' });

async function checkDupes() {
  const res = await pool.query(`
    SELECT pi.url, COUNT(DISTINCT pi."productId") as prod_count, array_agg(p.name) as prods
    FROM product_images pi
    JOIN products p ON pi."productId" = p.id
    GROUP BY pi.url
    HAVING COUNT(DISTINCT pi."productId") > 1
    ORDER BY prod_count DESC
  `);
  console.log('Total Duplicated Image URLs:', res.rows.length);
  res.rows.forEach(r => {
    console.log(`\nURL: ${r.url.substring(0, 65)}... (${r.prod_count} products)`);
    r.prods.forEach(name => console.log('  - ' + name));
  });
  await pool.end();
}

checkDupes().catch(console.error);
