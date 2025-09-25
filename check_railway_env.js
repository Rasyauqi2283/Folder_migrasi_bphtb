#!/usr/bin/env node

/**
 * Script untuk cek environment variables di Railway
 * Usage: node check_railway_env.js
 */

console.log('🚀 Checking Railway Environment Variables...\n');

// Cek environment variables yang diperlukan
const requiredEnvVars = [
    'FILE_ENCRYPTION_KEY',
    'PG_USER',
    'PG_HOST', 
    'PG_DATABASE',
    'PG_PASSWORD',
    'PG_PORT',
    'SESSION_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
    'CORS_ORIGIN',
    'API_URL',
    'NODE_ENV'
];

console.log('📋 Required Environment Variables:');
console.log('=====================================');

let allPresent = true;

requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
        // Hide sensitive values
        if (envVar.includes('KEY') || envVar.includes('SECRET') || envVar.includes('PASSWORD')) {
            console.log(`✅ ${envVar}: [HIDDEN - ${value.length} characters]`);
        } else {
            console.log(`✅ ${envVar}: ${value}`);
        }
    } else {
        console.log(`❌ ${envVar}: NOT SET`);
        allPresent = false;
    }
});

console.log('\n=====================================');

if (allPresent) {
    console.log('🎉 All required environment variables are set!');
    console.log('🔒 Your KTP encryption is ready to work!');
} else {
    console.log('⚠️  Some environment variables are missing!');
    console.log('📝 Please add them to your Railway dashboard:');
    console.log('   1. Go to railway.app');
    console.log('   2. Select your project');
    console.log('   3. Click "Variables" tab');
    console.log('   4. Add missing variables');
}

// Cek khusus untuk FILE_ENCRYPTION_KEY
const encryptionKey = process.env.FILE_ENCRYPTION_KEY;
if (encryptionKey) {
    console.log('\n🔐 Encryption Key Status:');
    console.log(`   Length: ${encryptionKey.length} characters`);
    console.log(`   Format: ${/^[a-f0-9]{64}$/.test(encryptionKey) ? 'Valid hex' : 'Invalid format'}`);
    
    if (encryptionKey.length !== 64) {
        console.log('⚠️  WARNING: Encryption key should be 64 characters (32 bytes hex)');
        console.log('   Run: node generate_encryption_key.js');
    }
} else {
    console.log('\n❌ FILE_ENCRYPTION_KEY is not set!');
    console.log('   This is CRITICAL for KTP encryption to work!');
    console.log('   Run: node generate_encryption_key.js');
}

console.log('\n🚀 Ready for Railway deployment!');
