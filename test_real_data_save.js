// Test script untuk menguji dengan data real dari aplikasi
import { pool } from './db.js';

async function testRealDataSave() {
    const client = await pool.connect();
    
    try {
        console.log('🧪 Testing with real application data...');
        
        // Data yang sama seperti yang digunakan di aplikasi
        const realData = {
            nobooking: '20011-2025-000003',
            kampungop: 'Kampung Test',
            kelurahanop: 'Kelurahan Test', 
            kecamatanopj: 'Kecamatan Test',
            alamat_pemohon: 'Alamat Pemohon Test'
        };
        
        console.log('📥 Real test data:', realData);
        
        // Test UPDATE (karena record sudah ada)
        console.log('📝 Testing UPDATE operation with real data...');
        const updateResult = await client.query(
            `UPDATE pat_8_validasi_tambahan
             SET 
                kampungop = $2,
                kelurahanop = $3,
                kecamatanopj = $4,
                alamat_pemohon = $5,
                updated_at = now()
             WHERE nobooking = $1
             RETURNING *`,
            [realData.nobooking, realData.kampungop, realData.kelurahanop, realData.kecamatanopj, realData.alamat_pemohon]
        );
        
        console.log('✅ UPDATE result:', updateResult.rows[0]);
        console.log('✅ UPDATE rowCount:', updateResult.rowCount);
        
        // Test SELECT untuk verifikasi
        console.log('🔍 Verifying saved data...');
        const selectResult = await client.query(
            `SELECT * FROM pat_8_validasi_tambahan WHERE nobooking = $1`,
            [realData.nobooking]
        );
        
        console.log('✅ Verification result:', selectResult.rows[0]);
        
        // Test dengan string kosong (untuk melihat apakah ini masalahnya)
        console.log('🧪 Testing with empty strings...');
        const emptyData = {
            nobooking: '20011-2025-000003',
            kampungop: '',
            kelurahanop: '', 
            kecamatanopj: '',
            alamat_pemohon: ''
        };
        
        const emptyUpdateResult = await client.query(
            `UPDATE pat_8_validasi_tambahan
             SET 
                kampungop = $2,
                kelurahanop = $3,
                kecamatanopj = $4,
                alamat_pemohon = $5,
                updated_at = now()
             WHERE nobooking = $1
             RETURNING *`,
            [emptyData.nobooking, emptyData.kampungop, emptyData.kelurahanop, emptyData.kecamatanopj, emptyData.alamat_pemohon]
        );
        
        console.log('✅ Empty string UPDATE result:', emptyUpdateResult.rows[0]);
        
        // Restore original data
        console.log('🔄 Restoring original data...');
        const restoreResult = await client.query(
            `UPDATE pat_8_validasi_tambahan
             SET 
                kampungop = $2,
                kelurahanop = $3,
                kecamatanopj = $4,
                alamat_pemohon = $5,
                updated_at = now()
             WHERE nobooking = $1
             RETURNING *`,
            [realData.nobooking, realData.kampungop, realData.kelurahanop, realData.kecamatanopj, realData.alamat_pemohon]
        );
        
        console.log('✅ Restore result:', restoreResult.rows[0]);
        console.log('✅ Real data test completed successfully!');
        
    } catch (error) {
        console.error('❌ Real data test failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Jalankan test
testRealDataSave().catch(console.error);
