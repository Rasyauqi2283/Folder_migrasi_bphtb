// Script untuk membersihkan user lama yang masih menggunakan sistem public\uploads\
// OPSIONAL: Hanya jalankan jika ingin membersihkan data lama

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { pool } from './db.js';

async function cleanupOldUsers() {
  try {
    console.log('🔍 Cleaning Up Old Users with public\\uploads\\ system...\n');
    
    // 1. Cek user lama di a_1_unverified_users
    console.log('📋 1. Checking unverified users with old system:');
    const { rows: oldUnverifiedUsers } = await pool.query(`
      SELECT id, nama, email, foto, created_at 
      FROM a_1_unverified_users 
      WHERE foto LIKE 'public\\uploads\\%' OR foto LIKE 'public/uploads/%'
      ORDER BY created_at DESC
    `);
    
    console.log(`   Found ${oldUnverifiedUsers.length} old unverified users:`);
    for (const user of oldUnverifiedUsers) {
      console.log(`   - ${user.nama} (${user.email})`);
      console.log(`     File Path: ${user.foto}`);
      console.log(`     Created: ${user.created_at}`);
    }
    console.log('');
    
    // 2. Cek user lama di a_2_verified_users
    console.log('📋 2. Checking verified users with old system:');
    const { rows: oldVerifiedUsers } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_2_verified_users 
      WHERE foto LIKE 'public\\uploads\\%' OR foto LIKE 'public/uploads/%'
      ORDER BY created_at DESC
    `);
    
    console.log(`   Found ${oldVerifiedUsers.length} old verified users:`);
    for (const user of oldVerifiedUsers) {
      console.log(`   - ${user.nama} (${user.email})`);
      console.log(`     File Path: ${user.foto}`);
      console.log(`     Status: ${user.verifiedstatus}`);
      console.log(`     Created: ${user.created_at}`);
    }
    console.log('');
    
    // 3. Summary
    console.log('📋 3. Summary:');
    console.log(`   Total old unverified users: ${oldUnverifiedUsers.length}`);
    console.log(`   Total old verified users: ${oldVerifiedUsers.length}`);
    console.log(`   Total old users: ${oldUnverifiedUsers.length + oldVerifiedUsers.length}`);
    console.log('');
    
    // 4. Recommendations
    console.log('📋 4. Recommendations:');
    console.log('   OPTION A: Keep old users as-is (recommended for production)');
    console.log('   OPTION B: Contact old users to re-register with new secure system');
    console.log('   OPTION C: Migrate old users manually (requires file backup)');
    console.log('');
    console.log('   For testing purposes, you can ignore old users and focus on new registrations.');
    console.log('   New users will automatically use the secure storage system.');
    
  } catch (error) {
    console.error('❌ Cleanup check failed:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan cleanup check
cleanupOldUsers();
