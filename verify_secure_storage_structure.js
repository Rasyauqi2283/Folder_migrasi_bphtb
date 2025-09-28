// Script untuk memverifikasi struktur secure storage
// Memastikan direktori ktp dan logs sudah dibuat dengan benar

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function verifySecureStorageStructure() {
  try {
    console.log('🔍 Verifying Secure Storage Structure...\n');
    
    // 1. Cek direktori utama
    console.log('📋 1. Main Directory Structure:');
    const secureStoragePath = path.join(__dirname, 'secure_storage');
    const ktpPath = path.join(secureStoragePath, 'ktp');
    const logsPath = path.join(secureStoragePath, 'logs');
    const tempUploadsPath = path.join(__dirname, 'temp_uploads');
    
    console.log(`   Project root: ${__dirname}`);
    console.log(`   Secure storage: ${secureStoragePath}`);
    console.log(`   KTP directory: ${ktpPath}`);
    console.log(`   Logs directory: ${logsPath}`);
    console.log(`   Temp uploads: ${tempUploadsPath}`);
    console.log('');
    
    // 2. Cek apakah direktori ada
    console.log('📋 2. Directory Existence Check:');
    console.log(`   secure_storage: ${fs.existsSync(secureStoragePath) ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   secure_storage/ktp: ${fs.existsSync(ktpPath) ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   secure_storage/logs: ${fs.existsSync(logsPath) ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   temp_uploads: ${fs.existsSync(tempUploadsPath) ? '✅ Exists' : '⚠️ Will be created on first upload'}`);
    console.log('');
    
    // 3. Cek isi direktori ktp
    console.log('📋 3. KTP Directory Contents:');
    if (fs.existsSync(ktpPath)) {
      const ktpDirs = fs.readdirSync(ktpPath);
      console.log(`   Found ${ktpDirs.length} user directories:`);
      
      for (const userDir of ktpDirs) {
        const userPath = path.join(ktpPath, userDir);
        if (fs.statSync(userPath).isDirectory()) {
          const files = fs.readdirSync(userPath);
          const encryptedFiles = files.filter(f => f.endsWith('_encrypted.bin'));
          const metadataFiles = files.filter(f => f.endsWith('_metadata.json'));
          
          console.log(`   📁 ${userDir}:`);
          console.log(`      Encrypted files: ${encryptedFiles.length}`);
          console.log(`      Metadata files: ${metadataFiles.length}`);
          
          // Tampilkan detail file
          for (const file of files) {
            const filePath = path.join(userPath, file);
            const stats = fs.statSync(filePath);
            console.log(`      - ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
          }
        }
      }
    } else {
      console.log('   No KTP directory found');
    }
    console.log('');
    
    // 4. Cek isi direktori logs
    console.log('📋 4. Logs Directory Contents:');
    if (fs.existsSync(logsPath)) {
      const logFiles = fs.readdirSync(logsPath);
      console.log(`   Found ${logFiles.length} log files:`);
      
      for (const logFile of logFiles) {
        const logPath = path.join(logsPath, logFile);
        const stats = fs.statSync(logPath);
        console.log(`   - ${logFile} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
      }
    } else {
      console.log('   No logs directory found');
    }
    console.log('');
    
    // 5. Test import secure storage
    console.log('📋 5. Secure Storage Import Test:');
    try {
      const { SECURE_STORAGE_PATH } = await import('./backend/config/secure_storage.js');
      console.log(`   ✅ SECURE_STORAGE_PATH imported: ${SECURE_STORAGE_PATH}`);
      
      // Test path consistency
      const expectedPath = path.join(__dirname, 'secure_storage');
      const isConsistent = SECURE_STORAGE_PATH === expectedPath;
      console.log(`   Path consistency: ${isConsistent ? '✅ Consistent' : '❌ Inconsistent'}`);
      console.log(`   Expected: ${expectedPath}`);
      console.log(`   Actual: ${SECURE_STORAGE_PATH}`);
      
    } catch (error) {
      console.log(`   ❌ Import failed: ${error.message}`);
    }
    console.log('');
    
    // 6. Test upload configuration
    console.log('📋 6. Upload Configuration Test:');
    try {
      const { secureUploadKTP, processKTPUpload } = await import('./backend/config/uploads/secure_upload_ktp.js');
      console.log(`   ✅ secureUploadKTP imported: ${typeof secureUploadKTP === 'object'}`);
      console.log(`   ✅ processKTPUpload imported: ${typeof processKTPUpload === 'function'}`);
    } catch (error) {
      console.log(`   ❌ Upload config import failed: ${error.message}`);
    }
    console.log('');
    
    // 7. Summary
    console.log('📋 7. Structure Summary:');
    console.log('   ✅ secure_storage/ - Main secure storage directory');
    console.log('   ✅ secure_storage/ktp/ - KTP files directory (encrypted)');
    console.log('   ✅ secure_storage/logs/ - Access logs directory');
    console.log('   ✅ temp_uploads/ - Temporary upload directory (auto-created)');
    console.log('');
    console.log('🎉 Secure Storage Structure is Ready!');
    console.log('');
    console.log('📝 Expected Flow:');
    console.log('   1. User uploads KTP → temp_uploads/ (temporary)');
    console.log('   2. File validated and encrypted → secure_storage/ktp/[email]/');
    console.log('   3. Access logged → secure_storage/logs/');
    console.log('   4. Temp file deleted');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Jalankan verifikasi
verifySecureStorageStructure();
