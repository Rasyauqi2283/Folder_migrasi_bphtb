#!/usr/bin/env node

/**
 * Script untuk generate encryption key yang aman untuk AES-256-GCM
 * Usage: node generate_encryption_key.js
 */

import crypto from 'crypto';

console.log('🔐 Generating secure encryption key for AES-256-GCM...\n');

// Generate 32-byte random key (256 bits)
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated 32-byte encryption key (256 bits):');
console.log(`FILE_ENCRYPTION_KEY=${encryptionKey}\n`);

console.log('📋 Copy the key above and add it to your .env file:');
console.log('FILE_ENCRYPTION_KEY=' + encryptionKey + '\n');

console.log('🔍 Key Validation:');
console.log(`   Length: ${encryptionKey.length} characters`);
console.log(`   Bytes: ${Buffer.from(encryptionKey, 'hex').length} bytes`);
console.log(`   Format: ${/^[a-f0-9]{64}$/.test(encryptionKey) ? 'Valid hex' : 'Invalid format'}\n`);

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Keep this key SECRET - never commit to git');
console.log('2. Backup this key in a secure location');
console.log('3. If you lose this key, ALL encrypted files will be UNRECOVERABLE');
console.log('4. Share this key only with trusted administrators');
console.log('5. This key is 256-bit (32 bytes) - perfect for AES-256-GCM\n');

console.log('🚀 Ready to secure your KTP files with AES-256-GCM!');
