// Test Script untuk Sistem Booking dengan Akumulasi Global
import { globalBookingSystem, generateGlobalBookingNumber, checkGlobalQuota } from './booking_global_accumulation_system.js';
import { pool } from './db.js';

// Helper function untuk format tanggal
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Helper function untuk menambah hari
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

async function testGlobalAccumulationSystem() {
    console.log('🧪 [TEST] Starting Global Accumulation Booking System Test\n');

    try {
        // 1. Simulasi data booking dari hari-hari sebelumnya
        console.log('📊 [TEST] Simulating previous bookings...');
        
        const today = new Date();
        const day1 = addDays(today, -4); // 4 hari lalu
        const day2 = addDays(today, -3); // 3 hari lalu
        const day3 = addDays(today, -2); // 2 hari lalu
        const day4 = addDays(today, -1); // 1 hari lalu

        // Simulasi booking untuk hari-hari sebelumnya
        const simulatedBookings = [
            { date: day1, count: 30 }, // 30 booking
            { date: day2, count: 28 }, // 28 booking
            { date: day3, count: 40 }, // 40 booking
            { date: day4, count: 0 },  // 0 booking
        ];

        // Insert simulated bookings (untuk testing saja)
        for (const booking of simulatedBookings) {
            const dateStr = formatDate(booking.date);
            console.log(`📅 [TEST] Inserting ${booking.count} bookings for ${dateStr}`);
            
            for (let i = 0; i < booking.count; i++) {
                // Insert ke pat_1_bookingsspd untuk simulasi
                await pool.query(`
                    INSERT INTO pat_1_bookingsspd (
                        nobooking, userid, created_at, target_date
                    ) VALUES ($1, $2, $3, $4)
                    ON CONFLICT (nobooking) DO NOTHING
                `, [
                    `TEST${dateStr.replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
                    `USER-TEST-${i + 1}`,
                    booking.date,
                    booking.date
                ]);
            }
        }

        console.log('✅ [TEST] Previous bookings simulation completed\n');

        // 2. Test booking untuk hari ini (target: 18 booking)
        console.log('🎯 [TEST] Testing booking for today (target: 18 bookings)...');
        
        const todayStr = formatDate(today);
        const targetBookings = 18;
        
        for (let i = 0; i < targetBookings; i++) {
            try {
                const result = await generateGlobalBookingNumber(today, `USER-A-${i + 1}`);
                console.log(`📝 [TEST] Booking ${i + 1}/${targetBookings}: ${result.bookingNumber}`);
                console.log(`   Global Sequence: ${result.globalSequence}`);
                console.log(`   Daily Sequence: ${result.dailySequence}`);
                console.log(`   Total Previous: ${result.totalPreviousBookings}`);
                console.log(`   Remaining Quota: ${result.remainingQuota}\n`);
            } catch (error) {
                console.error(`❌ [TEST] Booking ${i + 1} failed:`, error.message);
            }
        }

        // 3. Test User A booking untuk hari ini (seharusnya dapat 2025O00117)
        console.log('👤 [TEST] Testing User A booking (should get 2025O00117)...');
        
        try {
            const userAResult = await generateGlobalBookingNumber(today, 'USER-A');
            console.log('🎉 [TEST] User A Result:');
            console.log(`   Booking Number: ${userAResult.bookingNumber}`);
            console.log(`   Global Sequence: ${userAResult.globalSequence}`);
            console.log(`   Daily Sequence: ${userAResult.dailySequence}`);
            console.log(`   Total Previous: ${userAResult.totalPreviousBookings}`);
            console.log(`   Daily Bookings: ${userAResult.dailyBookings}`);
            console.log(`   Expected: 2025O00117 (30+28+40+0+18+1 = 117)\n`);
            
            // Validasi
            if (userAResult.bookingNumber === '2025O00117') {
                console.log('✅ [TEST] SUCCESS: User A got expected booking number!');
            } else {
                console.log('❌ [TEST] FAILED: User A did not get expected booking number');
            }
        } catch (error) {
            console.error('❌ [TEST] User A booking failed:', error.message);
        }

        // 4. Test kuota check
        console.log('📊 [TEST] Testing quota check...');
        
        try {
            const quotaStatus = await checkGlobalQuota(today);
            console.log('📈 [TEST] Quota Status for today:');
            console.log(`   Date: ${quotaStatus.date}`);
            console.log(`   Daily Bookings: ${quotaStatus.dailyBookings}`);
            console.log(`   Total Previous: ${quotaStatus.totalPrevious}`);
            console.log(`   Remaining Daily Quota: ${quotaStatus.remainingDailyQuota}`);
            console.log(`   Next Global Sequence: ${quotaStatus.nextGlobalSequence}`);
            console.log(`   Is Quota Full: ${quotaStatus.isQuotaFull}\n`);
        } catch (error) {
            console.error('❌ [TEST] Quota check failed:', error.message);
        }

        // 5. Test statistics
        console.log('📊 [TEST] Testing booking statistics...');
        
        try {
            const startDate = addDays(today, -4);
            const endDate = today;
            const stats = await globalBookingSystem.getBookingStatistics(formatDate(startDate), formatDate(endDate));
            
            console.log('📈 [TEST] Booking Statistics:');
            stats.forEach(stat => {
                console.log(`   ${stat.date}: ${stat.daily_count} bookings (Cumulative: ${stat.cumulative_count})`);
            });
            console.log();
        } catch (error) {
            console.error('❌ [TEST] Statistics failed:', error.message);
        }

        // 6. Test global summary
        console.log('📊 [TEST] Testing global booking summary...');
        
        try {
            const summary = await globalBookingSystem.getGlobalBookingSummary();
            console.log('📈 [TEST] Global Booking Summary:');
            console.log(`   Total Bookings: ${summary.total_bookings}`);
            console.log(`   First Booking Date: ${summary.first_booking_date}`);
            console.log(`   Last Booking Date: ${summary.last_booking_date}`);
            console.log(`   First Booking Number: ${summary.first_booking_number}`);
            console.log(`   Last Booking Number: ${summary.last_booking_number}\n`);
        } catch (error) {
            console.error('❌ [TEST] Global summary failed:', error.message);
        }

        // 7. Test quota full scenario
        console.log('🚫 [TEST] Testing quota full scenario...');
        
        // Coba booking lagi sampai quota penuh
        let quotaFullReached = false;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!quotaFullReached && attempts < maxAttempts) {
            try {
                const result = await generateGlobalBookingNumber(today, `USER-QUOTA-TEST-${attempts + 1}`);
                console.log(`📝 [TEST] Quota test booking ${attempts + 1}: ${result.bookingNumber} (Remaining: ${result.remainingQuota})`);
                
                if (result.remainingQuota <= 0) {
                    quotaFullReached = true;
                    console.log('🚫 [TEST] Quota full reached!');
                }
            } catch (error) {
                if (error.message.includes('Kuota harian sudah terpenuhi')) {
                    console.log('🚫 [TEST] Expected quota full error:', error.message);
                    quotaFullReached = true;
                } else {
                    console.error('❌ [TEST] Unexpected error:', error.message);
                }
            }
            attempts++;
        }

        console.log('\n🎉 [TEST] Global Accumulation Booking System Test Completed!');

    } catch (error) {
        console.error('❌ [TEST] Test failed:', error);
    } finally {
        // Cleanup test data (optional)
        console.log('\n🧹 [TEST] Cleaning up test data...');
        try {
            await pool.query(`DELETE FROM pat_1_bookingsspd WHERE nobooking LIKE 'TEST%'`);
            await pool.query(`DELETE FROM pat_1_bookingsspd WHERE userid LIKE 'USER-A-%'`);
            await pool.query(`DELETE FROM pat_1_bookingsspd WHERE userid LIKE 'USER-QUOTA-TEST-%'`);
            console.log('✅ [TEST] Test data cleaned up');
        } catch (error) {
            console.error('❌ [TEST] Cleanup failed:', error.message);
        }
    }
}

// Jalankan test
testGlobalAccumulationSystem().catch(console.error);
