import { pool } from './db.js';

async function fixExistingPaths() {
    try {
        console.log('🔧 [FIX-PATHS] Starting to fix existing file paths...');
        
        // Get all records with file paths
        const result = await pool.query(`
            SELECT nobooking, akta_tanah_path, sertifikat_tanah_path, pelengkap_path 
            FROM pat_1_bookingsspd 
            WHERE akta_tanah_path IS NOT NULL 
            OR sertifikat_tanah_path IS NOT NULL 
            OR pelengkap_path IS NOT NULL
        `);
        
        console.log(`📊 [FIX-PATHS] Found ${result.rows.length} records with file paths`);
        
        for (const row of result.rows) {
            const updates = {};
            let needsUpdate = false;
            
            // Fix akta_tanah_path
            if (row.akta_tanah_path && !row.akta_tanah_path.startsWith('/')) {
                updates.akta_tanah_path = `/${row.akta_tanah_path}`;
                needsUpdate = true;
                console.log(`🔧 [FIX-PATHS] Fixing akta_tanah_path: ${row.akta_tanah_path} -> ${updates.akta_tanah_path}`);
            }
            
            // Fix sertifikat_tanah_path
            if (row.sertifikat_tanah_path && !row.sertifikat_tanah_path.startsWith('/')) {
                updates.sertifikat_tanah_path = `/${row.sertifikat_tanah_path}`;
                needsUpdate = true;
                console.log(`🔧 [FIX-PATHS] Fixing sertifikat_tanah_path: ${row.sertifikat_tanah_path} -> ${updates.sertifikat_tanah_path}`);
            }
            
            // Fix pelengkap_path
            if (row.pelengkap_path && !row.pelengkap_path.startsWith('/')) {
                updates.pelengkap_path = `/${row.pelengkap_path}`;
                needsUpdate = true;
                console.log(`🔧 [FIX-PATHS] Fixing pelengkap_path: ${row.pelengkap_path} -> ${updates.pelengkap_path}`);
            }
            
            if (needsUpdate) {
                const updateQuery = `
                    UPDATE pat_1_bookingsspd 
                    SET 
                        akta_tanah_path = COALESCE($1, akta_tanah_path),
                        sertifikat_tanah_path = COALESCE($2, sertifikat_tanah_path),
                        pelengkap_path = COALESCE($3, pelengkap_path)
                    WHERE nobooking = $4
                `;
                
                await pool.query(updateQuery, [
                    updates.akta_tanah_path || null,
                    updates.sertifikat_tanah_path || null,
                    updates.pelengkap_path || null,
                    row.nobooking
                ]);
                
                console.log(`✅ [FIX-PATHS] Updated paths for booking: ${row.nobooking}`);
            }
        }
        
        console.log('✅ [FIX-PATHS] All existing paths have been fixed!');
        
    } catch (error) {
        console.error('❌ [FIX-PATHS] Error fixing paths:', error);
    } finally {
        await pool.end();
    }
}

// Run the fix
fixExistingPaths();
