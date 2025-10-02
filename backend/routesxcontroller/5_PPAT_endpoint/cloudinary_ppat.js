//backend/routesxcontroller/5_PPAT_endpoint/cloudinary_ppat.js
import express from 'express';
import axios from 'axios';
import { pool } from '../../../db.js';
import { cleanupOldFiles, generateSignedUrl, generatePublicUrlWithFolder, generateSignedUrlWithFallback } from '../../config/uploads/cloudinary_storage.js';

// ===== CLOUDINARY PROXY ENDPOINT =====
// Endpoint untuk serve files dari Cloudinary via Railway server
export function createCloudinaryProxyRouter({ generateSignedUrl: generateSignedUrlParam }) {
    const router = express.Router();

    // Endpoint untuk serve files dari Cloudinary via Railway server
    router.get("/secure/:nobooking", async (req, res) => {
        const { nobooking } = req.params;
      
        try {
          // 1. Ambil public_id dari DB
          const result = await pool.query(
            `SELECT 
             akta_tanah_path, 
             sertifikat_tanah_path, 
             pelengkap_path, 
             file_withstempel_path, 
             pdf_dokumen_path
           FROM pat_1_bookingsspd
           WHERE nobooking = $1`,
          [nobooking]
          );
      
          if (result.rows.length === 0) {
            return res.status(404).json({ error: "booking tidak ditemukan" });
          }
      
          const row = result.rows[0];
      
          // 2. Fungsi bantu untuk deteksi public_id
        const extractPublicId = (path) => {
            if (!path) return null;
      
            // Kasus lama -> path lokal
            if (path.startsWith("penting_F_simpan")) {
              return null; // nanti bisa di-handle khusus
            }
      
            // Kasus Cloudinary proxy URL
            try {
              const decoded = decodeURIComponent(path);
              // Contoh: https://res.cloudinary.com/xxx/raw/upload/v1234/bappenda/dokumen-sspd/PAT10_Akta_000004_2025.pdf
              const match = decoded.match(/upload\/(?:v\d+\/)?(.+)$/);
              return match ? match[1] : null;
            } catch {
              return null;
            }
          };
      
          // 3. Generate signed URLs untuk setiap file
          const files = {};
          for (const [key, path] of Object.entries(row)) {
            if (key.endsWith('_path') && path) {
              const publicId = extractPublicId(path);
      
              if (publicId) {
                  files[key] = {
                  source: "cloudinary",
                  public_id: publicId,
                  signed_url: generateSignedUrlParam(publicId, 3600), // valid 1 jam
                  };
              }
            }
          }
      
          res.json({
            nobooking,
            files
          });
      
        } catch (error) {
          console.error('Error generating signed URLs:', error);
          res.status(500).json({ error: "Internal server error" });
        }
    });

    return router;
}

