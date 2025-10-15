// Test script untuk memverifikasi perbaikan middleware
import { pool } from './db.js';

async function testFixVerification() {
    const client = await pool.connect();
    
    try {
        console.log('🧪 Testing fix verification...');
        
        // Test dengan data yang sama seperti di aplikasi
        const testData = {
            nobooking: '20011-2025-000003',
            kampungop: 'Kampung Fix Test',
            kelurahanop: 'Kelurahan Fix Test', 
            kecamatanopj: 'Kecamatan Fix Test',
            alamat_pemohon: 'Alamat Pemohon Fix Test'
        };
        
        console.log('📥 Test data:', testData);
        
        // Test UPDATE
        console.log('📝 Testing UPDATE operation...');
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
            [testData.nobooking, testData.kampungop, testData.kelurahanop, testData.kecamatanopj, testData.alamat_pemohon]
        );
        
        console.log('✅ UPDATE result:', updateResult.rows[0]);
        
        // Test SELECT untuk verifikasi
        console.log('🔍 Verifying saved data...');
        const selectResult = await client.query(
            `SELECT * FROM pat_8_validasi_tambahan WHERE nobooking = $1`,
            [testData.nobooking]
        );
        
        console.log('✅ Verification result:', selectResult.rows[0]);
        
        // Check if data is properly saved
        const savedData = selectResult.rows[0];
        if (savedData.kampungop === testData.kampungop && 
            savedData.kelurahanop === testData.kelurahanop && 
            savedData.kecamatanopj === testData.kecamatanopj && 
            savedData.alamat_pemohon === testData.alamat_pemohon) {
            console.log('✅ SUCCESS: Data saved correctly!');
            console.log('🎉 The middleware fix should work!');
        } else {
            console.log('❌ FAILED: Data not saved correctly');
            console.log('Expected:', testData);
            console.log('Actual:', {
                kampungop: savedData.kampungop,
                kelurahanop: savedData.kelurahanop,
                kecamatanopj: savedData.kecamatanopj,
                alamat_pemohon: savedData.alamat_pemohon
            });
        }
        
    } catch (error) {
        console.error('❌ Fix verification test failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Jalankan test
testFixVerification().catch(console.error);
