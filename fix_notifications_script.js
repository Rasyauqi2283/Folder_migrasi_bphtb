// Script untuk membuat tabel notifications di database
import { pool } from './db.js';

async function createNotificationsTable() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Creating notifications table...');
        
        // Create table
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
        console.log('✅ Table notifications created successfully');
        
        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_nobooking ON notifications(nobooking)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`);
        console.log('✅ Indexes created successfully');
        
        // Create trigger function
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);
        
        // Create trigger
        await client.query(`
            DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
            CREATE TRIGGER update_notifications_updated_at 
                BEFORE UPDATE ON notifications 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log('✅ Trigger created successfully');
        
        // Insert sample data
        await client.query(`
            INSERT INTO notifications (userid, nobooking, title, message, type, is_read) VALUES
            ('PAT09', '20011-2025-000009', 'Booking Siap Dicek', 'Booking 20011-2025-000009 telah siap untuk diverifikasi', 'success', false),
            ('PAT09', '20011-2025-000010', 'Booking Diolah', 'Booking 20011-2025-000010 sedang diproses', 'info', false),
            ('P01', '20011-2025-000011', 'Paraf Kasie Tersedia', 'Dokumen siap untuk diparaf', 'warning', false)
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ Sample data inserted successfully');
        
        // Verify table structure
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Table structure:');
        result.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        console.log('🎉 Notifications table setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error creating notifications table:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the script
createNotificationsTable()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
