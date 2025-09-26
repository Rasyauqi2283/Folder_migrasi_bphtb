#!/usr/bin/env node

/**
 * Script untuk test SendGrid connection
 * Usage: node test_sendgrid.js [email]
 */

import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testEmail = process.argv[2] || 'test@example.com';

console.log('🚀 Testing SendGrid Connection...\n');

// Check if API key is configured
if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    console.log('💡 Make sure to set SENDGRID_API_KEY in your .env file');
    process.exit(1);
}

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('✅ SendGrid API key configured');
console.log(`📧 Testing email to: ${testEmail}\n`);

try {
    // Test email message
    const msg = {
        to: testEmail,
        from: process.env.EMAIL_USER || 'noreply@bappenda.com',
        subject: 'Test Email from BAPPENDA',
        text: 'This is a test email from BAPPENDA system.',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Test Email from BAPPENDA</h2>
                <p>This is a test email to verify SendGrid configuration.</p>
                <p>If you receive this email, SendGrid is working correctly!</p>
                <p style="margin-top: 30px;">Hormat kami,<br>
                <strong>Tim BAPPENDA</strong></p>
            </div>
        `
    };

    // Send test email
    console.log('📤 Sending test email...');
    const response = await sgMail.send(msg);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Email sent to: ${testEmail}`);
    console.log(`📋 Response:`, response[0].statusCode);
    
    if (response[0].headers) {
        console.log(`🔗 Message ID: ${response[0].headers['x-message-id']}`);
    }
    
    console.log('\n🎉 SendGrid is working correctly!');
    console.log('💡 You can now use SendGrid for OTP delivery in your application.');
    
} catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
    
    if (error.response) {
        console.error('📋 Error details:', error.response.body);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if SENDGRID_API_KEY is correct');
    console.log('2. Verify the API key has sending permissions');
    console.log('3. Check if the sender email is verified in SendGrid');
    console.log('4. Ensure you have sufficient SendGrid credits');
    
    process.exit(1);
}
