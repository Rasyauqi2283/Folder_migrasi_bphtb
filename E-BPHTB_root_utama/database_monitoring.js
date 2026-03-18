// database_monitoring.js
// Script untuk monitoring performa database dan checkpoint activity

import { pool } from './db.js';

// Fungsi untuk monitoring checkpoint activity
export const monitorCheckpointActivity = async () => {
  try {
    const query = `
      SELECT 
        name,
        setting,
        unit,
        context,
        short_desc
      FROM pg_settings 
      WHERE name IN (
        'checkpoint_timeout',
        'max_wal_size', 
        'min_wal_size',
        'checkpoint_completion_target',
        'wal_writer_delay',
        'bgwriter_delay',
        'log_checkpoints'
      )
      ORDER BY name;
    `;

    const result = await pool.query(query);
    console.log('📊 PostgreSQL Checkpoint Configuration:');
    result.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.setting}${row.unit || ''} - ${row.short_desc}`);
    });

    return result.rows;
  } catch (error) {
    console.error('❌ Error monitoring checkpoint activity:', error);
    return null;
  }
};

// Fungsi untuk monitoring WAL activity
export const monitorWALActivity = async () => {
  try {
    const query = `
      SELECT 
        pg_current_wal_lsn() as current_wal_lsn,
        pg_walfile_name(pg_current_wal_lsn()) as current_wal_file,
        pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) as total_wal_size;
    `;

    const result = await pool.query(query);
    console.log('📈 WAL Activity:');
    console.log(`  Current WAL LSN: ${result.rows[0].current_wal_lsn}`);
    console.log(`  Current WAL File: ${result.rows[0].current_wal_file}`);
    console.log(`  Total WAL Size: ${result.rows[0].total_wal_size}`);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error monitoring WAL activity:', error);
    return null;
  }
};

// Fungsi untuk monitoring connection pool
export const monitorConnectionPool = async () => {
  try {
    const query = `
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity 
      WHERE datname = current_database();
    `;

    const result = await pool.query(query);
    console.log('🔗 Connection Pool Status:');
    console.log(`  Total Connections: ${result.rows[0].total_connections}`);
    console.log(`  Active Connections: ${result.rows[0].active_connections}`);
    console.log(`  Idle Connections: ${result.rows[0].idle_connections}`);
    console.log(`  Idle in Transaction: ${result.rows[0].idle_in_transaction}`);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error monitoring connection pool:', error);
    return null;
  }
};

// Fungsi untuk monitoring slow queries
export const monitorSlowQueries = async () => {
  try {
    const query = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 1000  -- Query yang rata-rata > 1 detik
      ORDER BY mean_time DESC 
      LIMIT 10;
    `;

    const result = await pool.query(query);
    if (result.rows.length > 0) {
      console.log('🐌 Slow Queries (>1s):');
      result.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.query.substring(0, 100)}...`);
        console.log(`     Calls: ${row.calls}, Mean Time: ${row.mean_time}ms, Rows: ${row.rows}`);
      });
    } else {
      console.log('✅ No slow queries detected');
    }

    return result.rows;
  } catch (error) {
    console.error('❌ Error monitoring slow queries:', error);
    return null;
  }
};

// Fungsi untuk monitoring checkpoint stats
export const monitorCheckpointStats = async () => {
  try {
    const query = `
      SELECT 
        checkpoints_timed,
        checkpoints_req,
        checkpoint_write_time,
        checkpoint_sync_time,
        buffers_checkpoint,
        buffers_clean,
        maxwritten_clean,
        buffers_backend,
        buffers_backend_fsync,
        buffers_alloc
      FROM pg_stat_bgwriter;
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    console.log('📊 Checkpoint Statistics:');
    console.log(`  Timed Checkpoints: ${stats.checkpoints_timed}`);
    console.log(`  Requested Checkpoints: ${stats.checkpoints_req}`);
    console.log(`  Checkpoint Write Time: ${stats.checkpoint_write_time}ms`);
    console.log(`  Checkpoint Sync Time: ${stats.checkpoint_sync_time}ms`);
    console.log(`  Buffers Checkpoint: ${stats.buffers_checkpoint}`);
    console.log(`  Buffers Clean: ${stats.buffers_clean}`);
    console.log(`  Max Written Clean: ${stats.maxwritten_clean}`);
    console.log(`  Buffers Backend: ${stats.buffers_backend}`);

    return stats;
  } catch (error) {
    console.error('❌ Error monitoring checkpoint stats:', error);
    return null;
  }
};

// Fungsi untuk menjalankan semua monitoring
export const runFullDatabaseMonitoring = async () => {
  console.log('🔍 Starting Database Monitoring...\n');

  await monitorCheckpointActivity();
  console.log('');

  await monitorWALActivity();
  console.log('');

  await monitorConnectionPool();
  console.log('');

  await monitorCheckpointStats();
  console.log('');

  await monitorSlowQueries();
  console.log('');

  console.log('✅ Database monitoring completed');
};

// Export untuk digunakan di index.js
export default {
  monitorCheckpointActivity,
  monitorWALActivity,
  monitorConnectionPool,
  monitorSlowQueries,
  monitorCheckpointStats,
  runFullDatabaseMonitoring
};
