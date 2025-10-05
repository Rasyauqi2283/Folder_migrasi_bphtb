// Script to check Uploadcare configuration and environment variables
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🔍 [UPLOADCARE-CONFIG-CHECK] Checking Uploadcare configuration...\n');

// Check environment variables
const envVars = {
    UPLOADCARE_PUBLIC_KEY: process.env.UPLOADCARE_PUBLIC_KEY,
    UPLOADCARE_SECRET_KEY: process.env.UPLOADCARE_SECRET_KEY,
    UPLOADCARE_CDN_BASE: process.env.UPLOADCARE_CDN_BASE,
    UPLOADCARE_API_BASE: process.env.UPLOADCARE_API_BASE
};

console.log('📋 [ENV-VARS] Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
    if (key.includes('KEY')) {
        console.log(`  ${key}: ${value ? 'SET (' + value.substring(0, 8) + '...)' : 'NOT_SET'}`);
    } else {
        console.log(`  ${key}: ${value || 'NOT_SET'}`);
    }
});

// Check configuration object
const UPLOADCARE_CONFIG = {
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY || 'demopublickey',
    secretKey: process.env.UPLOADCARE_SECRET_KEY || 'demosecretkey',
    cdnBase: process.env.UPLOADCARE_CDN_BASE || 'https://44renul14z.ucarecd.net',
    apiBase: process.env.UPLOADCARE_API_BASE || 'https://api.uploadcare.com'
};

console.log('\n⚙️ [CONFIG-OBJECT] Uploadcare Configuration:');
Object.entries(UPLOADCARE_CONFIG).forEach(([key, value]) => {
    if (key.includes('Key')) {
        console.log(`  ${key}: ${value.substring(0, 8)}...`);
    } else {
        console.log(`  ${key}: ${value}`);
    }
});

// Check for domain consistency
console.log('\n🌐 [DOMAIN-CHECK] Domain Consistency:');
const expectedCdnBase = 'https://44renul14z.ucarecd.net';
const actualCdnBase = UPLOADCARE_CONFIG.cdnBase;

if (actualCdnBase === expectedCdnBase) {
    console.log(`  ✅ CDN Base is correct: ${actualCdnBase}`);
} else {
    console.log(`  ❌ CDN Base mismatch:`);
    console.log(`    Expected: ${expectedCdnBase}`);
    console.log(`    Actual: ${actualCdnBase}`);
    console.log(`    Fix: Set UPLOADCARE_CDN_BASE=${expectedCdnBase}`);
}

// Test URL generation
console.log('\n🔗 [URL-GENERATION] Test URL Generation:');
const testFileId = 'test-file-id~1';
const testMimeType = 'image/png';

let testUrl;
if (testMimeType.startsWith('image/')) {
    testUrl = `${actualCdnBase}/${testFileId}/-/preview/1000x1000/`;
} else {
    testUrl = `${actualCdnBase}/${testFileId}`;
}

console.log(`  Test File ID: ${testFileId}`);
console.log(`  Test MIME Type: ${testMimeType}`);
console.log(`  Generated URL: ${testUrl}`);

// Recommendations
console.log('\n💡 [RECOMMENDATIONS] Recommendations:');
if (actualCdnBase !== expectedCdnBase) {
    console.log('  1. Update environment variable UPLOADCARE_CDN_BASE to: https://44renul14z.ucarecd.net');
    console.log('  2. Restart the application after updating environment variables');
    console.log('  3. Verify the change with this script');
} else {
    console.log('  ✅ Configuration looks correct!');
    console.log('  If you\'re still seeing 404 errors, check:');
    console.log('    - File ID format (should include ~1 suffix if present)');
    console.log('    - CDN propagation time (files may take time to be available)');
    console.log('    - Uploadcare account settings and permissions');
}

console.log('\n🏁 [CONFIG-CHECK] Check completed.');
