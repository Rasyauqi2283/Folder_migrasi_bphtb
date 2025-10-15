// Script untuk membuat tabel notifications di Railway database
// Jalankan dengan: node railway_create_notifications.js

import { pool } from './db.js';

async function createNotificationsTableInRailway() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Creating notifications table in Railway database...');
        
        // 1. Create table
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                userid VARCHAR(50) NOT NULL,
                nobooking VARCHAR(50),
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table notifications created');
        
        // 2. Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_nobooking ON notifications(nobooking)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`);
        console.log('✅ Indexes created');
        
        // 3. Create trigger function
        await client.query(`
            CREATE OR REPLACE FUNCTION update_notifications_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);
        
        // 4. Create trigger
        await client.query(`
            DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
            CREATE TRIGGER update_notifications_updated_at 
                BEFORE UPDATE ON notifications 
                FOR EACH ROW 
                EXECUTE FUNCTION update_notifications_updated_at_column()
        `);
        console.log('✅ Trigger created');
        
        // 5. Insert sample data
        await client.query(`
            INSERT INTO notifications (userid, nobooking, title, message, type, is_read) VALUES
            ('PAT09', '20011-2025-000009', 'Booking Siap Dicek', 'Booking 20011-2025-000009 telah siap untuk diverifikasi', 'success', false),
            ('PAT09', '20011-2025-000010', 'Booking Diolah', 'Booking 20011-2025-000010 sedang diproses', 'info', false),
            ('P01', '20011-2025-000011', 'Paraf Kasie Tersedia', 'Dokumen siap untuk diparaf', 'warning', false),
            ('BANK01', '20011-2025-000012', 'Transaksi Perlu Dicek', 'Transaksi baru perlu diverifikasi', 'error', false)
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ Sample data inserted');
        
        // 6. Verify table structure
        const structureResult = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Railway notifications table structure:');
        structureResult.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // 7. Show sample data
        const sampleResult = await client.query(`
            SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5
        `);
        
        console.log('\n📊 Sample data in Railway:');
        sampleResult.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. [${row.id}] ${row.userid}: ${row.title} (${row.type})`);
        });
        
        console.log('\n🎉 Notifications table successfully created in Railway!');
        
    } catch (error) {
        console.error('❌ Error creating notifications table in Railway:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the script
createNotificationsTableInRailway()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Deploy your updated code to Railway');
        console.log('2. Test /api/notifications/poll endpoint');
        console.log('3. Check Railway deploy logs - should be no more "relation does not exist" errors');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
