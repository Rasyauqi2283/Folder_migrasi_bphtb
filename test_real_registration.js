// Script untuk test registrasi dengan file KTP yang sebenarnya
// Simulasi proses registrasi yang lengkap

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { pool } from './db.js';

async function testRealRegistration() {
  try {
    console.log('🔍 Testing Real Registration Process...\n');
    
    // 1. Cek apakah ada file KTP di folder contoh
    console.log('📋 1. Looking for example KTP files:');
    const contohPath = path.join(__dirname, 'public', 'contoh');
    if (fs.existsSync(contohPath)) {
      const files = fs.readdirSync(contohPath);
      console.log(`   Found ${files.length} files in contoh folder:`);
      files.forEach(file => {
        const filePath = path.join(contohPath, file);
        const stats = fs.statSync(filePath);
        console.log(`     - ${file} (${stats.size} bytes)`);
      });
    } else {
      console.log('   No contoh folder found');
    }
    console.log('');
    
    // 2. Cek apakah ada file KTP di folder penting_F_simpan
    console.log('📋 2. Looking for KTP files in penting_F_simpan:');
    const pentingPath = path.join(__dirname, 'public', 'penting_F_simpan');
    if (fs.existsSync(pentingPath)) {
      const files = fs.readdirSync(pentingPath);
      const imageFiles = files.filter(f => f.toLowerCase().match(/\.(jpg|jpeg|png)$/));
      console.log(`   Found ${imageFiles.length} image files:`);
      imageFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(pentingPath, file);
        const stats = fs.statSync(filePath);
        console.log(`     - ${file} (${stats.size} bytes)`);
      });
      if (imageFiles.length > 5) {
        console.log(`     ... and ${imageFiles.length - 5} more files`);
      }
    } else {
      console.log('   No penting_F_simpan folder found');
    }
    console.log('');
    
    // 3. Test dengan file KTP yang ada
    console.log('📋 3. Testing with existing KTP file:');
    let testKTPPath = null;
    
    // Cari file KTP yang bisa digunakan untuk test
    if (fs.existsSync(contohPath)) {
      const files = fs.readdirSync(contohPath);
      const ktpFile = files.find(f => f.toLowerCase().match(/\.(jpg|jpeg|png)$/));
      if (ktpFile) {
        testKTPPath = path.join(contohPath, ktpFile);
      }
    }
    
    if (!testKTPPath && fs.existsSync(pentingPath)) {
      const files = fs.readdirSync(pentingPath);
      const ktpFile = files.find(f => f.toLowerCase().match(/\.(jpg|jpeg|png)$/));
      if (ktpFile) {
        testKTPPath = path.join(pentingPath, ktpFile);
      }
    }
    
    if (testKTPPath) {
      console.log(`   Using KTP file: ${testKTPPath}`);
      const stats = fs.statSync(testKTPPath);
      console.log(`   File size: ${stats.size} bytes`);
      
      // Test dengan file yang sebenarnya
      const testEmail = 'test-real-registration@example.com';
      const testData = {
        nama: 'Test User Real',
        nik: '1234567890123456',
        telepon: '081234567890',
        email: testEmail,
        password: 'testpassword123'
      };
      
      console.log(`   Test email: ${testEmail}`);
      console.log(`   Test data: ${JSON.stringify(testData, null, 2)}`);
      
      // Simulasi file object dari multer
      const mockFile = {
        path: testKTPPath,
        originalname: path.basename(testKTPPath),
        mimetype: 'image/jpeg',
        size: stats.size
      };
      
      console.log(`   Mock file: ${JSON.stringify(mockFile, null, 2)}`);
      
      // Test secure storage import
      try {
        const { saveSecureFile } = await import('./backend/config/secure_storage.js');
        console.log('   ✅ Secure storage imported successfully');
        
        // Test saveSecureFile
        const result = await saveSecureFile(mockFile, testEmail);
        console.log('   ✅ saveSecureFile successful!');
        console.log(`   File ID: ${result.fileId}`);
        console.log(`   File Path: ${result.filePath}`);
        
        // Test database insert
        const insertQuery = `
          INSERT INTO a_1_unverified_users (
            nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          RETURNING *;
        `;
        
        const insertValues = [
          testData.nama, testData.nik, testData.telepon, testData.email,
          'hashedpassword', result.fileId, '123456', 'unverified', ''
        ];
        
        const insertResult = await pool.query(insertQuery, insertValues);
        console.log('   ✅ Database insert successful!');
        console.log(`   User ID: ${insertResult.rows[0].id}`);
        console.log(`   File ID in DB: ${insertResult.rows[0].foto}`);
        
        // Verifikasi file tersimpan
        const userDir = path.join(__dirname, 'secure_storage', 'ktp', testEmail);
        const metadataPath = path.join(userDir, `${result.fileId}_metadata.json`);
        const encryptedFilePath = path.join(userDir, `${result.fileId}_encrypted.bin`);
        
        console.log(`   User directory exists: ${fs.existsSync(userDir)}`);
        console.log(`   Metadata file exists: ${fs.existsSync(metadataPath)}`);
        console.log(`   Encrypted file exists: ${fs.existsSync(encryptedFilePath)}`);
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          console.log(`   Metadata: ${JSON.stringify(metadata, null, 2)}`);
        }
        
        // Cleanup
        await pool.query('DELETE FROM a_1_unverified_users WHERE email = $1', [testEmail]);
        console.log('   Database cleaned up');
        
      } catch (error) {
        console.error('   ❌ Error:', error.message);
        console.error('   Stack trace:', error.stack);
      }
      
    } else {
      console.log('   ❌ No KTP file found for testing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan test
testRealRegistration();
