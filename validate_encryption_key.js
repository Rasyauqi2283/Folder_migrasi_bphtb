#!/usr/bin/env node

/**
 * Script untuk validasi encryption key yang ada
 * Usage: node validate_encryption_key.js [key]
 */

import crypto from 'crypto';

console.log('🔍 Validating encryption key...\n');

// Ambil key dari argument atau environment
const keyToValidate = process.argv[2] || process.env.FILE_ENCRYPTION_KEY;

if (!keyToValidate) {
    console.log('❌ No key provided!');
    console.log('Usage: node validate_encryption_key.js [key]');
    console.log('Or set FILE_ENCRYPTION_KEY environment variable');
    process.exit(1);
}

console.log('🔑 Key to validate:');
console.log(`   Value: ${keyToValidate.substring(0, 16)}...${keyToValidate.substring(keyToValidate.length - 16)}`);
console.log(`   Length: ${keyToValidate.length} characters\n`);

try {
    // Cek format hex
    const isHex = /^[a-f0-9]+$/i.test(keyToValidate);
    console.log(`✅ Format: ${isHex ? 'Valid hex' : 'Invalid hex format'}`);
    
    if (!isHex) {
        console.log('❌ Key must be in hexadecimal format (0-9, a-f)');
        process.exit(1);
    }
    
    // Cek panjang
    const expectedLength = 64; // 32 bytes = 64 hex characters
    console.log(`✅ Length: ${keyToValidate.length === expectedLength ? 'Correct (64 chars)' : `Incorrect (expected ${expectedLength}, got ${keyToValidate.length})`}`);
    
    if (keyToValidate.length !== expectedLength) {
        console.log('❌ Key must be exactly 64 hexadecimal characters (32 bytes) for AES-256');
        process.exit(1);
    }
    
    // Cek apakah bisa di-parse sebagai Buffer
    const keyBuffer = Buffer.from(keyToValidate, 'hex');
    console.log(`✅ Buffer: ${keyBuffer.length} bytes`);
    
    if (keyBuffer.length !== 32) {
        console.log('❌ Key buffer must be exactly 32 bytes for AES-256');
        process.exit(1);
    }
    
    // Test dengan crypto function
    const testIV = crypto.randomBytes(12); // GCM uses 12-byte IV
    const testData = Buffer.from('test data');
    
    try {
        const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, testIV);
        cipher.update(testData);
        cipher.final();
        const authTag = cipher.getAuthTag();
        
        console.log('✅ Crypto Test: Key works with AES-256-GCM');
        console.log(`   Test IV: ${testIV.length} bytes`);
        console.log(`   Auth Tag: ${authTag.length} bytes`);
        
    } catch (cryptoError) {
        console.log('❌ Crypto Test: Key failed with AES-256-GCM');
        console.log(`   Error: ${cryptoError.message}`);
        process.exit(1);
    }
    
    console.log('\n🎉 Key validation successful!');
    console.log('✅ Key is valid for AES-256-GCM encryption');
    console.log('✅ Ready to use in production');
    
} catch (error) {
    console.log(`❌ Validation failed: ${error.message}`);
    process.exit(1);
}
