// Test script untuk endpoint /api/notifications/unread
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000'; // Sesuaikan dengan port server Anda

async function testNotificationsEndpoint() {
    console.log('🧪 Testing /api/notifications/unread endpoint...');
    
    try {
        // Test tanpa session (harus return 401)
        console.log('\n1. Testing without session (should return 401):');
        const response1 = await fetch(`${BASE_URL}/api/notifications/unread`);
        console.log('Status:', response1.status);
        const data1 = await response1.json();
        console.log('Response:', data1);
        
        // Test dengan session cookie (jika ada)
        console.log('\n2. Testing with session cookie:');
        const response2 = await fetch(`${BASE_URL}/api/notifications/unread`, {
            headers: {
                'Cookie': 'connect.sid=s%3A...' // Ganti dengan session cookie yang valid
            }
        });
        console.log('Status:', response2.status);
        const data2 = await response2.json();
        console.log('Response:', data2);
        
    } catch (error) {
        console.error('❌ Error testing endpoint:', error.message);
    }
}

// Test endpoint lain
async function testOtherEndpoints() {
    console.log('\n🧪 Testing other notification endpoints...');
    
    const endpoints = [
        '/api/notifications/poll',
        '/api/notifications/history',
        '/api/notifications/mark-read'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint}:`);
            const response = await fetch(`${BASE_URL}${endpoint}`);
            console.log('Status:', response.status);
            const data = await response.json();
            console.log('Response:', data);
        } catch (error) {
            console.error(`❌ Error testing ${endpoint}:`, error.message);
        }
    }
}

// Jalankan test
console.log('🚀 Starting notification endpoints test...');
testNotificationsEndpoint().then(() => {
    return testOtherEndpoints();
}).then(() => {
    console.log('\n✅ Test completed!');
}).catch(error => {
    console.error('❌ Test failed:', error);
});
