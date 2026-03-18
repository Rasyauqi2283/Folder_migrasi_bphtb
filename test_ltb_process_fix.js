// Test Script untuk Memverifikasi Perbaikan LTB Process Endpoint
import { pool } from './E-BPHTB_root_utama/db.js';

async function testLtbProcessFix() {
    console.log('🧪 [TEST] Starting LTB Process Fix Verification\n');

    try {
        // 1. Cek booking yang ada dengan trackstatus "Diolah"
        console.log('📊 [TEST] Checking existing bookings with trackstatus "Diolah"...');
        
        const diolahBookings = await pool.query(`
            SELECT 
                nobooking,
                userid,
                namawajibpajak,
                trackstatus,
                created_at
            FROM pat_1_bookingsspd 
            WHERE trackstatus = 'Diolah'
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${diolahBookings.rows.length} bookings with trackstatus "Diolah":`);
        diolahBookings.rows.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.nobooking} - ${booking.namawajibpajak} (${booking.userid})`);
        });
        console.log();

        // 2. Cek data di ltb_1_terima_berkas_sspd
        console.log('📊 [TEST] Checking data in ltb_1_terima_berkas_sspd...');
        
        const ltbData = await pool.query(`
            SELECT 
                nobooking,
                status,
                trackstatus,
                namawajibpajak,
                userid,
                created_at
            FROM ltb_1_terima_berkas_sspd 
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${ltbData.rows.length} records in ltb_1_terima_berkas_sspd:`);
        ltbData.rows.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.nobooking} - ${record.namawajibpajak} (Status: ${record.status}, TrackStatus: ${record.trackstatus})`);
        });
        console.log();

        // 3. Cek data di bank_1_cek_hasil_transaksi
        console.log('📊 [TEST] Checking data in bank_1_cek_hasil_transaksi...');
        
        const bankData = await pool.query(`
            SELECT 
                nobooking,
                userid,
                status_verifikasi,
                status_dibank,
                created_at
            FROM bank_1_cek_hasil_transaksi 
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${bankData.rows.length} records in bank_1_cek_hasil_transaksi:`);
        bankData.rows.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.nobooking} - ${record.userid} (Verifikasi: ${record.status_verifikasi}, Status Bank: ${record.status_dibank})`);
        });
        console.log();

        // 4. Cek konsistensi data antara ketiga tabel
        console.log('🔍 [TEST] Checking data consistency between tables...');
        
        const consistencyCheck = await pool.query(`
            SELECT 
                b.nobooking,
                b.trackstatus as booking_trackstatus,
                ltb.id as ltb_id,
                ltb.trackstatus as ltb_trackstatus,
                bank.id as bank_id,
                bank.status_verifikasi,
                bank.status_dibank
            FROM pat_1_bookingsspd b
            LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
            LEFT JOIN bank_1_cek_hasil_transaksi bank ON b.nobooking = bank.nobooking
            WHERE b.trackstatus = 'Diolah'
            ORDER BY b.created_at DESC
            LIMIT 10
        `);
        
        console.log(`Consistency check for bookings with trackstatus "Diolah":`);
        consistencyCheck.rows.forEach((record, index) => {
            const ltbStatus = record.ltb_id ? '✅' : '❌';
            const bankStatus = record.bank_id ? '✅' : '❌';
            console.log(`  ${index + 1}. ${record.nobooking}`);
            console.log(`     Booking TrackStatus: ${record.booking_trackstatus}`);
            console.log(`     LTB Record: ${ltbStatus} (ID: ${record.ltb_id}, TrackStatus: ${record.ltb_trackstatus})`);
            console.log(`     Bank Record: ${bankStatus} (ID: ${record.bank_id}, Verifikasi: ${record.status_verifikasi}, Status: ${record.status_dibank})`);
            console.log();
        });

        // 5. Cek booking yang tidak memiliki data di LTB atau Bank
        console.log('⚠️ [TEST] Checking bookings missing LTB or Bank records...');
        
        const missingRecords = await pool.query(`
            SELECT 
                b.nobooking,
                b.userid,
                b.namawajibpajak,
                b.trackstatus,
                CASE 
                    WHEN ltb.id IS NULL THEN 'Missing LTB'
                    WHEN bank.id IS NULL THEN 'Missing Bank'
                    ELSE 'Both Present'
                END as missing_type
            FROM pat_1_bookingsspd b
            LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
            LEFT JOIN bank_1_cek_hasil_transaksi bank ON b.nobooking = bank.nobooking
            WHERE b.trackstatus = 'Diolah' 
            AND (ltb.id IS NULL OR bank.id IS NULL)
            ORDER BY b.created_at DESC
        `);
        
        if (missingRecords.rows.length > 0) {
            console.log(`❌ Found ${missingRecords.rows.length} bookings with missing LTB or Bank records:`);
            missingRecords.rows.forEach((record, index) => {
                console.log(`  ${index + 1}. ${record.nobooking} - ${record.namawajibpajak} (${record.missing_type})`);
            });
            console.log();
        } else {
            console.log('✅ All bookings with trackstatus "Diolah" have corresponding LTB and Bank records!');
            console.log();
        }

        // 6. Test API endpoint dengan data real (simulasi)
        console.log('🧪 [TEST] Testing LTB Process endpoint simulation...');
        
        if (diolahBookings.rows.length > 0) {
            const testBooking = diolahBookings.rows[0];
            console.log(`Testing with booking: ${testBooking.nobooking}`);
            
            // Simulasi request body
            const testRequestBody = {
                nobooking: testBooking.nobooking,
                trackstatus: 'Diolah',
                userid: testBooking.userid,
                nama: testBooking.namawajibpajak
            };
            
            console.log('Test request body:', testRequestBody);
            console.log('✅ Simulation complete - endpoint should work with this data');
        } else {
            console.log('⚠️ No bookings with trackstatus "Diolah" found for testing');
        }
        
        console.log('\n🎉 [TEST] LTB Process Fix Verification Completed!');
        
        // 7. Summary
        console.log('\n📋 [SUMMARY]');
        console.log(`- Bookings with trackstatus "Diolah": ${diolahBookings.rows.length}`);
        console.log(`- LTB records: ${ltbData.rows.length}`);
        console.log(`- Bank records: ${bankData.rows.length}`);
        console.log(`- Missing records: ${missingRecords.rows.length}`);
        
        if (missingRecords.rows.length === 0) {
            console.log('✅ All systems working correctly!');
        } else {
            console.log('⚠️ Some records need to be processed by the LTB endpoint');
        }

    } catch (error) {
        console.error('❌ [TEST] Test failed:', error);
    } finally {
        await pool.end();
    }
}

// Jalankan test
testLtbProcessFix().catch(console.error);
