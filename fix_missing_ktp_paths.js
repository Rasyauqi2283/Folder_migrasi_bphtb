// Script untuk memperbaiki data KTP yang hilang
// Jalankan script ini sekali untuk memperbaiki data existing

import { pool } from './db.js';

async function fixMissingKTPPaths() {
  try {
    console.log('🔍 Checking for users with missing KTP paths...');
    
    // Cari user yang verified_pending tapi tidak ada foto
    const usersWithoutKTP = await pool.query(`
      SELECT id, nama, email, created_at 
      FROM a_2_verified_users 
      WHERE verifiedstatus = 'verified_pending' 
      AND (foto IS NULL OR foto = '')
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${usersWithoutKTP.rows.length} users without KTP paths`);
    
    if (usersWithoutKTP.rows.length === 0) {
      console.log('✅ All users already have KTP paths');
      return;
    }
    
    // Tampilkan daftar user yang bermasalah
    console.log('\n📋 Users without KTP paths:');
    usersWithoutKTP.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nama} (${user.email}) - ID: ${user.id}`);
    });
    
    console.log('\n⚠️  These users need to re-upload their KTP or the KTP files need to be restored.');
    console.log('💡 Solutions:');
    console.log('   1. Ask users to re-register and upload KTP again');
    console.log('   2. Restore KTP files from backup if available');
    console.log('   3. Manually update foto field with correct file paths');
    
  } catch (error) {
    console.error('❌ Error checking KTP paths:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan script
fixMissingKTPPaths();
