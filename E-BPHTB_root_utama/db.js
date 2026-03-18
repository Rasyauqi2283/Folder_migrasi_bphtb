// db.js
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Konfigurasi Environment (sandbox: .env.sandbox dari repo root; production: .env)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
if (process.env.SANDBOX === '1' || process.env.SANDBOX === 'true') {
  dotenv.config({ path: path.join(repoRoot, '.env.sandbox') });
} else {
  dotenv.config({ path: path.join(repoRoot, '.env') });
}

const { Pool } = pkg;

// Mode lokal: abaikan DATABASE_URL (Railway), pakai PG_* dengan default localhost/bappenda
const isLocalDev = process.env.LOCAL_DEV === '1' || process.env.NODE_ENV === 'development';

const dbConfig = (isLocalDev || !process.env.DATABASE_URL) ? {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'bappenda',
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,

  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 60000,
  statement_timeout: 30000,
  query_timeout: 30000,
  allowExitOnIdle: true,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
} : {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 60000,
  statement_timeout: 30000,
  query_timeout: 30000,
  allowExitOnIdle: true,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

const pool = new Pool(dbConfig);

// Logging konfigurasi database
if (isLocalDev) {
  if (process.env.STARTUP_QUIET !== '1') console.log('🌐 DB config (local dev):', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
  });
} else if (process.env.DATABASE_URL) {
  if (process.env.STARTUP_QUIET !== '1') console.log('🌐 DB URL yang dipakai backend:', process.env.DATABASE_URL);
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    if (process.env.STARTUP_QUIET !== '1') console.log('🌐 DB host:', dbUrl.hostname, 'port:', dbUrl.port, 'database:', dbUrl.pathname.substring(1));
  } catch (error) {
    console.warn('⚠️ Error parsing DATABASE_URL:', error.message);
  }
} else {
  if (process.env.STARTUP_QUIET !== '1') console.log('🌐 DB config (individual vars):', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
  });
}
// Query Executor dengan Logging
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📦 Executed query (${duration}ms):`, text.split('\n')[0]);
    return res;
  } catch (err) {
    console.error('❌ Query failed:', { query: text, error: err.message });
    throw err;
  }
};

// Verified Users Repository
export const UserDB = {
  // 1. Auth Queries
  findForLogin: async (identifier) => {
    return await query(
      `SELECT 
        userid, password, nama, email, divisi, 
        fotoprofil, statuspengguna, verifiedstatus
       FROM a_2_verified_users 
       WHERE (email = $1 OR userid = $1)`,
      [identifier]
    );
  },

  // 2. Profile Management
  updateStatus: async (userId, status) => {
    return await query(
      `UPDATE a_2_verified_users 
       SET statuspengguna = $2, last_active = NOW() 
       WHERE userid = $1`,
      [userId, status]
    );
  },

  // 3. Admin Functions
  getAllByDivisi: async (divisi) => {
    return await query(
      `SELECT userid, nama, email, statuspengguna 
       FROM a_2_verified_users 
       WHERE divisi = $1`,
      [divisi]
    );
  }
};

// Tambahkan setelah inisialisasi pool
pool.on('connect', () => {
  if (process.env.STARTUP_QUIET !== '1') console.log('🟢 Berhasil terhubung ke database');
});

pool.on('error', (err) => {
  console.error('🔴 Error pada koneksi database:', err);
});

// Tambahkan fungsi health check
export const checkConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (err) {
    console.error('Koneksi database gagal:', err);
    return false;
  }
};

// Health Check
export const checkDBHealth = async () => {
  try {
    await query('SELECT 1');
    console.log('✅ Database connection healthy');
    return true;
  } catch (err) {
    console.error('❌ Database health check failed:', err);
    return false;
  }
};

let isPoolClosed = false;
export const closePool = async () => {
  if (isPoolClosed) return;
  await pool.end();
  isPoolClosed = true;
  if (process.env.STARTUP_QUIET !== '1') console.log('🛑 Database pool closed');
};

export { pool };
