# Storage Configuration

Sistem penyimpanan file telah diubah dari Uploadcare CDN ke Railway local storage untuk menghindari masalah CDN propagation dan mempersiapkan integrasi Google Drive.

## Perubahan Utama

### 1. Railway Storage (Default)
- **File**: `railway_storage.js`
- **Path**: `backend/storage/ppatk/`
- **URL**: `/storage/ppatk/`
- **Status**: ✅ **AKTIF** (Default)

### 2. Uploadcare Storage (Disabled)
- **File**: `uploadcare_storage.js`
- **Status**: ❌ **DISABLED** (Masalah CDN propagation)

### 3. Google Drive Storage (Future)
- **File**: `gdrive_storage.js`
- **Status**: 🚧 **PLACEHOLDER** (Belum diimplementasi)

### 4. Storage Manager (Unified Interface)
- **File**: `storage_manager.js`
- **Status**: ✅ **READY** (Untuk switching provider)

## Struktur File

```
backend/storage/ppatk/
├── 2025/
│   ├── PAT01/
│   │   ├── 20011-2025-000001/
│   │   │   ├── akta_tanah/
│   │   │   ├── sertifikat_tanah/
│   │   │   └── pelengkap/
│   │   └── 20011-2025-000002/
│   └── PAT02/
└── ...
```

## Endpoint Changes

### Upload Endpoint
- **URL**: `/api/ppatk/upload-documents`
- **Storage**: Railway (local)
- **Validation**: Immediate (no CDN delay)

### File Proxy
- **HEAD**: `/api/ppatk/file-proxy?relativePath=...`
- **GET**: `/api/ppatk/file-proxy?relativePath=...`
- **Purpose**: Serve files with authentication

### Static Files
- **URL**: `/storage/ppatk/...`
- **Purpose**: Direct file access (public)

## Frontend Changes

### File URL Generation
```javascript
// Old (Uploadcare)
function getFileUrl(fileId) {
    return `/api/ppatk/uploadcare-proxy?fileId=${fileId}`;
}

// New (Railway)
function getFileUrl(relativePath) {
    return `/api/ppatk/file-proxy?relativePath=${encodeURIComponent(relativePath)}`;
}
```

### Validation
```javascript
// Old (Uploadcare)
await validateFileWithProxyFrontend(fileId, mimeType);

// New (Railway)
await validateFileWithRailwayFrontend(relativePath, mimeType);
```

## Database Changes

### File ID Storage
- **Old**: Uploadcare file ID (UUID)
- **New**: Relative path (e.g., `ppatk/2025/PAT01/20011-2025-000001/akta_tanah/file.pdf`)

### Columns Affected
- `akta_tanah_file_id` → stores relative path
- `sertifikat_tanah_file_id` → stores relative path
- `pelengkap_file_id` → stores relative path

## Configuration

### Environment Variables
```bash
# Railway Storage (Default - No config needed)
# Files stored locally on Railway server

# Uploadcare (Optional - Currently disabled)
UPLOADCARE_PUBLIC_KEY=your_key
UPLOADCARE_SECRET_KEY=your_secret
UPLOADCARE_CDN_BASE=https://your-domain.ucarecd.net

# Google Drive (Future)
GOOGLE_DRIVE_CREDENTIALS_PATH=./config/gdrive-credentials.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_DRIVE_ENABLED=false
```

## Migration Notes

### From Uploadcare to Railway
1. ✅ Uploadcare endpoints disabled
2. ✅ Railway storage implemented
3. ✅ Frontend updated
4. ✅ Database schema compatible
5. ✅ Static file serving configured

### Future Google Drive Integration
1. 🚧 Placeholder implementation ready
2. 🚧 Storage manager supports switching
3. 🚧 Configuration structure prepared
4. ⏳ Actual Google Drive API integration pending

## Testing

### Test Endpoints
```bash
# Test Railway proxy
GET /api/test-railway-proxy

# Test file proxy
HEAD /api/ppatk/file-proxy?relativePath=ppatk/2025/PAT01/20011-2025-000001/akta_tanah/test.pdf
GET /api/ppatk/file-proxy?relativePath=ppatk/2025/PAT01/20011-2025-000001/akta_tanah/test.pdf
```

### File Upload Test
```bash
POST /api/ppatk/upload-documents
Content-Type: multipart/form-data

aktaTanah: [file]
sertifikatTanah: [file]
pelengkap: [file]
booking_id: 20011-2025-000001
```

## Benefits

### Railway Storage
- ✅ No CDN propagation delays
- ✅ Immediate file availability
- ✅ Local control
- ✅ No external dependencies
- ✅ Cost effective

### Storage Manager
- ✅ Easy provider switching
- ✅ Unified interface
- ✅ Future Google Drive ready
- ✅ Configuration flexibility

## Troubleshooting

### Common Issues

1. **File not found (404)**
   - Check if file exists in `backend/storage/ppatk/`
   - Verify relative path format
   - Check static file serving configuration

2. **Upload failed**
   - Check directory permissions
   - Verify file size limits
   - Check multer configuration

3. **Proxy errors**
   - Check authentication
   - Verify file path format
   - Check Railway storage configuration

### Logs to Check
```bash
# Railway storage logs
grep "RAILWAY-" logs/combined.log

# File proxy logs  
grep "FILE-PROXY" logs/combined.log

# Upload logs
grep "UPLOAD-DOCUMENTS" logs/combined.log
```
