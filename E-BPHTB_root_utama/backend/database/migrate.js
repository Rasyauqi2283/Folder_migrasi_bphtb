/**
 * DATABASE MIGRATION SCRIPT
 * Script untuk menjalankan migration database
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bappenda_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_create_ping_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ping_notifications', 'ping_activity_log', 'real_time_sessions', 'notification_preferences')
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check indexes
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('ping_notifications', 'ping_activity_log', 'real_time_sessions', 'notification_preferences')
      ORDER BY indexname
    `);
    
    console.log('🔍 Created indexes:');
    indexesResult.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });
    
    // Check views
    const viewsResult = await client.query(`
      SELECT viewname 
      FROM pg_views 
      WHERE viewname IN ('ping_statistics', 'division_activity')
      ORDER BY viewname
    `);
    
    console.log('👁️ Created views:');
    viewsResult.rows.forEach(row => {
      console.log(`   - ${row.viewname}`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
