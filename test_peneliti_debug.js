// Script untuk test debug peneliti endpoint
console.log('🧪 Testing Peneliti Debug Endpoints...\n');

async function testPenelitiDebug() {
    try {
        // Test 1: Debug Session Endpoint
        console.log('1. Testing /api/debug-session...');
        const sessionResponse = await fetch('/api/debug-session');
        const sessionData = await sessionResponse.json();
        
        console.log('Session Debug Result:');
        console.log(JSON.stringify(sessionData, null, 2));
        
        // Test 2: Test Peneliti Endpoint
        console.log('\n2. Testing /api/peneliti_get-berkas-fromltb...');
        const penelitiResponse = await fetch('/api/peneliti_get-berkas-fromltb');
        
        console.log('Peneliti Endpoint Response:');
        console.log('Status:', penelitiResponse.status);
        console.log('Status Text:', penelitiResponse.statusText);
        
        if (penelitiResponse.ok) {
            const penelitiData = await penelitiResponse.json();
            console.log('Response Data:', JSON.stringify(penelitiData, null, 2));
        } else {
            const errorText = await penelitiResponse.text();
            console.log('Error Response:', errorText);
        }
        
    } catch (error) {
        console.error('Test Error:', error);
    }
}

// Run test
testPenelitiDebug();
