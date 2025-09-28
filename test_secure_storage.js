// Script untuk test secure storage system
// Jalankan script ini untuk memverifikasi bahwa file KTP terenkripsi dengan benar

import { pool } from './db.js';
import { SECURE_STORAGE_PATH } from './backend/config/secure_storage.js';
import path from 'path';
import fs from 'fs';

async function testSecureStorage() {
  try {
    console.log('🔍 Testing Secure Storage System...\n');
    
    // 1. Cek pending users dengan KTP
    console.log('📊 1. Checking pending users with KTP...');
    const { rows } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus 
      FROM a_2_verified_users 
      WHERE verifiedstatus = 'verified_pending' 
      AND foto IS NOT NULL 
      AND foto != ''
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ Found ${rows.length} pending users with KTP files\n`);
    
    if (rows.length === 0) {
      console.log('⚠️ No pending users with KTP files found');
      return;
    }
    
    // 2. Test setiap user
    for (const user of rows) {
      console.log(`🔍 Testing user: ${user.nama} (${user.email})`);
      console.log(`   File ID: ${user.foto}`);
      
      // Cek struktur direktori
      const userDir = path.join(SECURE_STORAGE_PATH, 'ktp', user.email);
      const metadataPath = path.join(userDir, `${user.foto}_metadata.json`);
      const encryptedFilePath = path.join(userDir, `${user.foto}_encrypted.bin`);
      
      console.log(`   User Directory: ${userDir}`);
      console.log(`   Metadata Path: ${metadataPath}`);
      console.log(`   Encrypted File Path: ${encryptedFilePath}`);
      
      // Cek apakah direktori ada
      if (!fs.existsSync(userDir)) {
        console.log(`   ❌ User directory does not exist`);
        continue;
      }
      
      // Cek apakah metadata file ada
      if (!fs.existsSync(metadataPath)) {
        console.log(`   ❌ Metadata file does not exist`);
        continue;
      }
      
      // Cek apakah encrypted file ada
      if (!fs.existsSync(encryptedFilePath)) {
        console.log(`   ❌ Encrypted file does not exist`);
        continue;
      }
      
      // Baca metadata
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        console.log(`   ✅ Metadata loaded successfully`);
        console.log(`      Original Name: ${metadata.originalName}`);
        console.log(`      MIME Type: ${metadata.mimeType}`);
        console.log(`      Size: ${metadata.size} bytes`);
        console.log(`      Timestamp: ${new Date(metadata.timestamp).toLocaleString()}`);
        
        // Cek ukuran encrypted file
        const encryptedStats = fs.statSync(encryptedFilePath);
        console.log(`   ✅ Encrypted file size: ${encryptedStats.size} bytes`);
        
        // Test dekripsi (hanya jika ada ENCRYPTION_KEY)
        if (process.env.FILE_ENCRYPTION_KEY) {
          try {
            const { getSecureFile } = await import('./backend/config/secure_storage.js');
            const secureFile = await getSecureFile(user.foto, user.email, 'admin');
            console.log(`   ✅ File decryption successful`);
            console.log(`      Decrypted size: ${secureFile.data.length} bytes`);
            console.log(`      MIME Type: ${secureFile.metadata.mimeType}`);
          } catch (decryptError) {
            console.log(`   ❌ File decryption failed: ${decryptError.message}`);
          }
        } else {
          console.log(`   ⚠️ FILE_ENCRYPTION_KEY not set, skipping decryption test`);
        }
        
      } catch (metadataError) {
        console.log(`   ❌ Error reading metadata: ${metadataError.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // 3. Summary
    console.log('📋 SUMMARY:');
    console.log(`   Total pending users: ${rows.length}`);
    console.log(`   Secure storage path: ${SECURE_STORAGE_PATH}`);
    console.log(`   Encryption key set: ${process.env.FILE_ENCRYPTION_KEY ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error testing secure storage:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan test
testSecureStorage();