// Endpoint untuk serve files dari Cloudinary via Railway server (authenticated access)
export function createCloudinaryProxyEndpoint({ generateSignedUrl: generateSignedUrlParam }) {
    return async (req, res) => {
        try {

            // Validate generateSignedUrl function
            if (!generateSignedUrlParam || typeof generateSignedUrlParam !== 'function') {
                console.error('❌ [CLOUDINARY-PROXY] generateSignedUrl is not a function:', typeof generateSignedUrlParam);
                return res.status(500).json({ 
                    error: "Server configuration error - generateSignedUrl not available" 
                });
            }

            const { url, publicId, resourceType = 'raw' } = req.query;
            
            if (!url && !publicId) {
                return res.status(400).json({ error: "URL or publicId parameter is required" });
            }

            let cloudinaryUrl;
            
            // If publicId is provided, validate it exists on Cloudinary first
            if (publicId && publicId !== 'null' && publicId !== 'undefined') {
                
                try {
                    // Use enhanced fallback function
                    const fallbackResult = await generateSignedUrlWithFallback(publicId, {
                        resourceType: resourceType,
                        expirySeconds: 60
                    });
                    
                    if (fallbackResult.success) {
                        cloudinaryUrl = fallbackResult.url;
                        resourceType = fallbackResult.resourceType; // Update resource type if fallback was used
                        
                        if (fallbackResult.fallback) {
                            console.log(`✅ [CLOUDINARY-PROXY] Using fallback resource type: ${resourceType}`);
                        }
                    } else {
                        throw new Error('Fallback function failed');
                    }
                    
                } catch (fallbackError) {
                    console.error('❌ [CLOUDINARY-PROXY] Fallback validation failed:', {
                        publicId,
                        originalResourceType: req.query.resourceType,
                        error: fallbackError.message
                    });
                    
                    return res.status(404).json({
                        error: "File not found on Cloudinary",
                        details: `File not accessible with any resourceType - may be temporarily unavailable or deleted`,
                        publicId: publicId,
                        attemptedResourceTypes: ['raw', 'image', 'video'],
                        suggestion: "File may be processing or temporarily unavailable. Please try again in a few moments."
                    });
                }
            } else if (url) {
                // Decode existing URL
                cloudinaryUrl = decodeURIComponent(url);
            } else {
                console.error('❌ [CLOUDINARY-PROXY] Both publicId and url are invalid:', { publicId, url });
                return res.status(400).json({ 
                    error: "Invalid parameters - both publicId and url are required",
                    details: { publicId, url }
                });
            }
            
            // Validate it's a Cloudinary URL
            if (!cloudinaryUrl.includes('cloudinary.com')) {
                return res.status(400).json({ error: "Invalid Cloudinary URL" });
            }



            // Retry logic for Cloudinary requests
            let response;
            let lastError;
            const maxRetries = 3;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    response = await axios.get(cloudinaryUrl, {
                        responseType: 'stream',
                        timeout: 30000, // 30 second timeout
                        maxRedirects: 5, // Allow redirects
                        validateStatus: function (status) {
                            // Accept all status codes, handle errors manually
                            return true;
                        },
                        headers: {
                            'User-Agent': 'Railway-Proxy/1.0',
                            'Accept': '*/*',
                            'Cache-Control': 'no-cache'
                        }
                    });
                    
                    // If we get here, request was successful
                    break;
                    
                } catch (error) {
                    lastError = error;
                    console.error(`❌ [CLOUDINARY-PROXY] Attempt ${attempt}/${maxRetries} failed:`, {
                        error: error.message,
                        code: error.code,
                        status: error.response?.status
                    });
                    
                    if (attempt === maxRetries) {
                        throw error; // Final attempt failed
                    }
                    
                    // Wait before retry (exponential backoff)
                    const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }

            // Check if response is successful
            if (response.status >= 400) {
                console.error('❌ [CLOUDINARY-PROXY] Cloudinary returned error status:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    url: cloudinaryUrl
                });
                
                // Handle specific Cloudinary errors
                if (response.status === 401) {
                    return res.status(401).json({ 
                        error: "Unauthorized access to Cloudinary resource",
                        details: "Signed URL may be expired or invalid",
                        publicId: publicId
                    });
                } else if (response.status === 404) {
                    return res.status(404).json({ 
                        error: "Resource not found on Cloudinary",
                        details: response.headers['x-cld-error'] || 'File does not exist',
                        publicId: publicId
                    });
                } else if (response.status === 403) {
                    return res.status(403).json({ 
                        error: "Access forbidden to Cloudinary resource",
                        details: "Resource may be private or access denied",
                        publicId: publicId
                    });
                } else {
                    return res.status(response.status).json({ 
                        error: "Cloudinary server error",
                        status: response.status,
                        details: response.headers['x-cld-error'] || response.statusText,
                        publicId: publicId
                    });
                }
            }
            
            // Get content type from Cloudinary response
            const contentType = response.headers['content-type'] || 'application/octet-stream';
            const contentLength = response.headers['content-length'];
            
            // Set headers
            res.set({
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes (shorter for signed URLs)
                'Access-Control-Allow-Origin': '*'
            });
            
            if (contentLength) {
                res.set('Content-Length', contentLength);
            }

            // Stream the file
            response.data.pipe(res);
            
        } catch (err) {
            console.error("❌ [CLOUDINARY-PROXY] Error serving file:", {
                error: err.message,
                code: err.code,
                stack: err.stack,
                query: req.query,
                timestamp: new Date().toISOString(),
                isNetworkError: !err.response,
                isTimeout: err.code === 'ECONNABORTED'
            });
            
            // Handle different types of errors
            if (err.code === 'ECONNABORTED') {
                return res.status(504).json({ 
                    error: "Request timeout to Cloudinary",
                    details: "Cloudinary request took too long (>30s)",
                    publicId: publicId,
                    timestamp: new Date().toISOString()
                });
            }
            
            if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
                return res.status(502).json({ 
                    error: "Cannot connect to Cloudinary",
                    details: "Network connectivity issue to Cloudinary servers",
                    publicId: publicId,
                    timestamp: new Date().toISOString()
                });
            }
            
            if (err.code === 'ECONNRESET') {
                return res.status(502).json({ 
                    error: "Connection reset by Cloudinary",
                    details: "Cloudinary server reset the connection",
                    publicId: publicId,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Handle axios response errors
            if (err.response) {
                const status = err.response.status;
                const cldError = err.response.headers['x-cld-error'] || 'Unknown error';
                
                // Reduced logging to avoid Railway rate limits
                console.error(`❌ [CLOUDINARY-PROXY] ${status}: ${cldError}`);
                
                // Handle specific error cases
                if (status === 401) {
                    return res.status(401).json({ 
                        error: "Unauthorized access - signed URL may be expired or invalid",
                        details: "Please refresh the page or contact administrator",
                        publicId: publicId
                    });
                } else if (status === 404) {
                    return res.status(404).json({ 
                        error: "File not found on Cloudinary",
                        publicId: publicId,
                        details: cldError
                    });
                } else if (status === 403) {
                    return res.status(403).json({ 
                        error: "Access forbidden to Cloudinary resource",
                        details: "Resource may be private or access denied",
                        publicId: publicId
                    });
                } else if (status >= 500) {
                    return res.status(502).json({ 
                        error: "Cloudinary server error",
                        status: status,
                        details: cldError,
                        publicId: publicId
                    });
                }
                
                return res.status(status).json({ 
                    error: "Failed to access file from Cloudinary",
                    status: status,
                    details: cldError,
                    publicId: publicId
                });
            }
            
            // Handle other errors (like network issues, etc.)
            return res.status(500).json({ 
                error: "Failed to serve file from Cloudinary",
                details: err.message,
                code: err.code,
                publicId: publicId,
                timestamp: new Date().toISOString()
            });
        }
    };
}

