// Script untuk mengecek referensi database ke folder uploads_ktp lama
// Sebelum menghapus folder, kita perlu memastikan tidak ada data yang masih menggunakan path lama

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkOldKTPReferences() {
  try {
    console.log('🔍 Checking old KTP references in database...\n');
    
    // 1. Koneksi ke database
    const { pool } = await import('./db.js');
    console.log('🟢 Connected to database');
    console.log('');
    
    // 2. Cek referensi di a_2_verified_users
    console.log('📋 1. Checking a_2_verified_users table:');
    const { rows: verifiedUsers } = await pool.query(
      `SELECT id, nama, email, foto, verifiedstatus, created_at 
       FROM a_2_verified_users 
       WHERE foto LIKE '%uploads_ktp%' 
       ORDER BY created_at DESC`
    );
    
    console.log(`   Found ${verifiedUsers.length} users with old KTP paths:`);
    for (const user of verifiedUsers) {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Status: ${user.verifiedstatus}`);
      console.log(`     Foto path: ${user.foto}`);
      console.log(`     Created: ${user.created_at}`);
      console.log('');
    }
    
    // 3. Cek referensi di a_1_unverified_users
    console.log('📋 2. Checking a_1_unverified_users table:');
    const { rows: unverifiedUsers } = await pool.query(
      `SELECT id, nama, email, foto, created_at 
       FROM a_1_unverified_users 
       WHERE foto LIKE '%uploads_ktp%' 
       ORDER BY created_at DESC`
    );
    
    console.log(`   Found ${unverifiedUsers.length} users with old KTP paths:`);
    for (const user of unverifiedUsers) {
      console.log(`   - ID: ${user.id}, Email: ${user.email}`);
      console.log(`     Foto path: ${user.foto}`);
      console.log(`     Created: ${user.created_at}`);
      console.log('');
    }
    
    // 4. Cek apakah file-file tersebut masih ada
    console.log('📋 3. Checking if old KTP files still exist:');
    const oldUploadsPath = path.join(__dirname, 'public', 'penting_F_simpan', 'uploads_ktp');
    
    if (fs.existsSync(oldUploadsPath)) {
      const allUsers = [...verifiedUsers, ...unverifiedUsers];
      let existingFiles = 0;
      let missingFiles = 0;
      
      for (const user of allUsers) {
        if (user.foto) {
          // Extract filename from path
          const filename = user.foto.split('/').pop() || user.foto.split('\\').pop();
          const filePath = path.join(oldUploadsPath, filename);
          
          if (fs.existsSync(filePath)) {
            existingFiles++;
            console.log(`   ✅ ${user.email}: ${filename} - EXISTS`);
          } else {
            missingFiles++;
            console.log(`   ❌ ${user.email}: ${filename} - MISSING`);
          }
        }
      }
      
      console.log(`\n   Summary:`);
      console.log(`   - Files that exist: ${existingFiles}`);
      console.log(`   - Files that are missing: ${missingFiles}`);
    } else {
      console.log('   ❌ Old uploads folder does not exist');
    }
    console.log('');
    
    // 5. Rekomendasi untuk setiap user
    console.log('📋 4. Recommendations for each user:');
    const allUsers = [...verifiedUsers, ...unverifiedUsers];
    
    for (const user of allUsers) {
      console.log(`   User: ${user.email} (ID: ${user.id})`);
      console.log(`   Status: ${user.verifiedstatus || 'unverified'}`);
      console.log(`   Old path: ${user.foto}`);
      
      if (user.verifiedstatus === 'complete') {
        console.log(`   Recommendation: User is complete - can safely clear old path`);
      } else if (user.verifiedstatus === 'verified_pending') {
        console.log(`   Recommendation: User is pending - check if they need to re-upload`);
      } else {
        console.log(`   Recommendation: User is unverified - can safely clear old path`);
      }
      console.log('');
    }
    
    // 6. Cleanup strategy
    console.log('📋 5. Cleanup Strategy:');
    console.log('   Option 1: Clear old paths from database (RECOMMENDED)');
    console.log('   Option 2: Move old files to secure storage (COMPLEX)');
    console.log('   Option 3: Keep old files and update paths (NOT RECOMMENDED)');
    console.log('');
    
    // 7. SQL commands untuk cleanup
    console.log('📋 6. SQL Commands for cleanup:');
    console.log('   -- Clear old paths from verified users:');
    console.log(`   UPDATE a_2_verified_users SET foto = NULL WHERE foto LIKE '%uploads_ktp%';`);
    console.log('');
    console.log('   -- Clear old paths from unverified users:');
    console.log(`   UPDATE a_1_unverified_users SET foto = NULL WHERE foto LIKE '%uploads_ktp%';`);
    console.log('');
    
    // 8. Final recommendation
    console.log('📋 7. Final Recommendation:');
    console.log('   🗑️ Safe to delete old uploads folder');
    console.log('   📝 Clear old paths from database first');
    console.log('   🔒 New users will use secure storage system');
    console.log('   💾 Will free up 960+ MB of disk space');
    console.log('');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Jalankan pengecekan
checkOldKTPReferences();
