// Script untuk test validasi KTP dengan file yang sebenarnya
// Mengecek apakah magic number validation terlalu ketat

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import setelah dotenv
import { validateKTPFile } from './backend/config/secure_storage.js';

async function testRealKTPValidation() {
  try {
    console.log('🔍 Testing Real KTP Validation...\n');
    
    // 1. Cek apakah ada file KTP di folder contoh
    console.log('📋 1. Checking for example KTP files:');
    const contohPath = path.join(__dirname, 'public', 'contoh');
    if (fs.existsSync(contohPath)) {
      const files = fs.readdirSync(contohPath);
      console.log(`   Found ${files.length} files in contoh folder:`);
      files.forEach(file => {
        console.log(`     - ${file}`);
      });
    } else {
      console.log('   No contoh folder found');
    }
    console.log('');
    
    // 2. Cek file KTP yang ada di secure storage
    console.log('📋 2. Checking existing KTP files in secure storage:');
    const secureStoragePath = path.join(__dirname, 'secure_storage', 'ktp');
    if (fs.existsSync(secureStoragePath)) {
      const ktpDirs = fs.readdirSync(secureStoragePath);
      for (const dir of ktpDirs) {
        const userDir = path.join(secureStoragePath, dir);
        const files = fs.readdirSync(userDir);
        console.log(`   ${dir}:`);
        files.forEach(file => {
          if (file.endsWith('_encrypted.bin')) {
            const filePath = path.join(userDir, file);
            const stats = fs.statSync(filePath);
            console.log(`     - ${file} (${stats.size} bytes)`);
          }
        });
      }
    }
    console.log('');
    
    // 3. Test dengan file KTP yang ada
    console.log('📋 3. Testing with existing KTP files:');
    const testKTPPath = path.join(__dirname, 'secure_storage', 'ktp', 'test@example.com');
    if (fs.existsSync(testKTPPath)) {
      const files = fs.readdirSync(testKTPPath);
      const metadataFiles = files.filter(f => f.endsWith('_metadata.json'));
      
      for (const metadataFile of metadataFiles) {
        const metadataPath = path.join(testKTPPath, metadataFile);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        
        console.log(`   Testing file: ${metadata.originalName}`);
        console.log(`     File ID: ${metadata.fileId}`);
        console.log(`     MIME Type: ${metadata.mimeType}`);
        console.log(`     Size: ${metadata.size} bytes`);
        
        // Buat file test dari metadata
        const testFilePath = path.join(__dirname, `test_${metadata.originalName}`);
        
        // Simulasi file object
        const mockFile = {
          path: testFilePath,
          originalname: metadata.originalName,
          mimetype: metadata.mimeType,
          size: metadata.size
        };
        
        // Buat file dummy untuk test
        const dummyData = Buffer.alloc(metadata.size, 0xFF); // Fill with 0xFF for JPEG-like data
        fs.writeFileSync(testFilePath, dummyData);
        
        try {
          const validation = validateKTPFile(mockFile);
          console.log(`     Validation result: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
          if (!validation.isValid) {
            console.log(`     Errors: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          console.log(`     ❌ Validation error: ${error.message}`);
        }
        
        // Cleanup
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    }
    console.log('');
    
    // 4. Test dengan file JPEG yang valid
    console.log('📋 4. Testing with valid JPEG file:');
    const validJPEGPath = path.join(__dirname, 'test_valid.jpg');
    
    // Buat file JPEG yang valid (minimal JPEG header)
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, // JPEG SOI + APP0
      0x00, 0x10, // Length
      0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
      0x01, 0x01, // Version
      0x01, // Units
      0x00, 0x48, 0x00, 0x48, // X density, Y density
      0x00, 0x00, // Thumbnail width, height
      0xFF, 0xD9 // JPEG EOI
    ]);
    
    fs.writeFileSync(validJPEGPath, jpegHeader);
    
    const validMockFile = {
      path: validJPEGPath,
      originalname: 'test_valid.jpg',
      mimetype: 'image/jpeg',
      size: jpegHeader.length
    };
    
    try {
      const validation = validateKTPFile(validMockFile);
      console.log(`   Valid JPEG test: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
      if (!validation.isValid) {
        console.log(`   Errors: ${validation.errors.join(', ')}`);
      }
    } catch (error) {
      console.log(`   ❌ Validation error: ${error.message}`);
    }
    
    // Cleanup
    if (fs.existsSync(validJPEGPath)) {
      fs.unlinkSync(validJPEGPath);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Jalankan test
testRealKTPValidation();