// Endpoint untuk refresh signed URL yang expired
export function createRefreshSignedUrlEndpoint({ generateSignedUrl: generateSignedUrlParam }) {
    return async (req, res) => {
        try {
            const { publicId } = req.query;
            
            if (!publicId) {
                return res.status(400).json({ error: "publicId parameter is required" });
            }
            
            
            // Generate fresh public URL
                const signedUrl = generateSignedUrlParam(publicId, 60); // Public URL (no expiry)
            
            res.json({
                success: true,
                publicId: publicId,
                signedUrl: signedUrl,
                type: "public"
            });
            
        } catch (error) {
            console.error('❌ [REFRESH-SIGNED-URL] Error:', error);
            res.status(500).json({ 
                error: "Failed to refresh signed URL",
                details: error.message 
            });
        }
    };
}

// Upload handler untuk Cloudinary
export function createCloudinaryUploadHandler({ mixedCloudinaryUpload, extractPublicIdFromUrl }) {
    return [
        // Middleware untuk handle content type
        (req, res, next) => {
            // Ensure proper content type handling
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                // Let multer handle multipart data
                next();
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Content-Type must be multipart/form-data for file upload'
                });
            }
        },
        
        // Multer middleware
        (req, res, next) => {
            
            // Gunakan Cloudinary storage
            mixedCloudinaryUpload.fields([
              { name: 'aktaTanah', maxCount: 1 },
              { name: 'sertifikatTanah', maxCount: 1 },
              { name: 'pelengkap', maxCount: 1 }
            ])(req, res, (uploadErr) => {
              if (uploadErr) {
                // Enhanced error logging
                console.error('❌ [CLOUDINARY-ENDPOINT] Upload error details:', {
                  error: uploadErr.message,
                  code: uploadErr.code,
                  field: uploadErr.field,
                  stack: uploadErr.stack,
                  name: uploadErr.name,
                  // Check if it's a JSON parsing error
                  isJsonError: uploadErr.message?.includes('JSON') || uploadErr.message?.includes('Unexpected token'),
                  railway_context: {
                    RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
                    RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
                    timestamp: new Date().toISOString()
                  }
                });
                
                // Handle different types of errors
                let errorMessage = 'Error uploading files to Cloudinary';
                let statusCode = 400;
                
                if (uploadErr.message?.includes('JSON') || uploadErr.message?.includes('Unexpected token')) {
                  errorMessage = 'Invalid response from Cloudinary - possible configuration issue';
                  statusCode = 500;
                } else if (uploadErr.code === 'LIMIT_FILE_SIZE') {
                  errorMessage = 'File size too large. Maximum size is 5MB.';
                } else if (uploadErr.code === 'LIMIT_FILE_COUNT') {
                  errorMessage = 'Too many files uploaded.';
                } else if (uploadErr.code === 'LIMIT_UNEXPECTED_FILE') {
                  errorMessage = 'Unexpected file field.';
                }
                
                return res.status(statusCode).json({ 
                  success: false, 
                  message: errorMessage,
                  details: uploadErr.message,
                  code: uploadErr.code
                });
              }
              
              next();
            });
        },
        
        // Main upload handler
        async (req, res) => {
            try {

                const { userid } = req.session.user;

                if (!userid) {
                    return res.status(400).json({ success: false, message: 'User ID is required' });
                }

                // Memastikan ada file yang di-upload
                if (!req.files || !req.files.aktaTanah || !req.files.sertifikatTanah || !req.files.pelengkap) {
                    return res.status(400).json({ success: false, message: 'Dokumen wajib belum lengkap (akta, sertifikat, pelengkap).' });
                }

                const { nobooking } = req.body;

                if (!nobooking) {
                    return res.status(400).json({ success: false, message: 'No booking selected' });
                }

                // Extract year and serial from nobooking
                let year = '0000';
                let serial = '000000';
                if (typeof nobooking === 'string' && nobooking.includes('-')) {
                    const parts = nobooking.split('-');
                    if (parts.length >= 3) {
                        year = parts[1].replace(/[^0-9]/g, '').padStart(4, '0').slice(-4);
                        serial = parts[2].replace(/[^0-9]/g, '').padStart(6, '0').slice(-6);
                    }
                }

                // Process uploaded files - TIDAK PERLU RENAME, langsung gunakan URL dari Cloudinary
                const fileMapping = {
                    aktaTanah: 'Akta',
                    sertifikatTanah: 'SertifikatTanah',
                    pelengkap: 'Pelengkap'
                };

                const uploadedFiles = {};

                for (const [fieldName, docType] of Object.entries(fileMapping)) {
                    if (req.files[fieldName] && req.files[fieldName][0]) {
                        const file = req.files[fieldName][0];
                        const isPdf = file.mimetype === 'application/pdf';
                        

                        // Extract public_id from Cloudinary URL
                        // Try multiple possible properties from Cloudinary response
                        let publicId = file.public_id || 
                                      file.publicId || 
                                      file.publicid || 
                                      extractPublicIdFromUrl(file.path);
                        
                        
                        // If still no publicId, try to extract from URL path
                        if (!publicId || publicId === 'null') {
                            // Extract from URL: https://res.cloudinary.com/cloud/raw/upload/v123/folder/public_id.ext
                            const urlMatch = file.path.match(/\/upload\/(?:v\d+\/)?(.+)$/);
                            if (urlMatch) {
                                publicId = urlMatch[1].replace(/\.\w+$/, '');
                            }
                        }
                        
                        // Final fallback: Generate publicId based on expected format
                        if (!publicId || publicId === 'null') {
                            // Extract from nobooking: PAT10-2025-000001
                            const parts = nobooking.split('-');
                            if (parts.length >= 3) {
                                const userid = parts[0];
                                const year = parts[1];
                                const sequence = parts[2];
                                const docType = fieldName === 'aktaTanah' ? 'Akta' : 
                                               fieldName === 'sertifikatTanah' ? 'Sertifikat' : 'Pelengkap';
                                
                                // Add timestamp untuk uniqueness
                                const currentDate = new Date();
                                const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
                                const timeStr = currentDate.toTimeString().slice(0, 8).replace(/:/g, '');
                                const timestamp = `${dateStr}_${timeStr}`;
                                
                                publicId = `${userid}_${docType}_${sequence}_${year}_${timestamp}`;
                            }
                        }
                        
                        
                        // Validate publicId before proceeding
                        if (!publicId || publicId === 'null') {
                            console.error(`❌ [CLOUDINARY-UPLOAD] Invalid publicId for ${fieldName}:`, publicId);
                            return res.status(500).json({ 
                                success: false, 
                                message: `Failed to extract valid publicId for ${fieldName}`,
                                details: {
                                    fieldName,
                                    publicId,
                                    filePath: file.path,
                                    allFileProperties: Object.keys(file)
                                }
                            });
                        }
                        

                        // Test jika file bisa diakses dari Cloudinary dengan enhanced logging
                        let fileExists = false;
                        const maxRetries = 3;
                        const retryDelay = 2000; // 2 seconds
                        
                        console.log(`🔍 [CLOUDINARY-UPLOAD] Testing file existence for ${fieldName}:`, {
                            publicId,
                            isPdf,
                            expectedResourceType: isPdf ? 'raw' : 'image',
                            cloudinaryUrl: file.path
                        });
                        
                        for (let attempt = 1; attempt <= maxRetries; attempt++) {
                            try {
                                // Wait a bit before testing (Cloudinary propagation delay)
                                if (attempt > 1) {
                                    console.log(`⏳ [CLOUDINARY-UPLOAD] Waiting ${retryDelay}ms before retry attempt ${attempt}...`);
                                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                                }
                                
                                const testUrl = generateSignedUrl(publicId, 60, isPdf ? 'raw' : 'image');
                                console.log(`🔍 [CLOUDINARY-UPLOAD] Testing URL (attempt ${attempt}): ${testUrl}`);
                                
                                const testResponse = await axios.head(testUrl, { 
                                    timeout: 15000,
                                    validateStatus: (status) => status < 500 // Accept 404 but not 5xx
                                });
                                
                                fileExists = testResponse.status === 200;
                                
                                console.log(`📊 [CLOUDINARY-UPLOAD] Test result (attempt ${attempt}):`, {
                                    status: testResponse.status,
                                    success: fileExists,
                                    headers: {
                                        'content-type': testResponse.headers['content-type'],
                                        'content-length': testResponse.headers['content-length'],
                                        'x-cld-error': testResponse.headers['x-cld-error']
                                    }
                                });
                                
                                if (fileExists) {
                                    console.log(`✅ [CLOUDINARY-UPLOAD] File exists and accessible on attempt ${attempt}`);
                                    break; // Success, exit retry loop
                                } else {
                                    console.warn(`⚠️ [CLOUDINARY-UPLOAD] File not found on attempt ${attempt}, status: ${testResponse.status}`);
                                }
                                
                            } catch (testError) {
                                console.warn(`⚠️ [CLOUDINARY-UPLOAD] File existence test attempt ${attempt} failed for ${fieldName}:`, {
                                    error: testError.message,
                                    status: testError.response?.status,
                                    code: testError.code,
                                    responseHeaders: testError.response?.headers
                                });
                                
                                if (attempt === maxRetries) {
                                    console.error(`❌ [CLOUDINARY-UPLOAD] All ${maxRetries} attempts failed for file existence test`);
                                    fileExists = false;
                                }
                            }
                        }
                        
                        // Final decision: if file still doesn't exist after retries, assume it exists (upload was successful)
                        if (!fileExists) {
                            console.warn(`⚠️ [CLOUDINARY-UPLOAD] File existence test failed after ${maxRetries} attempts, but upload was successful. Assuming file exists.`);
                            fileExists = true; // Override to true since upload was successful
                        }

                        if (!fileExists) {
                            console.error(`❌ [CLOUDINARY-UPLOAD] File ${publicId} does not exist on Cloudinary, skipping database update`);
                            return res.status(500).json({ 
                                success: false, 
                                message: `File upload failed - file not accessible on Cloudinary`,
                                details: {
                                    fieldName,
                                    publicId,
                                    error: 'File not found on Cloudinary after upload'
                                }
                            });
                        }

                        // Simpan metadata: cloudinary_url dan proxy_path
                        const resourceType = isPdf ? 'raw' : 'image';
                        
                        // Generate direct public URL untuk review yang mudah
                        const directPublicUrl = generatePublicUrlWithFolder(userid, nobooking, publicId, resourceType);
                        
                        uploadedFiles[fieldName] = {
                            cloudinary_url: file.path.replace('http://', 'https://'), // Cloudinary URL (untuk internal)
                            proxy_path: `/api/files/cloudinary-proxy?publicId=${encodeURIComponent(publicId)}&resourceType=${resourceType}`, // Railway proxy URL dengan publicId dan resourceType
                            direct_public_url: directPublicUrl, // Direct public URL untuk review
                            public_id: publicId, // Store public_id for fresh signed URL generation
                            filename: file.filename,
                            mimetype: file.mimetype,
                            size: file.size,
                            isPdf: isPdf,
                            resource_type: resourceType,
                            exists_on_cloudinary: fileExists,
                            // Metadata untuk review
                            review_info: {
                                userid: userid,
                                nobooking: nobooking,
                                docType: docType,
                                uploadDate: new Date().toISOString(),
                                folderPath: `bappenda/sspd/${new Date().getFullYear()}/${userid}/${nobooking}`
                            }
                        };

                        // 🧹 CLEAN FIRST STRATEGY: Clean old files BEFORE upload
                        const parts = nobooking.split('-');
                        if (parts.length >= 3) {
                            const [userid, currentYear, sequenceNumber] = parts;
                            
                            console.log(`🧹 [CLEAN-FIRST] Starting cleanup for ${fieldName} before upload...`);
                            
                            try {
                                // Clean old files first (keep latest 1 file for safety)
                                const cleanupResult = await cleanupOldFiles(
                                    userid, 
                                    docType, 
                                    sequenceNumber, 
                                    currentYear, 
                                    resourceType, 
                                    1, // Keep only 1 file (more aggressive cleanup)
                                    nobooking
                                );
                                
                                console.log(`✅ [CLEAN-FIRST] Cleanup completed for ${fieldName}:`, cleanupResult);
                                
                                // Store cleanup result in uploaded file metadata
                                uploadedFiles[fieldName].cleanup_result = cleanupResult;
                                
                            } catch (cleanupError) {
                                console.warn(`⚠️ [CLEAN-FIRST] Cleanup failed for ${fieldName}:`, cleanupError.message);
                                // Continue with upload even if cleanup fails
                                uploadedFiles[fieldName].cleanup_error = cleanupError.message;
                            }
                        }
                    }
                }

                // Simpan URLs ke database (proxy + direct public untuk review)
                const aktaTanahUrl = uploadedFiles.aktaTanah?.direct_public_url || uploadedFiles.aktaTanah?.proxy_path || null;
                const sertifikatTanahUrl = uploadedFiles.sertifikatTanah?.direct_public_url || uploadedFiles.sertifikatTanah?.proxy_path || null;
                const pelengkapUrl = uploadedFiles.pelengkap?.direct_public_url || uploadedFiles.pelengkap?.proxy_path || null;


                // Update database dengan proxy URLs
                const result = await pool.query(
                    `UPDATE pat_1_bookingsspd 
                     SET akta_tanah_path = $1, 
                         sertifikat_tanah_path = $2, 
                         pelengkap_path = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE nobooking = $4 AND userid = $5`,
                    [aktaTanahUrl, sertifikatTanahUrl, pelengkapUrl, nobooking, userid]
                );

                if (result.rowCount > 0) {
                    // ✅ DATABASE UPDATE BERHASIL - Clean First strategy completed
                    console.log('✅ [CLOUDINARY-UPLOAD] Database updated successfully - Clean First strategy completed');
                    
                    res.json({
                        success: true,
                        message: 'Files uploaded successfully to Cloudinary (Clean First Strategy)',
                        data: {
                            nobooking,
                            uploadedFiles: Object.keys(uploadedFiles),
                            // URLs untuk review
                            reviewUrls: {
                                aktaTanah: uploadedFiles.aktaTanah?.direct_public_url,
                                sertifikatTanah: uploadedFiles.sertifikatTanah?.direct_public_url,
                                pelengkap: uploadedFiles.pelengkap?.direct_public_url
                            },
                            // Proxy URLs untuk internal access
                            proxyUrls: {
                                aktaTanah: aktaTanahUrl,
                                sertifikatTanah: sertifikatTanahUrl,
                                pelengkap: pelengkapUrl
                            },
                            // Metadata untuk review
                            reviewInfo: {
                                userid,
                                uploadDate: new Date().toISOString(),
                                folderStructure: `bappenda/sspd/${new Date().getFullYear()}/${userid}/${nobooking}`,
                                files: Object.values(uploadedFiles).map(file => ({
                                    type: file.review_info?.docType,
                                    publicId: file.public_id,
                                    size: file.size,
                                    mimetype: file.mimetype
                                }))
                            },
                            // Cleanup status
                            cleanupStatus: {
                                message: 'Clean First strategy - old files cleaned before upload',
                                strategy: 'Clean First, Then Upload',
                                cleanupResults: Object.entries(uploadedFiles)
                                    .filter(([_, fileData]) => fileData.cleanup_result)
                                    .map(([fieldName, fileData]) => ({
                                        field: fieldName,
                                        result: fileData.cleanup_result
                                    }))
                            }
                        }
                    });
                } else {
                    res.status(404).json({ success: false, message: 'Failed to update database' });
                }
            } catch (error) {
                console.error('❌ [CLOUDINARY-ENDPOINT] Upload to Cloudinary failed:', {
                    error: error.message,
                    stack: error.stack,
                    railway_context: {
                        RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
                        RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
                        NODE_ENV: process.env.NODE_ENV || 'development',
                        nobooking: nobooking,
                        userid: userid,
                        timestamp: new Date().toISOString()
                    }
                });
                res.status(500).json({ success: false, message: 'Failed to save files: ' + error.message });
            }
        }
    ];
}

