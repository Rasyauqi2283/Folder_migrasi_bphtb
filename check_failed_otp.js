#!/usr/bin/env node

/**
 * Script untuk melihat OTP yang gagal dikirim
 * Usage: node check_failed_otp.js [email]
 */

import { pool } from './db.js';

console.log('📧 Checking failed OTP logs...\n');

const email = process.argv[2];

try {
    let query, params;
    
    if (email) {
        // Cek OTP untuk email tertentu
        query = `
            SELECT id, email, otp, created_at, status, notes 
            FROM otp_logs 
            WHERE email = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        params = [email];
        console.log(`🔍 Searching OTP logs for: ${email}\n`);
    } else {
        // Cek semua OTP yang gagal dikirim (24 jam terakhir)
        query = `
            SELECT id, email, otp, created_at, status, notes 
            FROM otp_logs 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        params = [];
        console.log('🔍 Recent failed OTP logs (last 24 hours):\n');
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
        console.log('✅ No failed OTP logs found');
        if (email) {
            console.log(`   Email ${email} has no failed OTP attempts`);
        } else {
            console.log('   No failed OTP attempts in the last 24 hours');
        }
    } else {
        console.log(`📋 Found ${result.rows.length} OTP log(s):\n`);
        
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. Email: ${row.email}`);
            console.log(`   OTP: ${row.otp}`);
            console.log(`   Time: ${row.created_at.toLocaleString()}`);
            console.log(`   Status: ${row.status}`);
            if (row.notes) {
                console.log(`   Notes: ${row.notes}`);
            }
            console.log('');
        });
        
        // Summary
        const failedCount = result.rows.filter(row => row.status === 'failed_to_send').length;
        console.log(`📊 Summary:`);
        console.log(`   Total logs: ${result.rows.length}`);
        console.log(`   Failed to send: ${failedCount}`);
        console.log(`   Success rate: ${((result.rows.length - failedCount) / result.rows.length * 100).toFixed(1)}%`);
    }
    
} catch (error) {
    console.error('❌ Error checking OTP logs:', error.message);
    
    if (error.message.includes('relation "otp_logs" does not exist')) {
        console.log('\n💡 Tip: Run the SQL script to create otp_logs table:');
        console.log('   cat database/create_otp_logs_table.sql | psql your_database');
    }
} finally {
    await pool.end();
}
