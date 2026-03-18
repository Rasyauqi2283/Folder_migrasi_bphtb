// Uploadcare Health Check Script
// Test Uploadcare health check
async function testUploadcareHealth() {
    try {
        const config = {
            healthEndpoint: '/api/ppat/uploadcare-health'
        };
        
        const response = await fetch(config.healthEndpoint, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Uploadcare health check passed:', data);
            return true;
        } else {
            console.warn('⚠️ Uploadcare health check failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Uploadcare health check error:', error);
        return false;
    }
}

// Initialize Uploadcare health check on page load
document.addEventListener('DOMContentLoaded', () => {
    testUploadcareHealth();
});

// Export for use in other scripts
window.testUploadcareHealth = testUploadcareHealth;
