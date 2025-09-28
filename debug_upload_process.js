// Script untuk debug proses upload KTP yang sebenarnya
// Mengecek apakah ada masalah dengan middleware atau proses upload

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { pool } from './db.js';

async function debugUploadProcess() {
  try {
    console.log('🔍 Debugging Upload Process...\n');
    
    // 1. Cek apakah ada masalah dengan middleware
    console.log('📋 1. Checking Middleware Configuration:');
    
    // Test secure_upload_ktp.js
    try {
      const { secureUploadKTP, processKTPUpload } = await import('./backend/config/uploads/secure_upload_ktp.js');
      console.log('   ✅ secure_upload_ktp.js imported successfully');
      console.log(`   secureUploadKTP: ${typeof secureUploadKTP}`);
      console.log(`   processKTPUpload: ${typeof processKTPUpload}`);
    } catch (error) {
      console.error('   ❌ Error importing secure_upload_ktp.js:', error.message);
    }
    
    // Test secure_storage.js
    try {
      const { saveSecureFile, validateKTPFile } = await import('./backend/config/secure_storage.js');
      console.log('   ✅ secure_storage.js imported successfully');
      console.log(`   saveSecureFile: ${typeof saveSecureFile}`);
      console.log(`   validateKTPFile: ${typeof validateKTPFile}`);
    } catch (error) {
      console.error('   ❌ Error importing secure_storage.js:', error.message);
    }
    console.log('');
    
    // 2. Cek apakah ada masalah dengan validasi file
    console.log('📋 2. Testing File Validation:');
    
    // Buat file test dengan berbagai format
    const testFiles = [
      {
        name: 'test_valid.jpg',
        data: Buffer.from([
          0xFF, 0xD8, 0xFF, 0xE0, // JPEG SOI + APP0
          0x00, 0x10, // Length
          0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
          0x01, 0x01, // Version
          0x01, // Units
          0x00, 0x48, 0x00, 0x48, // X density, Y density
          0x00, 0x00, // Thumbnail width, height
          0xFF, 0xD9 // JPEG EOI
        ]),
        mimetype: 'image/jpeg'
      },
      {
        name: 'test_invalid.txt',
        data: Buffer.from('This is not an image file'),
        mimetype: 'text/plain'
      }
    ];
    
    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile.name);
      fs.writeFileSync(testPath, testFile.data);
      
      const mockFile = {
        path: testPath,
        originalname: testFile.name,
        mimetype: testFile.mimetype,
        size: testFile.data.length
      };
      
      try {
        const { validateKTPFile } = await import('./backend/config/secure_storage.js');
        const validation = validateKTPFile(mockFile);
        console.log(`   ${testFile.name}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (!validation.isValid) {
          console.log(`     Errors: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        console.log(`   ${testFile.name}: ❌ Validation error: ${error.message}`);
      }
      
      // Cleanup
      if (fs.existsSync(testPath)) {
        fs.unlinkSync(testPath);
      }
    }
    console.log('');
    
    // 3. Cek apakah ada masalah dengan proses registrasi
    console.log('📋 3. Checking Registration Process:');
    
    // Cek apakah ada user yang gagal registrasi
    const { rows: failedUsers } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_1_unverified_users 
      WHERE foto IS NULL OR foto = ''
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`   Found ${failedUsers.length} users without KTP files:`);
    for (const user of failedUsers) {
      console.log(`   - ${user.nama} (${user.email})`);
      console.log(`     File ID: ${user.foto || 'NULL'}`);
      console.log(`     Created: ${user.created_at}`);
    }
    console.log('');
    
    // 4. Cek apakah ada masalah dengan proses verifikasi
    console.log('📋 4. Checking Verification Process:');
    
    // Cek apakah ada user yang berhasil verifikasi tapi file hilang
    const { rows: verifiedUsers } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_2_verified_users 
      WHERE verifiedstatus = 'verified_pending'
      AND (foto IS NULL OR foto = '')
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`   Found ${verifiedUsers.length} verified users without KTP files:`);
    for (const user of verifiedUsers) {
      console.log(`   - ${user.nama} (${user.email})`);
      console.log(`     File ID: ${user.foto || 'NULL'}`);
      console.log(`     Created: ${user.created_at}`);
    }
    console.log('');
    
    // 5. Cek apakah ada masalah dengan environment
    console.log('📋 5. Environment Check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   FILE_ENCRYPTION_KEY: ${process.env.FILE_ENCRYPTION_KEY ? 'Set' : 'Not set'}`);
    console.log(`   Key length: ${process.env.FILE_ENCRYPTION_KEY ? process.env.FILE_ENCRYPTION_KEY.length : 0} characters`);
    
    // 6. Cek apakah ada masalah dengan path
    console.log('\n📋 6. Path Check:');
    const secureStoragePath = path.join(__dirname, 'secure_storage');
    const ktpPath = path.join(secureStoragePath, 'ktp');
    const tempPath = path.join(__dirname, 'backend', 'config', '..', '..', 'temp_uploads');
    
    console.log(`   Current directory: ${__dirname}`);
    console.log(`   Secure storage path: ${secureStoragePath}`);
    console.log(`   KTP path: ${ktpPath}`);
    console.log(`   Temp uploads path: ${tempPath}`);
    console.log(`   Secure storage exists: ${fs.existsSync(secureStoragePath)}`);
    console.log(`   KTP directory exists: ${fs.existsSync(ktpPath)}`);
    console.log(`   Temp uploads exists: ${fs.existsSync(tempPath)}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan debug
debugUploadProcess();
