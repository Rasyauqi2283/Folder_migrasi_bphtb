#!/bin/bash

# Test script untuk menguji API endpoint dengan curl
echo "🧪 Testing API endpoint with curl..."

# Data test
NOBOOKING="20011-2025-000003"
API_URL="http://localhost:3000/api/save-ppatk-additional-data?nobooking=${NOBOOKING}"

# JSON data
JSON_DATA='{
  "nobooking": "20011-2025-000003",
  "alamat_pemohon": "Test Alamat Pemohon Curl",
  "kampungop": "Test Kampung Curl",
  "kelurahanop": "Test Kelurahan Curl",
  "kecamatanopj": "Test Kecamatan Curl",
  "keterangan": "Test Keterangan Curl"
}'

echo "📥 Sending data to: $API_URL"
echo "📥 JSON data: $JSON_DATA"
echo ""

# Test dengan curl
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  -v

echo ""
echo "✅ Curl test completed!"
