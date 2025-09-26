// =====================================================
// AUTO DELETE SYSTEM TEST
// Test untuk memastikan sistem auto-delete berfungsi
// =====================================================

import { pool } from '../../../dataconnect/db_connect';
import AutoDeleteService from './auto_delete_service';

class AutoDeleteTest {
    
    static async runAllTests() {
        console.log('🚀 Starting Auto Delete System Tests...\n');
        
        try {
            await this.testDatabaseConnection();
            await this.testAddRejectedBooking();
            await this.testCheckNobookingUsage();
            await this.testGetPendingDeletions();
            await this.testGetUsedNobookingSummary();
            await this.testManualCleanup();
            await this.cleanupTestData();
            
            console.log('\n✅ All tests passed successfully!');
        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
            process.exit(1);
        }
    }
    
    static async testDatabaseConnection() {
        console.log('📊 Testing database connection...');
        
        try {
            const result = await pool.query('SELECT NOW() as current_time');
            console.log('✅ Database connected successfully');
            console.log(`   Current time: ${result.rows[0].current_time}\n`);
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }
    
    static async testAddRejectedBooking() {
        console.log('📝 Testing add rejected booking...');
        
        const testNobooking = 'TEST001';
        const result = await AutoDeleteService.addRejectedBooking(
            testNobooking,
            'LTB',
            'Test rejection reason',
            'testuser'
        );
        
        if (result) {
            console.log('✅ Successfully added rejected booking to tracker');
        } else {
            throw new Error('Failed to add rejected booking');
        }
        
        // Verify data exists
        const detail = await AutoDeleteService.getRejectedBookingDetail(testNobooking);
        if (detail && detail.nobooking === testNobooking) {
            console.log('✅ Verified data exists in tracker');
            console.log(`   Scheduled delete at: ${detail.scheduled_delete_at}\n`);
        } else {
            throw new Error('Data not found in tracker');
        }
    }
    
    static async testCheckNobookingUsage() {
        console.log('🔍 Testing nobooking usage check...');
        
        const testNobooking = 'TEST001';
        const isUsed = await AutoDeleteService.isNobookingUsed(testNobooking);
        
        if (isUsed) {
            console.log('✅ Nobooking usage check working correctly');
            console.log(`   Nobooking ${testNobooking} is marked as used\n`);
        } else {
            throw new Error('Nobooking usage check failed');
        }
        
        // Test with unused nobooking
        const unusedNobooking = 'UNUSED001';
        const isUnused = await AutoDeleteService.isNobookingUsed(unusedNobooking);
        
        if (!isUnused) {
            console.log('✅ Unused nobooking correctly identified as available\n');
        } else {
            throw new Error('Unused nobooking incorrectly marked as used');
        }
    }
    
    static async testGetPendingDeletions() {
        console.log('⏰ Testing get pending deletions...');
        
        const pendingData = await AutoDeleteService.getPendingDeletions();
        
        if (Array.isArray(pendingData)) {
            console.log('✅ Successfully retrieved pending deletions');
            console.log(`   Found ${pendingData.length} pending deletions\n`);
        } else {
            throw new Error('Failed to get pending deletions');
        }
    }
    
    static async testGetUsedNobookingSummary() {
        console.log('📈 Testing get used nobooking summary...');
        
        const summary = await AutoDeleteService.getUsedNobookingSummary();
        
        if (Array.isArray(summary)) {
            console.log('✅ Successfully retrieved used nobooking summary');
            console.log('   Summary:', summary);
            console.log();
        } else {
            throw new Error('Failed to get used nobooking summary');
        }
    }
    
    static async testManualCleanup() {
        console.log('🧹 Testing manual cleanup...');
        
        // Add a test booking that should be deleted immediately
        const testNobooking = 'TEST_CLEANUP001';
        await AutoDeleteService.addRejectedBooking(
            testNobooking,
            'PV',
            'Test cleanup reason',
            'testuser'
        );
        
        // Manually set the scheduled delete time to past
        await pool.query(
            'UPDATE rejected_bookings_tracker SET scheduled_delete_at = NOW() - INTERVAL \'1 day\' WHERE nobooking = $1',
            [testNobooking]
        );
        
        // Run manual cleanup
        const results = await AutoDeleteService.manualCleanup();
        
        if (Array.isArray(results)) {
            console.log('✅ Manual cleanup executed successfully');
            console.log(`   Processed ${results.length} records`);
            
            // Check if test data was processed
            const processed = results.find(r => r.nobooking === testNobooking);
            if (processed) {
                console.log(`   Test nobooking ${testNobooking}: ${processed.success ? 'Success' : 'Failed'}`);
            }
            console.log();
        } else {
            throw new Error('Manual cleanup failed');
        }
    }
    
    static async cleanupTestData() {
        console.log('🧽 Cleaning up test data...');
        
        try {
            // Remove test data from tracker
            await pool.query(
                'DELETE FROM rejected_bookings_tracker WHERE nobooking LIKE \'TEST%\''
            );
            
            // Remove test data from history
            await pool.query(
                'DELETE FROM used_nobooking_history WHERE nobooking LIKE \'TEST%\''
            );
            
            console.log('✅ Test data cleaned up successfully\n');
        } catch (error) {
            console.warn('⚠️  Warning: Failed to cleanup test data:', error.message);
        }
    }
    
    static async testDatabaseFunctions() {
        console.log('🔧 Testing database functions...');
        
        try {
            // Test add_rejected_booking function
            const addResult = await pool.query(
                'SELECT add_rejected_booking($1, $2, $3, $4) as success',
                ['FUNC_TEST001', 'LTB', 'Function test', 'testuser']
            );
            
            if (addResult.rows[0].success) {
                console.log('✅ add_rejected_booking function working');
            } else {
                throw new Error('add_rejected_booking function failed');
            }
            
            // Test is_nobooking_used function
            const checkResult = await pool.query(
                'SELECT is_nobooking_used($1) as is_used',
                ['FUNC_TEST001']
            );
            
            if (checkResult.rows[0].is_used) {
                console.log('✅ is_nobooking_used function working');
            } else {
                throw new Error('is_nobooking_used function failed');
            }
            
            // Test auto_delete_rejected_data function
            const deleteResult = await pool.query('SELECT auto_delete_rejected_data() as deleted_count');
            console.log(`✅ auto_delete_rejected_data function working (deleted: ${deleteResult.rows[0].deleted_count})`);
            
            // Cleanup
            await pool.query('DELETE FROM rejected_bookings_tracker WHERE nobooking = $1', ['FUNC_TEST001']);
            await pool.query('DELETE FROM used_nobooking_history WHERE nobooking = $1', ['FUNC_TEST001']);
            
            console.log();
        } catch (error) {
            throw new Error(`Database functions test failed: ${error.message}`);
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.main) {
    AutoDeleteTest.runAllTests()
        .then(() => {
            console.log('🎉 All tests completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Tests failed:', error.message);
            process.exit(1);
        });
}

export default AutoDeleteTest;
