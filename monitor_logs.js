// Script untuk memonitor log server secara real-time
import fs from 'fs';
import path from 'path';

function monitorLogs() {
    console.log('📊 Monitoring server logs...');
    console.log('💡 Start your server and then test the form to see real-time logs');
    console.log('🔍 Press Ctrl+C to stop monitoring\n');
    
    // Monitor console output (kita tidak bisa monitor console.log secara langsung)
    // Tapi kita bisa monitor file log jika ada
    const logFiles = [
        'logs/combined.log',
        'logs/error.log',
        'firebase-debug.log'
    ];
    
    logFiles.forEach(logFile => {
        if (fs.existsSync(logFile)) {
            console.log(`📁 Monitoring: ${logFile}`);
            
            // Watch for changes
            fs.watchFile(logFile, { interval: 1000 }, (curr, prev) => {
                if (curr.mtime > prev.mtime) {
                    console.log(`\n📝 ${logFile} updated at ${curr.mtime}`);
                    
                    // Read last few lines
                    try {
                        const content = fs.readFileSync(logFile, 'utf8');
                        const lines = content.split('\n');
                        const lastLines = lines.slice(-5).filter(line => line.trim());
                        
                        if (lastLines.length > 0) {
                            console.log('📄 Recent entries:');
                            lastLines.forEach(line => console.log(`   ${line}`));
                        }
                    } catch (err) {
                        console.error('❌ Error reading log file:', err.message);
                    }
                }
            });
        }
    });
    
    console.log('\n🔍 Monitoring started. Test your form now!');
    console.log('💡 Check your server console for real-time logs');
}

// Jalankan monitoring
monitorLogs();
