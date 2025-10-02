// Script untuk test upload file binary ke Uploadcare
import { uploadToUploadcare } from './backend/config/uploads/uploadcare_storage.js';
import fs from 'fs';
import path from 'path';

console.log('🧪 TESTING BINARY FILE UPLOAD TO UPLOADCARE');
console.log('='.repeat(60));

async function testBinaryFileUpload() {
    try {
        console.log('🔍 Testing with real binary file...');
        
        // Create a real PDF file for testing
        const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;
        
        const pdfBuffer = Buffer.from(testPdfContent, 'binary');
        
        const mockFile = {
            buffer: pdfBuffer,
            originalname: 'test-document.pdf',
            mimetype: 'application/pdf',
            size: pdfBuffer.length
        };
        
        console.log('📋 Mock PDF file:', {
            bufferType: typeof mockFile.buffer,
            bufferLength: mockFile.buffer.length,
            bufferIsBuffer: Buffer.isBuffer(mockFile.buffer),
            originalName: mockFile.originalname,
            mimetype: mockFile.mimetype,
            size: mockFile.size,
            firstBytes: mockFile.buffer.slice(0, 10).toString('hex')
        });
        
        const options = {
            userid: 'TEST_USER',
            nobooking: 'TEST-2025-000001',
            docType: 'Test',
            sequenceNumber: '000001',
            resourceType: 'raw'
        };
        
        console.log('📤 Uploading binary PDF file...');
        
        const result = await uploadToUploadcare(mockFile, options);
        
        if (result.success) {
            console.log('✅ Upload successful!');
            console.log('📊 Upload result:', {
                fileId: result.fileId,
                fileName: result.fileName,
                fileUrl: result.fileUrl,
                publicUrl: result.publicUrl,
                size: result.size,
                mimeType: result.mimeType
            });
            
            // Test file accessibility
            console.log('🔍 Testing file accessibility...');
            try {
                const response = await fetch(result.fileUrl);
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    const contentLength = response.headers.get('content-length');
                    console.log('✅ File accessible:', {
                        status: response.status,
                        contentType: contentType,
                        contentLength: contentLength
                    });
                    
                    if (contentType === 'application/pdf') {
                        console.log('✅ File type correctly identified as PDF');
                    } else {
                        console.log('⚠️ File type mismatch:', contentType);
                    }
                } else {
                    console.log('❌ File not accessible:', response.status, response.statusText);
                }
            } catch (fetchError) {
                console.log('❌ Error testing file accessibility:', fetchError.message);
            }
            
        } else {
            console.log('❌ Upload failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testBinaryFileUpload().catch(console.error);
