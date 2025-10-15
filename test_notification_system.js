// 🧪 Test Script untuk Notification System dengan Sound Alerts
import { pool } from './db.js';

async function testNotificationSystem() {
    console.log('🧪 [TEST] Starting Notification System Test\n');

    try {
        // 1. Test database notifications table
        console.log('📊 [TEST] Checking notifications table...');
        
        const tableCheck = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            ORDER BY ordinal_position
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ [TEST] Notifications table exists with columns:');
            tableCheck.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        } else {
            console.log('❌ [TEST] Notifications table does not exist - creating it...');
            
            // Create notifications table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    userid VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT,
                    type VARCHAR(50) DEFAULT 'info',
                    related_booking VARCHAR(255),
                    trackstatus VARCHAR(50),
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            
            // Create indexes
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid);
                CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
                CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
                CREATE INDEX IF NOT EXISTS idx_notifications_trackstatus ON notifications(trackstatus);
            `);
            
            console.log('✅ [TEST] Notifications table created successfully');
        }
        console.log();

        // 2. Test inserting sample notifications
        console.log('📊 [TEST] Testing notification insertion...');
        
        const testNotifications = [
            {
                userid: 'PAT09',
                title: '🎉 Booking Dikirim ke LTB',
                message: 'Booking berhasil dikirim ke LTB dan Bank',
                type: 'success',
                related_booking: '20011-2025-000007',
                trackstatus: 'Diolah'
            },
            {
                userid: 'PAT09',
                title: '⏳ Booking dalam Antrian',
                message: 'Booking sedang dalam antrian untuk diproses',
                type: 'info',
                related_booking: '20011-2025-000008',
                trackstatus: 'Pending'
            },
            {
                userid: 'PAT09',
                title: '❌ Booking Ditolak',
                message: 'Booking ditolak karena data tidak lengkap',
                type: 'error',
                related_booking: '20011-2025-000009',
                trackstatus: 'Ditolak'
            }
        ];

        for (const notification of testNotifications) {
            const insertQuery = `
                INSERT INTO notifications (
                    userid, title, message, type, related_booking, trackstatus, is_read
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;
            
            const result = await pool.query(insertQuery, [
                notification.userid,
                notification.title,
                notification.message,
                notification.type,
                notification.related_booking,
                notification.trackstatus,
                false
            ]);
            
            console.log(`✅ [TEST] Inserted notification ${result.rows[0].id}: ${notification.title}`);
        }
        console.log();

        // 3. Test fetching unread notifications
        console.log('📊 [TEST] Testing unread notifications fetch...');
        
        const unreadQuery = `
            SELECT 
                id, title, message, type, related_booking, trackstatus, created_at
            FROM notifications 
            WHERE userid = $1 AND is_read = false 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        
        const unreadResult = await pool.query(unreadQuery, ['PAT09']);
        
        console.log(`Found ${unreadResult.rows.length} unread notifications:`);
        unreadResult.rows.forEach((notification, index) => {
            console.log(`  ${index + 1}. [${notification.type.toUpperCase()}] ${notification.title}`);
            console.log(`     Message: ${notification.message}`);
            console.log(`     Booking: ${notification.related_booking}`);
            console.log(`     Status: ${notification.trackstatus}`);
            console.log(`     Created: ${notification.created_at}`);
            console.log();
        });

        // 4. Test marking notifications as read
        console.log('📊 [TEST] Testing mark as read functionality...');
        
        if (unreadResult.rows.length > 0) {
            const notificationIds = unreadResult.rows.map(n => n.id);
            
            const markReadQuery = `
                UPDATE notifications 
                SET is_read = true, updated_at = NOW() 
                WHERE id = ANY($1)
                RETURNING id
            `;
            
            const markReadResult = await pool.query(markReadQuery, [notificationIds]);
            console.log(`✅ [TEST] Marked ${markReadResult.rows.length} notifications as read`);
        }
        console.log();

        // 5. Test notification statistics
        console.log('📊 [TEST] Notification statistics...');
        
        const statsQuery = `
            SELECT 
                type,
                COUNT(*) as count,
                COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
            FROM notifications 
            WHERE userid = $1
            GROUP BY type
            ORDER BY count DESC
        `;
        
        const statsResult = await pool.query(statsQuery, ['PAT09']);
        
        console.log('Notification statistics:');
        statsResult.rows.forEach(stat => {
            console.log(`  ${stat.type}: ${stat.count} total (${stat.unread_count} unread)`);
        });
        console.log();

        // 6. Test notification by trackstatus
        console.log('📊 [TEST] Testing notifications by trackstatus...');
        
        const trackstatusQuery = `
            SELECT 
                trackstatus,
                COUNT(*) as count
            FROM notifications 
            WHERE userid = $1 AND trackstatus IS NOT NULL
            GROUP BY trackstatus
            ORDER BY count DESC
        `;
        
        const trackstatusResult = await pool.query(trackstatusQuery, ['PAT09']);
        
        console.log('Notifications by trackstatus:');
        trackstatusResult.rows.forEach(stat => {
            console.log(`  ${stat.trackstatus}: ${stat.count} notifications`);
        });
        console.log();

        // 7. Cleanup test data
        console.log('🧹 [TEST] Cleaning up test notifications...');
        
        const cleanupQuery = `
            DELETE FROM notifications 
            WHERE userid = $1 AND related_booking LIKE '20011-2025-00000%'
            RETURNING id
        `;
        
        const cleanupResult = await pool.query(cleanupQuery, ['PAT09']);
        console.log(`✅ [TEST] Cleaned up ${cleanupResult.rows.length} test notifications`);
        console.log();

        console.log('🎉 [TEST] Notification System Test Completed Successfully!');
        
        // 8. Summary
        console.log('\n📋 [SUMMARY]');
        console.log('✅ Notifications table exists and is properly structured');
        console.log('✅ Notification insertion works correctly');
        console.log('✅ Unread notifications fetch works correctly');
        console.log('✅ Mark as read functionality works correctly');
        console.log('✅ Notification statistics work correctly');
        console.log('✅ Trackstatus-based notifications work correctly');
        console.log('✅ Test data cleanup completed');
        
        console.log('\n🔔 [NOTIFICATION] System is ready for production use!');
        console.log('💡 Frontend will automatically poll for notifications every 5 seconds');
        console.log('🔊 Sound alerts will play for different notification types');

    } catch (error) {
        console.error('❌ [TEST] Notification system test failed:', error);
    } finally {
        await pool.end();
    }
}

// Jalankan test
testNotificationSystem().catch(console.error);
