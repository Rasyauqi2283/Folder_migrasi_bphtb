// Script untuk mengecek apakah ada masalah dengan proses registrasi
// Fokus pada alur upload KTP yang sebenarnya

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { pool } from './db.js';
import fs from 'fs';

async function checkRegistrationLogs() {
  try {
    console.log('🔍 Checking Registration Process...\n');
    
    // 1. Cek pending users dengan detail
    console.log('📋 1. Pending Users Analysis:');
    const { rows: pendingUsers } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_2_verified_users 
      WHERE verifiedstatus = 'verified_pending'
      ORDER BY created_at DESC
    `);
    
    console.log(`   Found ${pendingUsers.length} pending users:`);
    for (const user of pendingUsers) {
      console.log(`   - ${user.nama} (${user.email})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     File ID: ${user.foto}`);
      console.log(`     Created: ${user.created_at}`);
      
      // Cek apakah file ada di secure storage
      const userDir = path.join(__dirname, 'secure_storage', 'ktp', user.email);
      const metadataPath = path.join(userDir, `${user.foto}_metadata.json`);
      const encryptedFilePath = path.join(userDir, `${user.foto}_encrypted.bin`);
      
      console.log(`     User directory exists: ${fs.existsSync(userDir)}`);
      console.log(`     Metadata file exists: ${fs.existsSync(metadataPath)}`);
      console.log(`     Encrypted file exists: ${fs.existsSync(encryptedFilePath)}`);
      
      if (fs.existsSync(userDir)) {
        const files = fs.readdirSync(userDir);
        console.log(`     Files in directory: ${files.join(', ')}`);
      }
      console.log('');
    }
    
    // 2. Cek apakah ada user di a_1_unverified_users
    console.log('📋 2. Unverified Users Check:');
    const { rows: unverifiedUsers } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_1_unverified_users 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`   Found ${unverifiedUsers.length} unverified users:`);
    for (const user of unverifiedUsers) {
      console.log(`   - ${user.nama} (${user.email})`);
      console.log(`     File ID: ${user.foto}`);
      console.log(`     Created: ${user.created_at}`);
    }
    console.log('');
    
    // 3. Cek secure storage structure
    console.log('📋 3. Secure Storage Structure:');
    const secureStoragePath = path.join(__dirname, 'secure_storage');
    const ktpPath = path.join(secureStoragePath, 'ktp');
    
    console.log(`   Secure storage path: ${secureStoragePath}`);
    console.log(`   KTP path: ${ktpPath}`);
    console.log(`   Secure storage exists: ${fs.existsSync(secureStoragePath)}`);
    console.log(`   KTP directory exists: ${fs.existsSync(ktpPath)}`);
    
    if (fs.existsSync(ktpPath)) {
      const ktpDirs = fs.readdirSync(ktpPath);
      console.log(`   KTP directories: ${ktpDirs.join(', ')}`);
      
      for (const dir of ktpDirs) {
        const userDir = path.join(ktpPath, dir);
        const files = fs.readdirSync(userDir);
        console.log(`   ${dir}: ${files.length} files`);
        files.forEach(file => {
          const filePath = path.join(userDir, file);
          const stats = fs.statSync(filePath);
          console.log(`     - ${file} (${stats.size} bytes, ${stats.mtime})`);
        });
      }
    }
    console.log('');
    
    // 4. Cek apakah ada mismatch antara database dan file system
    console.log('📋 4. Database vs File System Analysis:');
    let totalUsers = 0;
    let usersWithFiles = 0;
    let usersWithMissingFiles = 0;
    
    for (const user of pendingUsers) {
      totalUsers++;
      if (user.foto) {
        const userDir = path.join(ktpPath, user.email);
        const encryptedFilePath = path.join(userDir, `${user.foto}_encrypted.bin`);
        
        if (fs.existsSync(encryptedFilePath)) {
          usersWithFiles++;
        } else {
          usersWithMissingFiles++;
          console.log(`   ❌ Missing file for ${user.nama} (${user.email})`);
          console.log(`      Expected: ${encryptedFilePath}`);
        }
      }
    }
    
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with files: ${usersWithFiles}`);
    console.log(`   Users with missing files: ${usersWithMissingFiles}`);
    console.log('');
    
    // 5. Cek apakah ada pattern dalam missing files
    console.log('📋 5. Missing Files Pattern Analysis:');
    if (usersWithMissingFiles > 0) {
      console.log('   Possible causes:');
      console.log('   1. File upload failed during registration');
      console.log('   2. File was deleted after verification');
      console.log('   3. File was saved to wrong location');
      console.log('   4. File validation failed');
      console.log('   5. Environment variable issue during upload');
      
      console.log('\n   Recommended actions:');
      console.log('   1. Check server logs during registration');
      console.log('   2. Test file upload with real KTP files');
      console.log('   3. Check if FILE_ENCRYPTION_KEY is consistent');
      console.log('   4. Verify multer configuration');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan check
checkRegistrationLogs();
