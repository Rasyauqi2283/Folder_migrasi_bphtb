/**
 * Test Database Connection
 * Script untuk test koneksi ke Railway PostgreSQL
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing database connection...');

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
console.log('SSL:', dbConfig.ssl ? 'Enabled' : 'Disabled');

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
async function testConnection() {
  try {
    console.log('🔄 Attempting to connect...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    console.log('✅ Database connected successfully!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version);
    
    client.release();
    await pool.end();
    
    console.log('🎉 Database test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    
    await pool.end();
    process.exit(1);
  }
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

// Run test
testConnection();
