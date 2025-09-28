// Script untuk test upload KTP dengan environment yang sama seperti aplikasi
// Simulasi proses registrasi yang sebenarnya

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import setelah dotenv
import { pool } from './db.js';

async function testRealUpload() {
  try {
    console.log('🔍 Testing Real Upload Process...\n');
    
    // 1. Cek environment
    console.log('📋 1. Environment Check:');
    console.log(`   FILE_ENCRYPTION_KEY: ${process.env.FILE_ENCRYPTION_KEY ? 'Set' : 'Not set'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}\n`);
    
    // 2. Test secure storage import
    console.log('📋 2. Testing Secure Storage Import:');
    try {
      const { saveSecureFile, SECURE_STORAGE_PATH } = await import('./backend/config/secure_storage.js');
      console.log(`   ✅ Secure storage imported successfully`);
      console.log(`   SECURE_STORAGE_PATH: ${SECURE_STORAGE_PATH}\n`);
      
      // 3. Buat file test
      console.log('📋 3. Creating Test File:');
      const testKTPPath = path.join(__dirname, 'test_ktp_real.jpg');
      const testImageData = Buffer.from('fake-jpeg-data-for-testing-real-upload', 'utf8');
      fs.writeFileSync(testKTPPath, testImageData);
      console.log(`   Test file created: ${testKTPPath}\n`);
      
      // 4. Simulasi file object
      console.log('📋 4. Simulating File Object:');
      const mockFile = {
        path: testKTPPath,
        originalname: 'test_ktp_real.jpg',
        mimetype: 'image/jpeg',
        size: testImageData.length
      };
      
      const testEmail = 'test-real-upload@example.com';
      console.log(`   Mock file: ${JSON.stringify(mockFile, null, 2)}`);
      console.log(`   Test email: ${testEmail}\n`);
      
      // 5. Test saveSecureFile
      console.log('📋 5. Testing saveSecureFile:');
      try {
        const result = await saveSecureFile(mockFile, testEmail);
        console.log('   ✅ saveSecureFile successful!');
        console.log(`   File ID: ${result.fileId}`);
        console.log(`   File Path: ${result.filePath}`);
        console.log(`   Metadata: ${JSON.stringify(result.metadata, null, 2)}\n`);
        
        // 6. Verifikasi file tersimpan
        console.log('📋 6. Verifying Saved Files:');
        const userDir = path.join(SECURE_STORAGE_PATH, 'ktp', testEmail);
        const metadataPath = path.join(userDir, `${result.fileId}_metadata.json`);
        const encryptedFilePath = path.join(userDir, `${result.fileId}_encrypted.bin`);
        
        console.log(`   User directory: ${userDir}`);
        console.log(`   Directory exists: ${fs.existsSync(userDir)}`);
        console.log(`   Metadata file exists: ${fs.existsSync(metadataPath)}`);
        console.log(`   Encrypted file exists: ${fs.existsSync(encryptedFilePath)}`);
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          console.log(`   Metadata content: ${JSON.stringify(metadata, null, 2)}`);
        }
        
        if (fs.existsSync(encryptedFilePath)) {
          const encryptedStats = fs.statSync(encryptedFilePath);
          console.log(`   Encrypted file size: ${encryptedStats.size} bytes`);
        }
        
        // 7. Test database insert
        console.log('\n📋 7. Testing Database Insert:');
        const insertQuery = `
          INSERT INTO a_1_unverified_users (
            nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          RETURNING *;
        `;
        
        const insertValues = [
          'Test User', '1234567890123456', '081234567890', testEmail,
          'hashedpassword', result.fileId, '123456', 'unverified', ''
        ];
        
        const insertResult = await pool.query(insertQuery, insertValues);
        console.log(`   ✅ Database insert successful!`);
        console.log(`   User ID: ${insertResult.rows[0].id}`);
        console.log(`   File ID in DB: ${insertResult.rows[0].foto}`);
        
        // 8. Test verifikasi OTP (move to verified_users)
        console.log('\n📋 8. Testing OTP Verification (Move to Verified Users):');
        const user = insertResult.rows[0];
        
        const moveQuery = `
          INSERT INTO a_2_verified_users (
            nama, nik, telepon, email, password, foto, 
            otp, verifiedstatus, fotoprofil, userid, divisi, 
            statuspengguna, ppatk_khusus
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
          RETURNING *;
        `;
        
        const moveValues = [
          user.nama, user.nik, user.telepon, user.email, 
          user.password, user.foto, '123456', 'verified_pending', 
          '', '', '', 'offline', ''
        ];
        
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          const moveResult = await client.query(moveQuery, moveValues);
          await client.query('DELETE FROM a_1_unverified_users WHERE email = $1', [testEmail]);
          
          await client.query('COMMIT');
          
          console.log(`   ✅ Move to verified_users successful!`);
          console.log(`   Verified User ID: ${moveResult.rows[0].id}`);
          console.log(`   File ID in verified: ${moveResult.rows[0].foto}`);
          
          // 9. Final verification
          console.log('\n📋 9. Final Verification:');
          console.log(`   File still exists in secure storage: ${fs.existsSync(encryptedFilePath)}`);
          console.log(`   File ID in database: ${moveResult.rows[0].foto}`);
          console.log(`   File ID in storage: ${result.fileId}`);
          console.log(`   Match: ${moveResult.rows[0].foto === result.fileId}`);
          
        } catch (moveError) {
          await client.query('ROLLBACK');
          console.error(`   ❌ Move failed: ${moveError.message}`);
        } finally {
          client.release();
        }
        
      } catch (saveError) {
        console.error('   ❌ saveSecureFile failed:', saveError.message);
        console.error('   Stack trace:', saveError.stack);
      }
      
      // 10. Cleanup
      console.log('\n📋 10. Cleanup:');
      if (fs.existsSync(testKTPPath)) {
        fs.unlinkSync(testKTPPath);
        console.log('   Test file cleaned up');
      }
      
      // Cleanup database
      await pool.query('DELETE FROM a_2_verified_users WHERE email = $1', [testEmail]);
      console.log('   Database cleaned up');
      
    } catch (importError) {
      console.error('   ❌ Failed to import secure storage:', importError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan test
testRealUpload();
