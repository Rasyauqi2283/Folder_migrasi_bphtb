// Script untuk test KTP upload process
// Simulasi proses registrasi dengan upload KTP

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import after dotenv is configured
import { saveSecureFile } from './backend/config/secure_storage.js';

async function testKTPUpload() {
  try {
    console.log('🔍 Testing KTP Upload Process...\n');
    
    // 1. Cek environment variable
    console.log('📋 1. Checking environment variables...');
    console.log(`   FILE_ENCRYPTION_KEY: ${process.env.FILE_ENCRYPTION_KEY ? 'Set' : 'Not set'}`);
    console.log(`   Key length: ${process.env.FILE_ENCRYPTION_KEY ? process.env.FILE_ENCRYPTION_KEY.length : 0} characters\n`);
    
    // 2. Buat file test KTP
    console.log('📋 2. Creating test KTP file...');
    const testKTPPath = path.join(process.cwd(), 'test_ktp.jpg');
    const testImageData = Buffer.from('fake-jpeg-data-for-testing', 'utf8');
    fs.writeFileSync(testKTPPath, testImageData);
    console.log(`   Test file created: ${testKTPPath}\n`);
    
    // 3. Simulasi file object dari multer
    console.log('📋 3. Simulating multer file object...');
    const mockFile = {
      path: testKTPPath,
      originalname: 'test_ktp.jpg',
      mimetype: 'image/jpeg',
      size: testImageData.length
    };
    
    const testEmail = 'test-upload@example.com';
    console.log(`   Mock file: ${JSON.stringify(mockFile, null, 2)}`);
    console.log(`   Test email: ${testEmail}\n`);
    
    // 4. Test saveSecureFile
    console.log('📋 4. Testing saveSecureFile function...');
    try {
      const result = await saveSecureFile(mockFile, testEmail);
      console.log('   ✅ saveSecureFile successful!');
      console.log(`   File ID: ${result.fileId}`);
      console.log(`   File Path: ${result.filePath}`);
      console.log(`   Metadata: ${JSON.stringify(result.metadata, null, 2)}\n`);
      
      // 5. Verifikasi file tersimpan
      console.log('📋 5. Verifying saved files...');
      const userDir = path.join(process.cwd(), 'secure_storage', 'ktp', testEmail);
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
      
    } catch (saveError) {
      console.error('   ❌ saveSecureFile failed:', saveError.message);
      console.error('   Stack trace:', saveError.stack);
    }
    
    // 6. Cleanup
    console.log('\n📋 6. Cleaning up test files...');
    if (fs.existsSync(testKTPPath)) {
      fs.unlinkSync(testKTPPath);
      console.log('   Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Jalankan test
testKTPUpload();
