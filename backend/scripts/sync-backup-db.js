const { Pool } = require('pg');

const SOURCE_URL = 'postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public';
const TARGET_URL = 'postgresql://pgxshop:XxkJ9rWMHlgAusrCUzKs@2.25.150.87:5434/pgxshop?schema=public';

const sourcePool = new Pool({ connectionString: SOURCE_URL });
const targetPool = new Pool({ connectionString: TARGET_URL });

const TABLES_ORDER = [
  'users',
  'addresses',
  'categories',
  'shipping_zones',
  'products',
  'product_images',
  'product_variants',
  'coupons',
  'orders',
  'order_items',
  'order_status_history',
  'invoices',
  'reviews',
  'wishlists',
  'banners',
  'blog_posts',
  'store_settings',
  'smtp_settings',
  'stripe_profiles',
  'settings_audit_logs'
];

async function syncTable(clientTarget, tableName) {
  // 1. Get all columns for table from Source
  const colsRes = await sourcePool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
    [tableName]
  );
  const columns = colsRes.rows.map(r => r.column_name);
  if (columns.length === 0) {
    console.log(`⚠️ Skipping table "${tableName}": no columns found in source.`);
    return { table: tableName, sourceCount: 0, targetCount: 0 };
  }

  const quotedCols = columns.map(c => `"${c}"`).join(', ');

  // 2. Fetch all rows from Source
  const sourceRowsRes = await sourcePool.query(`SELECT ${quotedCols} FROM "${tableName}"`);
  const rows = sourceRowsRes.rows;

  // 3. Clear target table
  await clientTarget.query(`TRUNCATE TABLE "${tableName}" CASCADE`);

  if (rows.length === 0) {
    console.log(`ℹ️ "${tableName}": 0 rows in source (empty table).`);
    return { table: tableName, sourceCount: 0, targetCount: 0 };
  }

  // 4. Batch insert into Target
  const CHUNK_SIZE = 50;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const valuePlaceholders = [];
    const values = [];

    chunk.forEach((row, rowIdx) => {
      const rowPlaceholders = [];
      columns.forEach((col, colIdx) => {
        values.push(row[col]);
        rowPlaceholders.push(`$${rowIdx * columns.length + colIdx + 1}`);
      });
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    });

    const insertSql = `INSERT INTO "${tableName}" (${quotedCols}) VALUES ${valuePlaceholders.join(', ')}`;
    await clientTarget.query(insertSql, values);
  }

  // 5. Verify Target count
  const targetCountRes = await clientTarget.query(`SELECT COUNT(*)::int as count FROM "${tableName}"`);
  const targetCount = targetCountRes.rows[0].count;

  console.log(`✅ "${tableName}": ${rows.length} rows migrated (Target: ${targetCount}).`);
  return { table: tableName, sourceCount: rows.length, targetCount };
}

async function main() {
  console.log('🚀 Starting Full Database Migration & Sync to Backup DB...');
  console.log('Source: 72.62.81.204:5432/postgres');
  console.log('Target: 2.25.150.87:5434/pgxshop\n');

  const clientTarget = await targetPool.connect();

  try {
    // Disable foreign key and trigger checks during bulk transfer
    await clientTarget.query('BEGIN');
    await clientTarget.query("SET session_replication_role = 'replica'");

    const results = [];
    for (const table of TABLES_ORDER) {
      const r = await syncTable(clientTarget, table);
      results.push(r);
    }

    // Re-enable normal constraints and commit
    await clientTarget.query("SET session_replication_role = 'origin'");
    await clientTarget.query('COMMIT');

    console.log('\n================ DATA SYNC VERIFICATION ================');
    let allMatched = true;
    for (const r of results) {
      const match = r.sourceCount === r.targetCount;
      if (!match) allMatched = false;
      const statusIcon = match ? 'MATCH ✔️' : 'MISMATCH ❌';
      console.log(`${r.table.padEnd(25)} | Source: ${String(r.sourceCount).padStart(4)} | Target: ${String(r.targetCount).padStart(4)} | ${statusIcon}`);
    }
    console.log('========================================================\n');

    if (allMatched) {
      console.log('🎉 Full database migration & sync completed with 100% exact parity!');
    } else {
      console.error('❌ Mismatch detected in one or more tables.');
      process.exit(1);
    }
  } catch (err) {
    await clientTarget.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    clientTarget.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

main();
