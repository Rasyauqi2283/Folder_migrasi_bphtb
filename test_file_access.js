import { pool } from './db.js';

async function testFileAccess() {
    try {
        console.log('🧪 [TEST] Testing file access...');
        
        // Get a sample record with file paths
        const result = await pool.query(`
            SELECT nobooking, akta_tanah_path, sertifikat_tanah_path, pelengkap_path 
            FROM pat_1_bookingsspd 
            WHERE akta_tanah_path IS NOT NULL 
            LIMIT 1
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ [TEST] No records found with file paths');
            return;
        }
        
        const row = result.rows[0];
        console.log('📊 [TEST] Testing booking:', row.nobooking);
        console.log('📁 [TEST] Paths in database:');
        console.log('📁 [TEST] - akta_tanah_path:', row.akta_tanah_path);
        console.log('📁 [TEST] - sertifikat_tanah_path:', row.sertifikat_tanah_path);
        console.log('📁 [TEST] - pelengkap_path:', row.pelengkap_path);
        
        // Build URLs
        const buildUrl = (path) => {
            if (!path) return null;
            return `https://bphtb-bappenda.up.railway.app/${path}`;
        };
        
        const aktaUrl = buildUrl(row.akta_tanah_path);
        const sertifikatUrl = buildUrl(row.sertifikat_tanah_path);
        const pelengkapUrl = buildUrl(row.pelengkap_path);
        
        console.log('🌐 [TEST] Built URLs:');
        console.log('🌐 [TEST] - akta_tanah_url:', aktaUrl);
        console.log('🌐 [TEST] - sertifikat_tanah_url:', sertifikatUrl);
        console.log('🌐 [TEST] - pelengkap_url:', pelengkapUrl);
        
        // Test file access
        console.log('🔍 [TEST] Testing file access...');
        
        if (aktaUrl) {
            try {
                const response = await fetch(aktaUrl, { method: 'HEAD' });
                console.log(`✅ [TEST] Akta file accessible: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`❌ [TEST] Akta file not accessible: ${error.message}`);
            }
        }
        
        if (sertifikatUrl) {
            try {
                const response = await fetch(sertifikatUrl, { method: 'HEAD' });
                console.log(`✅ [TEST] Sertifikat file accessible: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`❌ [TEST] Sertifikat file not accessible: ${error.message}`);
            }
        }
        
        if (pelengkapUrl) {
            try {
                const response = await fetch(pelengkapUrl, { method: 'HEAD' });
                console.log(`✅ [TEST] Pelengkap file accessible: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`❌ [TEST] Pelengkap file not accessible: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ [TEST] Error testing file access:', error);
    } finally {
        await pool.end();
    }
}

// Run the test
testFileAccess();
