// Test script untuk menguji PDF endpoint
import fetch from 'node-fetch';

async function testPDFEndpoint() {
    try {
        console.log('🧪 Testing PDF endpoint...');
        
        // Test dengan nobooking yang ada di database
        const nobooking = '20011-2025-000003';
        const apiUrl = `http://localhost:3000/api/ppatk/generate-pdf-mohon-validasi/${nobooking}`;
        
        console.log('📥 Testing URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
        } else {
            const blob = await response.blob();
            console.log('✅ PDF generated successfully, size:', blob.size, 'bytes');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Server tidak berjalan. Jalankan: npm start');
        }
    }
}

// Jalankan test
testPDFEndpoint();
