// db.js
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Konfigurasi Environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER,        // tambah underscore
  host: process.env.PG_HOST,        // tambah underscore  
  database: process.env.PG_DATABASE, // tambah underscore
  password: process.env.PG_PASSWORD, // tambah underscore
  port: process.env.PG_PORT,        // tambah underscore
  
  // Optimasi connection pool untuk mengurangi checkpoint
  max: 20,                          // Maksimal 20 koneksi
  min: 2,                           // Minimal 2 koneksi
  idleTimeoutMillis: 30000,         // 30 detik idle timeout
  connectionTimeoutMillis: 10000,   // 10 detik connection timeout
  acquireTimeoutMillis: 60000,      // 60 detik acquire timeout
  
  // Optimasi untuk mengurangi WAL activity
  statement_timeout: 30000,         // 30 detik statement timeout
  query_timeout: 30000,             // 30 detik query timeout
  
  // Connection pooling optimizations
  allowExitOnIdle: true,            // Allow exit when idle
  keepAlive: true,                  // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // 10 detik keep alive delay
});

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
  console.log('🟢 Berhasil terhubung ke database');
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

// Graceful Shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  console.log('🛑 Database pool closed');
  process.exit(0);
});

export { pool };