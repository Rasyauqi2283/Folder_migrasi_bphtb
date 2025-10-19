/**
 * FIX DEPLOYMENT SCRIPT
 * Script untuk memperbaiki masalah ES Module vs CommonJS
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Starting deployment fix...');

// 1. Fix package.json to include "type": "module"
const packageJsonPath = './package.json';
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.type) {
    packageJson.type = 'module';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added "type": "module" to package.json');
  } else {
    console.log('ℹ️ package.json already has type field:', packageJson.type);
  }
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
}

// 2. Check if db.js exists, if not create it
const dbPath = './db.js';
if (!fs.existsSync(dbPath)) {
  const dbContent = `/**
 * Database Connection Pool
 * Centralized database connection for the BAPPENDA application
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bappenda_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Graceful shutdown
export const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed successfully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

// Export default pool for backward compatibility
export default pool;
`;
  
  fs.writeFileSync(dbPath, dbContent);
  console.log('✅ Created db.js file');
} else {
  console.log('ℹ️ db.js already exists');
}

// 3. Check RailwayStorageService.js exports
const railwayServicePath = './config/RailwayStorageService.js';
if (fs.existsSync(railwayServicePath)) {
  const content = fs.readFileSync(railwayServicePath, 'utf8');
  
  // Check if named exports are properly defined
  if (!content.includes('export {')) {
    const exportSection = `
// Ensure all named exports are properly exported
export { 
    saveSignatureToRailway,
    getSignatureInfo,
    deleteSignature,
    listSignatures,
    testRailwayStorage,
    RAILWAY_STORAGE_CONFIG
};
`;
    
    fs.appendFileSync(railwayServicePath, exportSection);
    console.log('✅ Added named exports to RailwayStorageService.js');
  } else {
    console.log('ℹ️ RailwayStorageService.js already has named exports');
  }
} else {
  console.log('❌ RailwayStorageService.js not found');
}

// 4. Create .env file if it doesn't exist
const envPath = './.env';
if (!fs.existsSync(envPath)) {
  const envContent = `# BAPPENDA Environment Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bappenda_db
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Railway Storage Configuration
RAILWAY_PUBLIC_DOMAIN=https://bphtb-bappenda.up.railway.app
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('ℹ️ .env file already exists');
}

console.log('🎉 Deployment fix completed!');
console.log('📋 Next steps:');
console.log('1. Update your .env file with correct database credentials');
console.log('2. Run: npm install');
console.log('3. Run: npm run migrate');
console.log('4. Run: npm start');
