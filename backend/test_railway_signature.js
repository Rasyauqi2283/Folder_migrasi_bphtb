// Test Railway Signature Storage
// /backend/test_railway_signature.js
import { 
    saveSignatureToRailway, 
    getSignatureInfo, 
    deleteSignature, 
    listSignatures,
    testRailwayStorage 
} from './config/RailwayStorageService.js';

async function testRailwaySignature() {
    try {
        console.log('🧪 [RAILWAY-SIGNATURE-TEST] Starting Railway signature storage test...');
        
        // Test 1: Test storage functionality
        console.log('\n📡 [TEST-1] Testing Railway storage functionality...');
        const storageTest = await testRailwayStorage();
        
        if (storageTest.success) {
            console.log('✅ [TEST-1] Storage test successful');
        } else {
            console.log('❌ [TEST-1] Storage test failed:', storageTest.error);
            return;
        }
        
        // Test 2: Upload signature
        console.log('\n📤 [TEST-2] Testing signature upload...');
        const testFile = {
            buffer: Buffer.from('Test signature file content'),
            originalname: 'test-signature.png',
            mimetype: 'image/png',
            size: 25
        };
        
        const uploadResult = await saveSignatureToRailway(testFile, 'TEST_USER');
        
        if (uploadResult.success) {
            console.log('✅ [TEST-2] Upload successful');
            console.log('📁 File ID:', uploadResult.filename);
            console.log('🔗 File URL:', uploadResult.fileUrl);
            console.log('📊 Size:', uploadResult.size);
            console.log('📄 MIME Type:', uploadResult.mimeType);
        } else {
            console.log('❌ [TEST-2] Upload failed:', uploadResult.error);
            return;
        }
        
        // Test 3: Get signature info
        console.log('\n🔍 [TEST-3] Testing signature info retrieval...');
        const infoResult = await getSignatureInfo(uploadResult.filename);
        
        if (infoResult.success) {
            console.log('✅ [TEST-3] Info retrieval successful');
            console.log('📁 Filename:', infoResult.filename);
            console.log('🔗 File URL:', infoResult.fileUrl);
            console.log('📊 Size:', infoResult.size);
        } else {
            console.log('❌ [TEST-3] Info retrieval failed:', infoResult.error);
        }
        
        // Test 4: List signatures
        console.log('\n📋 [TEST-4] Testing signature listing...');
        const listResult = await listSignatures();
        
        if (listResult.success) {
            console.log('✅ [TEST-4] Listing successful');
            console.log('📊 Total signatures:', listResult.signatures.length);
            listResult.signatures.forEach((sig, index) => {
                console.log(`  ${index + 1}. ${sig.filename} (${sig.size} bytes)`);
            });
        } else {
            console.log('❌ [TEST-4] Listing failed:', listResult.error);
        }
        
        // Test 5: Delete signature
        console.log('\n🗑️ [TEST-5] Testing signature deletion...');
        const deleteResult = await deleteSignature(uploadResult.filename);
        
        if (deleteResult.success) {
            console.log('✅ [TEST-5] Deletion successful');
        } else {
            console.log('❌ [TEST-5] Deletion failed:', deleteResult.error);
        }
        
        // Test 6: Verify deletion
        console.log('\n🔍 [TEST-6] Verifying deletion...');
        const verifyResult = await getSignatureInfo(uploadResult.filename);
        
        if (!verifyResult.success) {
            console.log('✅ [TEST-6] Deletion verified - file not found');
        } else {
            console.log('❌ [TEST-6] Deletion verification failed - file still exists');
        }
        
        console.log('\n🎉 [RAILWAY-SIGNATURE-TEST] Test completed successfully!');
        
    } catch (error) {
        console.error('❌ [RAILWAY-SIGNATURE-TEST] Test failed:', error.message);
    }
}

// Run the test
testRailwaySignature();
