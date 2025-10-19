/**
 * Setup Ping Notifications Table
 * Script untuk membuat tabel ping_notifications di Railway PostgreSQL
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Setting up ping notifications table...');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || process.env.PG_USER || 'postgres',
  host: process.env.DB_HOST || process.env.PG_HOST || 'localhost',
  database: process.env.DB_NAME || process.env.PG_DATABASE || 'railway',
  password: process.env.DB_PASSWORD || process.env.PG_PASSWORD || 'password',
  port: process.env.DB_PORT || process.env.PG_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' || process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

console.log('📋 Database Config:');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('User:', dbConfig.user);

// Create connection pool
const pool = new Pool(dbConfig);

// SQL untuk membuat tabel
const createTableSQL = `
-- Create ping_notifications table
CREATE TABLE IF NOT EXISTS ping_notifications (
    id SERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL,
    no_registrasi VARCHAR(50) NOT NULL,
    target_divisions JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ping_notifications_nobooking ON ping_notifications(nobooking);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_status ON ping_notifications(status);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_created_at ON ping_notifications(created_at);
`;

// SQL untuk insert test data
const insertTestDataSQL = `
INSERT INTO ping_notifications (nobooking, no_registrasi, target_divisions, status) 
VALUES 
    ('TEST001', '2025O001', '["ltb", "bank"]', 'sent'),
    ('TEST002', '2025O002', '["ltb", "bank"]', 'sent')
ON CONFLICT DO NOTHING;
`;

// SQL untuk menampilkan data
const showDataSQL = `
SELECT * FROM ping_notifications ORDER BY created_at DESC LIMIT 5;
`;

async function setupPingTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating ping_notifications table...');
    await client.query(createTableSQL);
    console.log('✅ Table created successfully');
    
    console.log('🔄 Inserting test data...');
    await client.query(insertTestDataSQL);
    console.log('✅ Test data inserted successfully');
    
    console.log('🔄 Fetching sample data...');
    const result = await client.query(showDataSQL);
    console.log('📊 Sample data:');
    console.table(result.rows);
    
    console.log('🎉 Ping notifications table setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up ping table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupPingTable()
  .then(() => {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
