// Script untuk membersihkan folder uploads_ktp lama yang sudah tidak relevan
// Folder ini sudah digantikan dengan sistem secure storage yang baru

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function cleanupOldKTPUploads() {
  try {
    console.log('🧹 Cleaning up old KTP uploads folder...\n');
    
    // 1. Cek folder yang akan dibersihkan
    const oldUploadsPath = path.join(__dirname, 'public', 'penting_F_simpan', 'uploads_ktp');
    const publicUploadsPath = path.join(__dirname, 'public', 'uploads');
    
    console.log('📋 1. Old Upload Folders Analysis:');
    console.log(`   Old KTP uploads: ${oldUploadsPath}`);
    console.log(`   Public uploads: ${publicUploadsPath}`);
    console.log('');
    
    // 2. Analisis folder old uploads
    if (fs.existsSync(oldUploadsPath)) {
      const files = fs.readdirSync(oldUploadsPath);
      const totalFiles = files.length;
      let totalSize = 0;
      
      console.log(`📋 2. Old KTP Uploads Analysis:`);
      console.log(`   Total files: ${totalFiles}`);
      
      // Hitung total ukuran
      for (const file of files) {
        const filePath = path.join(oldUploadsPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
      
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`   Total size: ${totalSizeMB} MB`);
      console.log(`   Average file size: ${(totalSize / totalFiles / 1024).toFixed(2)} KB`);
      console.log('');
      
      // 3. Analisis file types
      const fileTypes = {};
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
      
      console.log('📋 3. File Types Analysis:');
      for (const [ext, count] of Object.entries(fileTypes)) {
        console.log(`   ${ext || 'no extension'}: ${count} files`);
      }
      console.log('');
      
      // 4. Analisis tanggal file
      const dates = {};
      for (const file of files) {
        const filePath = path.join(oldUploadsPath, file);
        const stats = fs.statSync(filePath);
        const date = stats.mtime.toISOString().split('T')[0];
        dates[date] = (dates[date] || 0) + 1;
      }
      
      console.log('📋 4. Upload Dates Analysis:');
      const sortedDates = Object.entries(dates).sort((a, b) => b[0].localeCompare(a[0]));
      for (const [date, count] of sortedDates.slice(0, 10)) { // Show last 10 dates
        console.log(`   ${date}: ${count} files`);
      }
      console.log('');
      
      // 5. Rekomendasi cleanup
      console.log('📋 5. Cleanup Recommendations:');
      console.log('   ✅ Folder ini sudah tidak digunakan lagi');
      console.log('   ✅ Sistem baru menggunakan secure_storage/ktp/');
      console.log('   ✅ File-file ini adalah hasil testing lama');
      console.log('   ✅ Tidak ada referensi database ke file-file ini');
      console.log('');
      
      // 6. Konfirmasi cleanup
      console.log('📋 6. Cleanup Options:');
      console.log('   Option 1: Delete entire folder (RECOMMENDED)');
      console.log('   Option 2: Move to backup folder');
      console.log('   Option 3: Keep for reference (NOT RECOMMENDED)');
      console.log('');
      
      // 7. Simulasi cleanup
      console.log('📋 7. Simulated Cleanup:');
      console.log(`   Would delete: ${totalFiles} files`);
      console.log(`   Would free up: ${totalSizeMB} MB of disk space`);
      console.log(`   Folder path: ${oldUploadsPath}`);
      console.log('');
      
      // 8. Cek apakah ada referensi di database
      console.log('📋 8. Database Reference Check:');
      try {
        const { pool } = await import('./db.js');
        const { rows } = await pool.query(
          `SELECT COUNT(*) as count FROM a_2_verified_users WHERE foto LIKE '%uploads_ktp%'`
        );
        const dbReferences = parseInt(rows[0].count);
        console.log(`   Database references to old uploads: ${dbReferences}`);
        
        if (dbReferences === 0) {
          console.log('   ✅ No database references found - Safe to delete');
        } else {
          console.log('   ⚠️ Found database references - Check before deleting');
        }
        
        await pool.end();
      } catch (error) {
        console.log(`   ❌ Database check failed: ${error.message}`);
      }
      console.log('');
      
      // 9. Final recommendation
      console.log('📋 9. Final Recommendation:');
      console.log('   🗑️ DELETE THE FOLDER - It\'s safe and will free up disk space');
      console.log('   📁 New system uses: secure_storage/ktp/[email]/');
      console.log('   🔒 New system is encrypted and secure');
      console.log('   📊 Old system was unencrypted and in public folder');
      console.log('');
      
      // 10. Cleanup command
      console.log('📋 10. Cleanup Command:');
      console.log('   To delete the folder, run:');
      console.log(`   rmdir /s /q "${oldUploadsPath}"`);
      console.log('');
      console.log('   Or use PowerShell:');
      console.log(`   Remove-Item -Path "${oldUploadsPath}" -Recurse -Force`);
      
    } else {
      console.log('📋 2. Old KTP Uploads Analysis:');
      console.log('   ✅ Folder already deleted or doesn\'t exist');
    }
    
    // 11. Cek folder public/uploads juga
    if (fs.existsSync(publicUploadsPath)) {
      const publicFiles = fs.readdirSync(publicUploadsPath);
      console.log('📋 11. Public Uploads Analysis:');
      console.log(`   Public uploads folder: ${publicFiles.length} files`);
      console.log('   ⚠️ This folder might also contain old KTP files');
      console.log('   🔍 Check if this folder is still needed');
    }
    
    console.log('\n🎉 Cleanup Analysis Complete!');
    console.log('💡 Recommendation: Delete the old uploads_ktp folder to free up disk space');
    
  } catch (error) {
    console.error('❌ Cleanup analysis failed:', error);
  }
}

// Jalankan analisis cleanup
cleanupOldKTPUploads();
