// Test script untuk memverifikasi operasi database
import { pool } from './db.js';

async function testDatabaseSave() {
    const client = await pool.connect();
    
    try {
        console.log('🧪 Testing database save operation...');
        
        const testData = {
            nobooking: 'TEST-2025-000001',
            kampungop: 'Test Kampung',
            kelurahanop: 'Test Kelurahan', 
            kecamatanopj: 'Test Kecamatan',
            alamat_pemohon: 'Test Alamat Pemohon'
        };
        
        console.log('📥 Test data:', testData);
        
        // Test INSERT
        console.log('🆕 Testing INSERT operation...');
        const insertResult = await client.query(
            `INSERT INTO pat_8_validasi_tambahan (nobooking, kampungop, kelurahanop, kecamatanopj, alamat_pemohon, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, now(), now())
             RETURNING *`,
            [testData.nobooking, testData.kampungop, testData.kelurahanop, testData.kecamatanopj, testData.alamat_pemohon]
        );
        
        console.log('✅ INSERT result:', insertResult.rows[0]);
        
        // Test UPDATE
        console.log('📝 Testing UPDATE operation...');
        const updateData = {
            kampungop: 'Updated Kampung',
            kelurahanop: 'Updated Kelurahan',
            kecamatanopj: 'Updated Kecamatan',
            alamat_pemohon: 'Updated Alamat'
        };
        
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
            [testData.nobooking, updateData.kampungop, updateData.kelurahanop, updateData.kecamatanopj, updateData.alamat_pemohon]
        );
        
        console.log('✅ UPDATE result:', updateResult.rows[0]);
        
        // Test SELECT
        console.log('🔍 Testing SELECT operation...');
        const selectResult = await client.query(
            `SELECT * FROM pat_8_validasi_tambahan WHERE nobooking = $1`,
            [testData.nobooking]
        );
        
        console.log('✅ SELECT result:', selectResult.rows[0]);
        
        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await client.query(
            `DELETE FROM pat_8_validasi_tambahan WHERE nobooking = $1`,
            [testData.nobooking]
        );
        
        console.log('✅ Database operations test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Jalankan test
testDatabaseSave().catch(console.error);
