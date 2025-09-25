#!/usr/bin/env node

/**
 * Script untuk generate encryption key yang aman
 * Usage: node generate_encryption_key.js
 */

import crypto from 'crypto';

console.log('🔐 Generating secure encryption key...\n');

// Generate 32-byte random key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated 32-byte encryption key:');
console.log(`FILE_ENCRYPTION_KEY=${encryptionKey}\n`);

console.log('📋 Copy the key above and add it to your .env file:');
console.log('FILE_ENCRYPTION_KEY=' + encryptionKey + '\n');

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Keep this key SECRET - never commit to git');
console.log('2. Backup this key in a secure location');
console.log('3. If you lose this key, ALL encrypted files will be UNRECOVERABLE');
console.log('4. Share this key only with trusted administrators\n');

console.log('🚀 Ready to secure your KTP files!');