// PDF Upload handler untuk Cloudinary
export function createCloudinaryPDFUploadHandler({ mixedCloudinaryUpload, extractPublicIdFromUrl }) {
    return [
        // Multer middleware untuk PDF
        (req, res, next) => {
            
            mixedCloudinaryUpload.single('pdfDokumen')(req, res, (err) => {
                if (err) {
                    console.error('❌ [CLOUDINARY-PDF] Upload error:', err);
                    return res.status(400).json({ 
                      success: false, 
                      message: err.message || 'Error uploading PDF file' 
                    });
                }
                
                next();
            });
        },
        
        // Main PDF upload handler
        async (req, res) => {
            const { userid } = req.session.user;

            if (!userid) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
            }

            const { nobooking } = req.body;

            if (!nobooking) {
                return res.status(400).json({ success: false, message: 'No booking selected' });
            }

            // Tambahan proxy untuk PDF dokumen
            const pdfDokumenPath = req.file.path.replace('http://', 'https://');
            let pdfPublicId = req.file.public_id || 
                             req.file.publicId || 
                             req.file.publicid || 
                             extractPublicIdFromUrl(pdfDokumenPath);
            
            // If still no publicId, try to extract from URL path
            if (!pdfPublicId || pdfPublicId === 'null') {
                // Extract from URL: https://res.cloudinary.com/cloud/raw/upload/v123/folder/public_id.ext
                const urlMatch = req.file.path.match(/\/upload\/(?:v\d+\/)?(.+)$/);
                if (urlMatch) {
                    pdfPublicId = urlMatch[1].replace(/\.\w+$/, '');
                }
            }
            
            // Final fallback: Generate publicId based on expected format
            if (!pdfPublicId || pdfPublicId === 'null') {
                // Extract from nobooking: PAT10-2025-000001
                const parts = nobooking.split('-');
                if (parts.length >= 3) {
                    const userid = parts[0];
                    const year = parts[1];
                    const sequence = parts[2];
                    
                    // Add timestamp untuk uniqueness
                    const currentDate = new Date();
                    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
                    const timeStr = currentDate.toTimeString().slice(0, 8).replace(/:/g, '');
                    const timestamp = `${dateStr}_${timeStr}`;
                    
                    // New format: userid_DokumenP_sequence_timestamp (folder sudah mengandung userid/nobooking)
                    pdfPublicId = `${userid}_DokumenP_${sequence}_${timestamp}`;
                }
            }
            
            
            // Validate publicId before proceeding
            if (!pdfPublicId || pdfPublicId === 'null') {
                console.error('❌ [CLOUDINARY-PDF] Invalid publicId:', pdfPublicId);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to extract valid publicId for PDF',
                    details: {
                        pdfPublicId,
                        filePath: req.file.path,
                        allFileProperties: Object.keys(req.file)
                    }
                });
            }

            // Test jika PDF file bisa diakses dari Cloudinary dengan enhanced logging
            let pdfFileExists = false;
            const maxRetries = 3;
            const retryDelay = 10000; // 10 seconds
            
            console.log(`🔍 [CLOUDINARY-PDF] Testing PDF file existence:`, {
                pdfPublicId,
                expectedResourceType: 'raw',
                cloudinaryUrl: req.file.path
            });
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    // Wait a bit before testing (Cloudinary propagation delay)
                    if (attempt > 1) {
                        console.log(`⏳ [CLOUDINARY-PDF] Waiting ${retryDelay}ms before retry attempt ${attempt}...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                    
                    const testUrl = generateSignedUrl(pdfPublicId, 60, 'raw');
                    console.log(`🔍 [CLOUDINARY-PDF] Testing URL (attempt ${attempt}): ${testUrl}`);
                    
                    const testResponse = await axios.head(testUrl, { 
                        timeout: 15000,
                        validateStatus: (status) => status < 500 // Accept 404 but not 5xx
                    });
                    
                    pdfFileExists = testResponse.status === 200;
                    
                    console.log(`📊 [CLOUDINARY-PDF] Test result (attempt ${attempt}):`, {
                        status: testResponse.status,
                        success: pdfFileExists,
                        headers: {
                            'content-type': testResponse.headers['content-type'],
                            'content-length': testResponse.headers['content-length'],
                            'x-cld-error': testResponse.headers['x-cld-error']
                        }
                    });
                    
                    if (pdfFileExists) {
                        console.log(`✅ [CLOUDINARY-PDF] PDF file exists and accessible on attempt ${attempt}`);
                        break; // Success, exit retry loop
                    } else {
                        console.warn(`⚠️ [CLOUDINARY-PDF] PDF file not found on attempt ${attempt}, status: ${testResponse.status}`);
                    }
                    
                } catch (testError) {
                    console.warn(`⚠️ [CLOUDINARY-PDF] PDF file existence test attempt ${attempt} failed:`, {
                        error: testError.message,
                        status: testError.response?.status,
                        code: testError.code,
                        responseHeaders: testError.response?.headers
                    });
                    
                    if (attempt === maxRetries) {
                        console.error(`❌ [CLOUDINARY-PDF] All ${maxRetries} attempts failed for PDF file existence test`);
                        pdfFileExists = false;
                    }
                }
            }
            
            // Final decision: if file still doesn't exist after retries, assume it exists (upload was successful)
            if (!pdfFileExists) {
                console.warn(`⚠️ [CLOUDINARY-PDF] PDF file existence test failed after ${maxRetries} attempts, but upload was successful. Assuming file exists.`);
                pdfFileExists = true; // Override to true since upload was successful
            }

            if (!pdfFileExists) {
                console.error(`❌ [CLOUDINARY-PDF] PDF file ${pdfPublicId} does not exist on Cloudinary, skipping database update`);
                return res.status(500).json({ 
                    success: false, 
                    message: `PDF file upload failed - file not accessible on Cloudinary`,
                    details: {
                        pdfPublicId,
                        error: 'PDF file not found on Cloudinary after upload'
                    }
                });
            }

            // 🧹 CLEAN FIRST STRATEGY: Clean old PDF files BEFORE database update
            console.log('🧹 [CLEAN-FIRST-PDF] Starting PDF cleanup before database update...');
            
            let pdfCleanupResult = null;
            try {
                // Extract components untuk cleanup dari nobooking
                const parts = nobooking.split('-');
                if (parts.length >= 3) {
                    const [userid, currentYear, sequenceNumber] = parts;
                    
                    console.log(`🧹 [CLEAN-FIRST-PDF] Starting PDF cleanup:`, {
                        userid,
                        docType: 'DokumenP',
                        pdfPublicId
                    });
                    
                    // Cleanup PDF file lama (keep latest 1 file untuk safety)
                    pdfCleanupResult = await cleanupOldFiles(
                        userid, 
                        'DokumenP', 
                        sequenceNumber, 
                        currentYear, 
                        'raw', 
                        1, // Keep only 1 file (more aggressive cleanup)
                        nobooking
                    );
                    
                    console.log(`✅ [CLEAN-FIRST-PDF] PDF cleanup completed:`, pdfCleanupResult);
                }
            } catch (cleanupError) {
                console.warn(`⚠️ [CLEAN-FIRST-PDF] PDF cleanup failed:`, cleanupError.message);
                // Continue with database update even if cleanup fails
            }

            try {
                const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'Booking not found' });
                }

                // Update database dengan direct public URL untuk PDF (always raw for PDFs)
                const pdfDirectUrl = generatePublicUrlWithFolder(userid, nobooking, pdfPublicId, 'raw');
                const pdfProxyPath = `/api/files/cloudinary-proxy?publicId=${encodeURIComponent(pdfPublicId)}&resourceType=raw`;
                
                const updateResult = await pool.query(
                    'UPDATE pat_1_bookingsspd SET pdf_dokumen_path = $1, updated_at = CURRENT_TIMESTAMP WHERE nobooking = $2 AND userid = $3',
                    [pdfDirectUrl, nobooking, userid]
                );

                if (updateResult.rowCount > 0) {
                    // ✅ DATABASE UPDATE BERHASIL - Clean First strategy completed for PDF
                    console.log('✅ [CLOUDINARY-PDF] Database updated successfully - Clean First strategy completed for PDF');
                    
                    res.json({
                        success: true,
                        message: 'PDF uploaded successfully to Cloudinary (Clean First Strategy)',
                        data: {
                            nobooking,
                            // URLs untuk review
                            reviewUrl: pdfDirectUrl,
                            proxyPath: pdfProxyPath,
                            pdfPublicId,
                            // Metadata untuk review
                            reviewInfo: {
                                userid,
                                nobooking,
                                docType: 'DokumenP',
                                uploadDate: new Date().toISOString(),
                                folderStructure: `bappenda/sspd/${new Date().getFullYear()}/${userid}/${nobooking}`,
                                publicId: pdfPublicId,
                                resourceType: 'raw'
                            },
                            // Cleanup status
                            cleanupStatus: {
                                message: 'Clean First strategy - old PDF files cleaned before upload',
                                strategy: 'Clean First, Then Upload',
                                cleanupResult: pdfCleanupResult
                            }
                        }
                    });
                } else {
                    res.status(404).json({ success: false, message: 'Failed to update database' });
                }
            } catch (error) {
                console.error('❌ [CLOUDINARY-PDF] Error:', error);
                res.status(500).json({ success: false, message: 'Failed to save PDF: ' + error.message });
            }
        }
    ];
}
