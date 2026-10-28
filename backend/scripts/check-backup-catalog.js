const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://pgxshop:XxkJ9rWMHlgAusrCUzKs@2.25.150.87:5434/pgxshop?schema=public' });

async function checkBackup() {
  const dupes = await pool.query(`
    SELECT pi.url, COUNT(DISTINCT pi."productId") as prod_count, array_agg(p.name) as prods
    FROM product_images pi
    JOIN products p ON pi."productId" = p.id
    GROUP BY pi.url
    HAVING COUNT(DISTINCT pi."productId") > 1
    ORDER BY prod_count DESC
  `);
  console.log('Backup DB Duplicated Image URLs:', dupes.rows.length);

  const total = await pool.query('SELECT COUNT(*) FROM products');
  const totalImg = await pool.query('SELECT COUNT(*) FROM product_images');
  console.log(`Backup DB: ${total.rows[0].count} products, ${totalImg.rows[0].count} images.`);
  await pool.end();
}

checkBackup().catch(console.error);
