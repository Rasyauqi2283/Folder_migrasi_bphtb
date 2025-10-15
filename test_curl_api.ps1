# Test script untuk menguji API endpoint dengan PowerShell
Write-Host "🧪 Testing API endpoint with PowerShell..." -ForegroundColor Green

# Data test
$NOBOOKING = "20011-2025-000003"
$API_URL = "http://localhost:3000/api/save-ppatk-additional-data?nobooking=$NOBOOKING"

# JSON data
$JSON_DATA = @{
    nobooking = "20011-2025-000003"
    alamat_pemohon = "Test Alamat Pemohon PowerShell"
    kampungop = "Test Kampung PowerShell"
    kelurahanop = "Test Kelurahan PowerShell"
    kecamatanopj = "Test Kecamatan PowerShell"
    keterangan = "Test Keterangan PowerShell"
} | ConvertTo-Json

Write-Host "📥 Sending data to: $API_URL" -ForegroundColor Yellow
Write-Host "📥 JSON data: $JSON_DATA" -ForegroundColor Yellow
Write-Host ""

try {
    # Test dengan Invoke-RestMethod
    $response = Invoke-RestMethod -Uri $API_URL -Method POST -ContentType "application/json" -Body $JSON_DATA
    
    Write-Host "✅ Response received:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -like "*Connection refused*") {
        Write-Host "💡 Server tidak berjalan. Jalankan: npm start" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ PowerShell test completed!" -ForegroundColor Green
