// Script Node.js untuk menjalankan create_notifications_table_final.sql
import { pool } from './E-BPHTB_root_utama/db.js';
import fs from 'fs';

async function createNotificationsTable() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Creating notifications table...');
        
        // Read SQL file
        const sqlContent = fs.readFileSync('create_notifications_table_final.sql', 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await client.query(statement);
            }
        }
        
        console.log('✅ Notifications table created successfully!');
        
        // Verify table structure
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
        
        console.log('\n📋 Table structure:');
        structureResult.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Show sample data
        const sampleResult = await client.query(`
            SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5
        `);
        
        console.log('\n📊 Sample data:');
        sampleResult.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. [${row.id}] ${row.userid}: ${row.title} (${row.type})`);
        });
        
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
        console.log('\n🎉 Script completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Restart your server');
        console.log('2. Test /api/notifications/poll endpoint');
        console.log('3. Check deploy logs - should be no more errors');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
