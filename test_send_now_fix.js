// Test Script untuk Memverifikasi Perbaikan Send-Now Endpoint
import { pool } from './E-BPHTB_root_utama/db.js';

async function testSendNowFix() {
    console.log('🧪 [TEST] Starting Send-Now Fix Verification\n');

    try {
        // 1. Cek booking yang ada dengan trackstatus "Diolah"
        console.log('📊 [TEST] Checking existing bookings with trackstatus "Diolah"...');
        
        const diolahBookings = await pool.query(`
            SELECT 
                nobooking,
                userid,
                namawajibpajak,
                trackstatus,
                created_at,
                updated_at
            FROM pat_1_bookingsspd 
            WHERE trackstatus = 'Diolah'
            ORDER BY updated_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${diolahBookings.rows.length} bookings with trackstatus "Diolah":`);
        diolahBookings.rows.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.nobooking} - ${booking.namawajibpajak} (${booking.userid}) - Updated: ${booking.updated_at}`);
        });
        console.log();

        // 2. Test dengan booking spesifik yang Anda sebutkan
        const testNobooking = '20011-2025-000007';
        console.log(`🎯 [TEST] Testing with specific nobooking: ${testNobooking}`);
        
        // Cek data booking
        const testBooking = await pool.query(`
            SELECT 
                nobooking,
                userid,
                namawajibpajak,
                trackstatus,
                created_at,
                updated_at
            FROM pat_1_bookingsspd 
            WHERE nobooking = $1
        `, [testNobooking]);
        
        if (testBooking.rows.length > 0) {
            const booking = testBooking.rows[0];
            console.log('📋 [TEST] Booking details:', {
                nobooking: booking.nobooking,
                userid: booking.userid,
                namawajibpajak: booking.namawajibpajak,
                trackstatus: booking.trackstatus,
                updated_at: booking.updated_at
            });
        } else {
            console.log('❌ [TEST] Booking not found:', testNobooking);
        }
        console.log();

        // 3. Cek data di ltb_1_terima_berkas_sspd untuk booking test
        console.log(`📊 [TEST] Checking ltb_1_terima_berkas_sspd for ${testNobooking}...`);
        
        const ltbTestData = await pool.query(`
            SELECT 
                id,
                nobooking,
                status,
                trackstatus,
                namawajibpajak,
                userid,
                created_at,
                updated_at
            FROM ltb_1_terima_berkas_sspd 
            WHERE nobooking = $1
        `, [testNobooking]);
        
        if (ltbTestData.rows.length > 0) {
            const ltbRecord = ltbTestData.rows[0];
            console.log('✅ [TEST] LTB record found:', {
                id: ltbRecord.id,
                nobooking: ltbRecord.nobooking,
                status: ltbRecord.status,
                trackstatus: ltbRecord.trackstatus,
                namawajibpajak: ltbRecord.namawajibpajak,
                userid: ltbRecord.userid,
                created_at: ltbRecord.created_at,
                updated_at: ltbRecord.updated_at
            });
        } else {
            console.log('❌ [TEST] No LTB record found for:', testNobooking);
        }
        console.log();

        // 4. Cek data di bank_1_cek_hasil_transaksi untuk booking test
        console.log(`📊 [TEST] Checking bank_1_cek_hasil_transaksi for ${testNobooking}...`);
        
        const bankTestData = await pool.query(`
            SELECT 
                id,
                nobooking,
                userid,
                status_verifikasi,
                status_dibank,
                created_at,
                updated_at
            FROM bank_1_cek_hasil_transaksi 
            WHERE nobooking = $1
        `, [testNobooking]);
        
        if (bankTestData.rows.length > 0) {
            const bankRecord = bankTestData.rows[0];
            console.log('✅ [TEST] Bank record found:', {
                id: bankRecord.id,
                nobooking: bankRecord.nobooking,
                userid: bankRecord.userid,
                status_verifikasi: bankRecord.status_verifikasi,
                status_dibank: bankRecord.status_dibank,
                created_at: bankRecord.created_at,
                updated_at: bankRecord.updated_at
            });
        } else {
            console.log('❌ [TEST] No Bank record found for:', testNobooking);
        }
        console.log();

        // 5. Cek konsistensi data untuk semua booking dengan trackstatus "Diolah"
        console.log('🔍 [TEST] Checking data consistency for all "Diolah" bookings...');
        
        const consistencyCheck = await pool.query(`
            SELECT 
                b.nobooking,
                b.userid,
                b.namawajibpajak,
                b.trackstatus as booking_trackstatus,
                b.updated_at as booking_updated,
                ltb.id as ltb_id,
                ltb.trackstatus as ltb_trackstatus,
                ltb.created_at as ltb_created,
                bank.id as bank_id,
                bank.status_verifikasi,
                bank.status_dibank,
                bank.created_at as bank_created
            FROM pat_1_bookingsspd b
            LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
            LEFT JOIN bank_1_cek_hasil_transaksi bank ON b.nobooking = bank.nobooking
            WHERE b.trackstatus = 'Diolah'
            ORDER BY b.updated_at DESC
            LIMIT 10
        `);
        
        console.log('📊 [TEST] Consistency check results:');
        consistencyCheck.rows.forEach((record, index) => {
            const ltbStatus = record.ltb_id ? '✅' : '❌';
            const bankStatus = record.bank_id ? '✅' : '❌';
            const consistencyStatus = (record.ltb_id && record.bank_id) ? '✅ CONSISTENT' : '❌ INCONSISTENT';
            
            console.log(`  ${index + 1}. ${record.nobooking}`);
            console.log(`     Booking: ${record.booking_trackstatus} (Updated: ${record.booking_updated})`);
            console.log(`     LTB: ${ltbStatus} (ID: ${record.ltb_id}, TrackStatus: ${record.ltb_trackstatus}, Created: ${record.ltb_created})`);
            console.log(`     Bank: ${bankStatus} (ID: ${record.bank_id}, Verifikasi: ${record.status_verifikasi}, Status: ${record.status_dibank}, Created: ${record.bank_created})`);
            console.log(`     Overall: ${consistencyStatus}`);
            console.log();
        });

        // 6. Summary
        console.log('📋 [SUMMARY]');
        const totalDiolah = diolahBookings.rows.length;
        const totalLtb = consistencyCheck.rows.filter(r => r.ltb_id).length;
        const totalBank = consistencyCheck.rows.filter(r => r.bank_id).length;
        const totalConsistent = consistencyCheck.rows.filter(r => r.ltb_id && r.bank_id).length;
        
        console.log(`- Total bookings with trackstatus "Diolah": ${totalDiolah}`);
        console.log(`- Total LTB records: ${totalLtb}`);
        console.log(`- Total Bank records: ${totalBank}`);
        console.log(`- Consistent records (both LTB & Bank): ${totalConsistent}`);
        console.log(`- Inconsistent records: ${totalDiolah - totalConsistent}`);
        
        if (totalConsistent === totalDiolah) {
            console.log('✅ All "Diolah" bookings have consistent LTB and Bank records!');
        } else {
            console.log('⚠️ Some "Diolah" bookings are missing LTB or Bank records');
            console.log('💡 This suggests the old endpoint was used before the fix');
        }

        // 7. Test simulation untuk endpoint send-now
        console.log('\n🧪 [TEST] Send-Now endpoint simulation...');
        if (testBooking.rows.length > 0) {
            const booking = testBooking.rows[0];
            console.log('Simulated request body for /api/ppat/send-now:');
            console.log({
                nobooking: booking.nobooking,
                userid: booking.userid,
                method: 'POST',
                endpoint: '/api/ppat/send-now'
            });
            console.log('✅ This should now create LTB and Bank records when called');
        }

    } catch (error) {
        console.error('❌ [TEST] Test failed:', error);
    } finally {
        await pool.end();
    }
}

// Jalankan test
testSendNowFix().catch(console.error);
