// Test script untuk menguji API endpoint secara langsung
import fetch from 'node-fetch';

async function testAPIEndpoint() {
    try {
        console.log('🧪 Testing API endpoint directly...');
        
        // Data test yang akan dikirim
        const testData = {
            nobooking: '20011-2025-000003',
            alamat_pemohon: 'Test Alamat Pemohon API',
            kampungop: 'Test Kampung API',
            kelurahanop: 'Test Kelurahan API',
            kecamatanopj: 'Test Kecamatan API',
            keterangan: 'Test Keterangan API'
        };
        
        console.log('📥 Test data to send:', testData);
        
        // Test API endpoint
        const apiUrl = 'http://localhost:3000/api/save-ppatk-additional-data?nobooking=' + encodeURIComponent(testData.nobooking);
        console.log('🌐 API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: Tidak ada session cookie, jadi mungkin akan error 401
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        console.log('📡 Response body:', result);
        
        if (response.ok && result.success) {
            console.log('✅ API test successful!');
        } else {
            console.log('❌ API test failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ API test error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Server tidak berjalan. Jalankan: npm start atau node index.js');
        }
    }
}

// Jalankan test
testAPIEndpoint();
