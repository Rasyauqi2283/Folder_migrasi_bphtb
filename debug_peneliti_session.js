// Script untuk debug session peneliti dan akses endpoint
import { pool } from './db.js';

async function debugPenelitiAccess() {
    try {
        console.log('🔍 Debugging Peneliti Access Issues...\n');
        
        // 1. Cek users dengan divisi Peneliti
        console.log('1. Users dengan divisi "Peneliti":');
        const penelitiUsers = await pool.query(`
            SELECT userid, nama, divisi, special_field, status
            FROM a_2_verified_users 
            WHERE LOWER(divisi) LIKE '%peneliti%' OR divisi = 'Peneliti'
            ORDER BY userid
        `);
        
        console.log(`Found ${penelitiUsers.rows.length} Peneliti users:`);
        penelitiUsers.rows.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.userid} - ${user.nama} (${user.divisi}) - Status: ${user.status}`);
        });
        
        // 2. Cek data yang seharusnya bisa diakses
        console.log('\n2. Data yang tersedia untuk Peneliti:');
        const availableData = await pool.query(`
            SELECT 
                p.no_registrasi,
                p.nobooking,
                p.trackstatus,
                p.status,
                b.namawajibpajak,
                b.userid as creator_userid,
                ltb.status as ltb_status,
                bk.status_verifikasi,
                bk.status_dibank
            FROM p_1_verifikasi p
            LEFT JOIN pat_1_bookingsspd b ON p.nobooking = b.nobooking
            LEFT JOIN ltb_1_terima_berkas_sspd ltb ON ltb.nobooking = p.nobooking
            LEFT JOIN bank_1_cek_hasil_transaksi bk ON bk.nobooking = p.nobooking
            WHERE p.trackstatus IN ('Dilanjutkan') 
            AND p.status = 'Diajukan'
            AND p.no_registrasi IS NOT NULL
            AND p.no_registrasi <> ''
            ORDER BY p.no_registrasi ASC
            LIMIT 5
        `);
        
        console.log(`Found ${availableData.rows.length} records that should be accessible:`);
        availableData.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.no_registrasi} - ${row.namawajibpajak} (LTB: ${row.ltb_status}, Bank: ${row.status_verifikasi})`);
        });
        
        // 3. Cek gate conditions
        console.log('\n3. Gate Conditions Analysis:');
        const gateCheck = await pool.query(`
            SELECT 
                p.nobooking,
                p.trackstatus,
                p.status,
                ltb.status as ltb_status,
                bk.status_verifikasi as bank_verifikasi,
                bk.status_dibank as bank_dibank,
                CASE 
                    WHEN p.trackstatus IN ('Dilanjutkan') THEN '✅ TrackStatus OK'
                    ELSE '❌ TrackStatus FAIL'
                END as trackstatus_check,
                CASE 
                    WHEN p.status = 'Diajukan' THEN '✅ Status OK'
                    ELSE '❌ Status FAIL'
                END as status_check,
                CASE 
                    WHEN COALESCE(ltb.status, 'Diajukan') IN ('Diajukan','Dilanjutkan','Diterima') THEN '✅ LTB Gate OK'
                    ELSE '❌ LTB Gate FAIL'
                END as ltb_gate_check,
                CASE 
                    WHEN COALESCE(bk.status_verifikasi, 'Pending') = 'Disetujui' THEN '✅ Bank Verifikasi OK'
                    ELSE '❌ Bank Verifikasi FAIL'
                END as bank_verifikasi_check,
                CASE 
                    WHEN COALESCE(bk.status_dibank, 'Dicheck') = 'Tercheck' THEN '✅ Bank Dibank OK'
                    ELSE '❌ Bank Dibank FAIL'
                END as bank_dibank_check
            FROM p_1_verifikasi p
            LEFT JOIN ltb_1_terima_berkas_sspd ltb ON ltb.nobooking = p.nobooking
            LEFT JOIN bank_1_cek_hasil_transaksi bk ON bk.nobooking = p.nobooking
            WHERE p.no_registrasi IS NOT NULL
            AND p.no_registrasi <> ''
            ORDER BY p.no_registrasi ASC
            LIMIT 3
        `);
        
        gateCheck.rows.forEach((row, index) => {
            console.log(`\n  Record ${index + 1} (${row.nobooking}):`);
            console.log(`    ${row.trackstatus_check}`);
            console.log(`    ${row.status_check}`);
            console.log(`    ${row.ltb_gate_check} (LTB: ${row.ltb_status})`);
            console.log(`    ${row.bank_verifikasi_check} (Bank Verifikasi: ${row.bank_verifikasi})`);
            console.log(`    ${row.bank_dibank_check} (Bank Dibank: ${row.bank_dibank})`);
        });
        
        // 4. Test endpoint logic dengan user Peneliti
        if (penelitiUsers.rows.length > 0) {
            const testUser = penelitiUsers.rows[0];
            console.log(`\n4. Testing endpoint logic with user: ${testUser.userid}`);
            
            const testQuery = `
                SELECT DISTINCT ON (p.no_registrasi)
                    p.no_registrasi,
                    p.nobooking,
                    p.trackstatus,
                    p.status,
                    b.namawajibpajak
                FROM p_1_verifikasi p
                LEFT JOIN pat_1_bookingsspd b ON p.nobooking = b.nobooking
                LEFT JOIN ltb_1_terima_berkas_sspd ltb ON ltb.nobooking = p.nobooking
                LEFT JOIN bank_1_cek_hasil_transaksi bk ON bk.nobooking = p.nobooking
                WHERE p.trackstatus IN ('Dilanjutkan') 
                AND p.status = 'Diajukan'
                AND p.no_registrasi IS NOT NULL
                AND p.no_registrasi <> ''
                AND COALESCE(ltb.status, 'Diajukan') IN ('Diajukan','Dilanjutkan','Diterima')
                AND COALESCE(bk.status_verifikasi, 'Pending') = 'Disetujui'
                AND COALESCE(bk.status_dibank, 'Dicheck') = 'Tercheck'
                ORDER BY p.no_registrasi ASC
            `;
            
            const testResult = await pool.query(testQuery);
            console.log(`  Query would return ${testResult.rows.length} records for ${testUser.userid}`);
            
            if (testResult.rows.length > 0) {
                console.log('  Sample result:', testResult.rows[0]);
            }
        }
        
    } catch (error) {
        console.error('❌ Error during debugging:', error);
    }
}

debugPenelitiAccess()
    .then(() => {
        console.log('\n🎉 Debugging completed!');
        console.log('\n📝 Next steps:');
        console.log('1. Check if you are logged in with a Peneliti user');
        console.log('2. Verify session is valid');
        console.log('3. Check if data meets gate conditions');
        process.exit(0);
    })
    .catch(console.error);
