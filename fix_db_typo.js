import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixTypo() {
    console.log('🚀 Memulai perbaikan typo database (ppatk_khusus -> ppat_khusus)...');
    
    try {
        const sqlPath = path.join(__dirname, 'fix_trigger.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📡 Menjalankan query ke database...');
        await pool.query(sql);
        
        console.log('✅ BERHASIL! Trigger generate_nobooking telah diperbarui dengan kolom yang benar (ppat_khusus).');
        console.log('Silakan coba tambah booking kembali di dashboard.');
        
    } catch (error) {
        console.error('❌ GAGAL memperbaiki database:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
        if (error.hint) console.error('Hint:', error.hint);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixTypo();

