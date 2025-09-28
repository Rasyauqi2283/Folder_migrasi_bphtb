// Script untuk debug alur registrasi
// Mengecek apakah ada masalah dengan proses upload KTP

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { pool } from './db.js';
import fs from 'fs';

async function debugRegistrationFlow() {
  try {
    console.log('🔍 Debugging Registration Flow...\n');
    
    // 1. Cek environment variables
    console.log('📋 1. Environment Variables:');
    console.log(`   FILE_ENCRYPTION_KEY: ${process.env.FILE_ENCRYPTION_KEY ? 'Set' : 'Not set'}`);
    console.log(`   Key length: ${process.env.FILE_ENCRYPTION_KEY ? process.env.FILE_ENCRYPTION_KEY.length : 0} characters\n`);
    
    // 2. Cek database connection
    console.log('📋 2. Database Connection:');
    const dbTest = await pool.query('SELECT NOW() as current_time');
    console.log(`   ✅ Database connected: ${dbTest.rows[0].current_time}\n`);
    
    // 3. Cek pending users
    console.log('📋 3. Pending Users:');
    const { rows: pendingUsers } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_2_verified_users 
      WHERE verifiedstatus = 'verified_pending'
      ORDER BY created_at DESC
    `);
    
    console.log(`   Found ${pendingUsers.length} pending users:`);
    pendingUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nama} (${user.email})`);
      console.log(`      File ID: ${user.foto}`);
      console.log(`      Created: ${user.created_at}`);
    });
    console.log('');
    
    // 4. Cek secure storage structure
    console.log('📋 4. Secure Storage Structure:');
    const secureStoragePath = path.join(__dirname, 'secure_storage');
    const ktpPath = path.join(secureStoragePath, 'ktp');
    
    console.log(`   Secure storage path: ${secureStoragePath}`);
    console.log(`   KTP path: ${ktpPath}`);
    console.log(`   Secure storage exists: ${fs.existsSync(secureStoragePath)}`);
    console.log(`   KTP directory exists: ${fs.existsSync(ktpPath)}`);
    
    if (fs.existsSync(ktpPath)) {
      const ktpDirs = fs.readdirSync(ktpPath);
      console.log(`   KTP directories: ${ktpDirs.join(', ')}`);
      
      // Cek setiap direktori
      for (const dir of ktpDirs) {
        const userDir = path.join(ktpPath, dir);
        const files = fs.readdirSync(userDir);
        console.log(`   ${dir}: ${files.length} files`);
        files.forEach(file => {
          console.log(`     - ${file}`);
        });
      }
    }
    console.log('');
    
    // 5. Cek apakah ada mismatch antara database dan file system
    console.log('📋 5. Database vs File System Check:');
    for (const user of pendingUsers) {
      if (user.foto) {
        const userDir = path.join(ktpPath, user.email);
        const metadataPath = path.join(userDir, `${user.foto}_metadata.json`);
        const encryptedFilePath = path.join(userDir, `${user.foto}_encrypted.bin`);
        
        console.log(`   User: ${user.nama} (${user.email})`);
        console.log(`     File ID: ${user.foto}`);
        console.log(`     User directory exists: ${fs.existsSync(userDir)}`);
        console.log(`     Metadata file exists: ${fs.existsSync(metadataPath)}`);
        console.log(`     Encrypted file exists: ${fs.existsSync(encryptedFilePath)}`);
        
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            console.log(`     Metadata user ID: ${metadata.userId}`);
            console.log(`     Original name: ${metadata.originalName}`);
            console.log(`     File size: ${metadata.size} bytes`);
          } catch (error) {
            console.log(`     ❌ Error reading metadata: ${error.message}`);
          }
        }
        console.log('');
      }
    }
    
    // 6. Summary
    console.log('📋 6. Summary:');
    console.log(`   Total pending users: ${pendingUsers.length}`);
    console.log(`   Users with file IDs: ${pendingUsers.filter(u => u.foto).length}`);
    console.log(`   Users with missing files: ${pendingUsers.filter(u => u.foto && !fs.existsSync(path.join(ktpPath, u.email, `${u.foto}_encrypted.bin`))).length}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await pool.end();
  }
}

// Jalankan debug
debugRegistrationFlow();
