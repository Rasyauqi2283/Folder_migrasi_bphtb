/**
 * Bootstrap: server start with port fallback and graceful shutdown.
 * Lapisan server start untuk E-BPHTB (config -> middleware -> routes -> server start).
 */
import { listenWithFallback, registerGracefulShutdown } from './server-lifecycle.js';

async function checkDatabaseAndSession(pool) {
  try {
    await pool.query('SELECT NOW()');
    if (process.env.STARTUP_QUIET !== '1') console.log('✅ Database connection successful');
    const sessionTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      );
    `);
    if (process.env.STARTUP_QUIET !== '1') {
      if (sessionTableCheck.rows[0].exists) console.log('✅ Session table exists');
      else console.log('⚠️  Session table does not exist, will be created automatically');
    }
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

/**
 * Start HTTP server with port fallback (3000 -> 3001 -> 3002 in dev) and graceful shutdown.
 * @param {object} app - Express app
 * @param {object} opts - { pool, logger, runtime, startMs, apiUrlRef }
 * @returns {Promise<{ server, selectedPort }>}
 */
export async function startServer(app, { pool, logger, runtime, startMs, apiUrlRef }) {
  const requestedPort = runtime.defaultPort;

  const { server, selectedPort } = await listenWithFallback({
    app,
    host: '0.0.0.0',
    basePort: requestedPort,
    env: process.env
  });

  if (runtime.isLocalDev && apiUrlRef) {
    apiUrlRef.current = `http://localhost:${selectedPort}`;
  }

  const readySec = ((Date.now() - startMs) / 1000).toFixed(1);
  if (runtime.startupQuiet) {
    console.log('\n  ▲ E-BPHTB');
    console.log('  - Local:   http://localhost:' + selectedPort);
    console.log('  - Env:    ' + (process.env.SANDBOX ? '.env.sandbox' : '.env'));
    console.log('\n ✓ Ready in ' + readySec + 's\n');
  } else {
    console.log(`🚀 Server running on port ${selectedPort}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    if (selectedPort !== requestedPort) {
      console.log(`⚠️ Port ${requestedPort} sedang dipakai, fallback ke ${selectedPort}`);
    }
    if (process.env.SANDBOX) console.log('📦 SANDBOX mode: backend + DB lokal (bukan production Railway)');
  }

  checkDatabaseAndSession(pool).catch((err) => {
    console.error('❌ DB/session check failed:', err);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${selectedPort} sudah dipakai (EADDRINUSE).`);
      console.error('   Solusi:');
      console.error('   1. Coba ulang, sistem akan fallback saat mode development, atau');
      console.error('   2. Set port lain di .env, contoh: PORT=3001');
      console.error(`   3. Di PowerShell cek proses: Get-NetTCPConnection -LocalPort ${selectedPort}\n`);
      process.exit(1);
    }
    throw err;
  });

  registerGracefulShutdown({ server, pool, logger: logger || console });

  return { server, selectedPort };
}

/**
 * Run startServer and handle EALLPORTSUSED / other errors (logs and process.exit(1)).
 */
export function runServer(app, opts) {
  startServer(app, opts).catch((err) => {
    const requestedPort = opts?.runtime?.defaultPort ?? 3000;
    if (err?.code === 'EALLPORTSUSED') {
      console.error(`\n❌ Semua kandidat port sudah dipakai: ${err.candidates?.join(', ')}`);
      console.error('   Solusi:');
      console.error('   1. Hentikan proses yang memakai port tersebut, atau');
      console.error(`   2. Set PORT lain di .env (contoh: PORT=${requestedPort + 10})`);
      console.error('   3. Jalankan lagi server setelah port kosong\n');
      process.exit(1);
    }
    console.error('❌ Gagal menyalakan server:', err?.message || err);
    process.exit(1);
  });
}
