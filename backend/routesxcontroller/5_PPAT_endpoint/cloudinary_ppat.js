import express from 'express';
import axios from 'axios';
import { pool } from '../../../db.js';
import { cleanupOldFiles, generateSignedUrl } from '../../config/uploads/cloudinary_storage.js';

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
            console.log('🌐 [CLOUDINARY-PROXY] Request received:', {
                method: req.method,
                url: req.url,
                query: req.query,
                timestamp: new Date().toISOString()
            });

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
                console.log('🔄 [CLOUDINARY-PROXY] Validating publicId exists on Cloudinary:', publicId);
                
                // Quick validation: check if file exists before generating signed URL
                try {
                    const validationUrl = generateSignedUrlParam(publicId, 60, resourceType);
                    const validationResponse = await axios.head(validationUrl, { 
                        timeout: 5000,
                        validateStatus: (status) => status < 500 // Accept 404 but not 5xx
                    });
                    
                    if (validationResponse.status !== 200) {
                        console.error('❌ [CLOUDINARY-PROXY] File validation failed:', {
                            publicId,
                            resourceType,
                            status: validationResponse.status,
                            cldError: validationResponse.headers['x-cld-error']
                        });
                        
                        return res.status(404).json({
                            error: "File not found on Cloudinary",
                            details: validationResponse.headers['x-cld-error'] || 'File does not exist',
                            publicId: publicId,
                            resourceType: resourceType,
                            suggestion: "File may have been deleted or never uploaded successfully"
                        });
                    }
                    
                    console.log('✅ [CLOUDINARY-PROXY] File validation passed, generating signed URL');
                    cloudinaryUrl = generateSignedUrlParam(publicId, 3600, resourceType); // 1 hour validity with resource type
                    
                } catch (validationError) {
                    console.error('❌ [CLOUDINARY-PROXY] File validation error:', validationError.message);
                    
                    if (validationError.response?.status === 404) {
                        return res.status(404).json({
                            error: "File not found on Cloudinary",
                            details: validationError.response.headers['x-cld-error'] || 'File does not exist',
                            publicId: publicId,
                            resourceType: resourceType,
                            suggestion: "File may have been deleted or never uploaded successfully"
                        });
                    }
                    
                    return res.status(500).json({
                        error: "Failed to validate file on Cloudinary",
                        details: validationError.message,
                        publicId: publicId
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

            // Reduced logging to avoid Railway rate limits
            console.log('🌐 [CLOUDINARY-PROXY] Serving:', publicId || 'unknown');

            // Enhanced Cloudinary request with better error handling
            console.log('🌐 [CLOUDINARY-PROXY] Making request to Cloudinary:', {
                url: cloudinaryUrl,
                publicId: publicId,
                resourceType: resourceType,
                timestamp: new Date().toISOString()
            });

            // Retry logic for Cloudinary requests
            let response;
            let lastError;
            const maxRetries = 3;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🌐 [CLOUDINARY-PROXY] Attempt ${attempt}/${maxRetries} to fetch from Cloudinary`);
                    
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
                    console.log(`✅ [CLOUDINARY-PROXY] Successfully fetched from Cloudinary on attempt ${attempt}`);
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
                    console.log(`⏳ [CLOUDINARY-PROXY] Waiting ${waitTime}ms before retry...`);
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
            
            console.log('🔄 [REFRESH-SIGNED-URL] Refreshing signed URL for:', publicId);
            
            // Generate fresh signed URL
                const signedUrl = generateSignedUrlParam(publicId, 3600); // 1 hour validity
            
            res.json({
                success: true,
                publicId: publicId,
                signedUrl: signedUrl,
                expiresIn: 3600
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
            console.log('🌐 [CLOUDINARY-ENDPOINT] Starting file upload process...');
            console.log('🌐 [CLOUDINARY-ENDPOINT] Railway deployment info:', {
              RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
              RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
              NODE_ENV: process.env.NODE_ENV || 'development',
              timestamp: new Date().toISOString(),
              endpoint: '/api/ppatk_upload-cloudinary'
            });
            console.log('🌐 [CLOUDINARY-ENDPOINT] Request info:', {
              method: req.method,
              url: req.url,
              headers: {
                'content-type': req.headers['content-type'],
                'user-agent': req.headers['user-agent'],
                'content-length': req.headers['content-length']
              },
              hasSession: !!req.session,
              hasUser: !!req.session?.user,
              userid: req.session?.user?.userid || 'no-session'
            });
            
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
              
              console.log('✅ [CLOUDINARY-ENDPOINT] Files uploaded successfully:', {
                files: req.files,
                railway_context: {
                  RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
                  RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
                  timestamp: new Date().toISOString()
                }
              });
              next();
            });
        },
        
        // Main upload handler
        async (req, res) => {
            try {
                console.log('🔍 [CLOUDINARY-ENDPOINT] Main handler started:', {
                    hasSession: !!req.session,
                    hasUser: !!req.session?.user,
                    userid: req.session?.user?.userid,
                    hasFiles: !!req.files,
                    filesKeys: req.files ? Object.keys(req.files) : [],
                    bodyKeys: Object.keys(req.body),
                    timestamp: new Date().toISOString()
                });

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
                        
                        console.log(`📁 [CLOUDINARY] File uploaded:`, {
                            field: fieldName,
                            filename: file.filename,
                            cloudinaryUrl: file.path,
                            mimetype: file.mimetype,
                            isPdf: isPdf,
                            // Log all available properties from Cloudinary response
                            allFileProperties: Object.keys(file),
                            fileObject: file
                        });

                        // Extract public_id from Cloudinary URL
                        // Try multiple possible properties from Cloudinary response
                        let publicId = file.public_id || 
                                      file.publicId || 
                                      file.publicid || 
                                      extractPublicIdFromUrl(file.path);
                        
                        console.log('🔍 [CLOUDINARY-UPLOAD] PublicId extraction attempt:', {
                            filePublicId: file.public_id,
                            filePublicIdType: typeof file.public_id,
                            filePublicIdValue: file.public_id,
                            extractedFromUrl: extractPublicIdFromUrl(file.path),
                            filePath: file.path,
                            allFileKeys: Object.keys(file)
                        });
                        
                        // If still no publicId, try to extract from URL path
                        if (!publicId || publicId === 'null') {
                            // Extract from URL: https://res.cloudinary.com/cloud/raw/upload/v123/folder/public_id.ext
                            const urlMatch = file.path.match(/\/upload\/(?:v\d+\/)?(.+)$/);
                            if (urlMatch) {
                                publicId = urlMatch[1].replace(/\.\w+$/, '');
                                console.log('🔄 [CLOUDINARY-UPLOAD] Extracted publicId from URL:', publicId);
                            }
                        }
                        
                        // Final fallback: Generate publicId based on expected format
                        if (!publicId || publicId === 'null') {
                            console.log('🔄 [CLOUDINARY-UPLOAD] Generating fallback publicId...');
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
                                console.log('🔄 [CLOUDINARY-UPLOAD] Generated fallback publicId:', publicId);
                            }
                        }
                        
                        console.log(`🔍 [CLOUDINARY-UPLOAD] File metadata for ${fieldName}:`, {
                            filePath: file.path,
                            filePublicId: file.public_id,
                            extractedPublicId: extractPublicIdFromUrl(file.path),
                            finalPublicId: publicId,
                            filename: file.filename,
                            mimetype: file.mimetype
                        });
                        
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
                        
                        // Validasi bahwa file benar-benar ada di Cloudinary sebelum menyimpan proxy path
                        console.log(`🔍 [CLOUDINARY-UPLOAD] Validating file existence for ${fieldName}:`, {
                            publicId: publicId,
                            resourceType: isPdf ? 'raw' : 'image',
                            cloudinaryUrl: file.path
                        });

                        // Test jika file bisa diakses dari Cloudinary
                        let fileExists = false;
                        try {
                            const testUrl = generateSignedUrl(publicId, 60, isPdf ? 'raw' : 'image');
                            const testResponse = await axios.head(testUrl, { 
                                timeout: 10000,
                                validateStatus: (status) => status < 500 // Accept 404 but not 5xx
                            });
                            fileExists = testResponse.status === 200;
                            console.log(`🔍 [CLOUDINARY-UPLOAD] File existence test for ${fieldName}:`, {
                                status: testResponse.status,
                                exists: fileExists
                            });
                        } catch (testError) {
                            console.warn(`⚠️ [CLOUDINARY-UPLOAD] File existence test failed for ${fieldName}:`, {
                                error: testError.message,
                                status: testError.response?.status
                            });
                            fileExists = false;
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
                        uploadedFiles[fieldName] = {
                            cloudinary_url: file.path.replace('http://', 'https://'), // Cloudinary URL (untuk internal)
                            proxy_path: `/api/files/cloudinary-proxy?publicId=${encodeURIComponent(publicId)}&resourceType=${resourceType}`, // Railway proxy URL dengan publicId dan resourceType
                            public_id: publicId, // Store public_id for fresh signed URL generation
                            filename: file.filename,
                            mimetype: file.mimetype,
                            size: file.size,
                            isPdf: isPdf,
                            resource_type: resourceType,
                            exists_on_cloudinary: fileExists
                        };

                        // Cleanup file lama setelah upload berhasil (background task)
                        try {
                            console.log(`🧹 [CLOUDINARY-UPLOAD] Starting cleanup for ${fieldName}...`);
                            
                            // Extract components untuk cleanup
                            const parts = publicId.split('_');
                            if (parts.length >= 5) {
                                const [userid, docType, sequenceNumber, currentYear] = parts;
                                
                                // Cleanup file lama (keep latest 2 files untuk safety)
                                const cleanupResult = await cleanupOldFiles(
                                    userid, 
                                    docType, 
                                    sequenceNumber, 
                                    currentYear, 
                                    resourceType, 
                                    2 // Keep latest 2 files
                                );
                                
                                console.log(`✅ [CLOUDINARY-UPLOAD] Cleanup completed for ${fieldName}:`, cleanupResult);
                                
                                // Add cleanup info to uploaded file metadata
                                uploadedFiles[fieldName].cleanup_result = cleanupResult;
                            }
                        } catch (cleanupError) {
                            console.warn(`⚠️ [CLOUDINARY-UPLOAD] Cleanup failed for ${fieldName}:`, cleanupError.message);
                            // Don't fail the upload if cleanup fails
                            uploadedFiles[fieldName].cleanup_error = cleanupError.message;
                        }
                    }
                }

                // Simpan Railway proxy URLs ke database (untuk user access)
                const aktaTanahUrl = uploadedFiles.aktaTanah?.proxy_path || null;
                const sertifikatTanahUrl = uploadedFiles.sertifikatTanah?.proxy_path || null;
                const pelengkapUrl = uploadedFiles.pelengkap?.proxy_path || null;

                console.log('💾 [CLOUDINARY-UPLOAD] Saving to database:', {
                    nobooking,
                    userid,
                    aktaTanahUrl,
                    sertifikatTanahUrl,
                    pelengkapUrl,
                    timestamp: new Date().toISOString()
                });

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
                    console.log('✅ [CLOUDINARY-UPLOAD] Files uploaded and saved successfully:', {
                        nobooking,
                        userid,
                        uploadedFiles: Object.keys(uploadedFiles),
                        railway_context: {
                            RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
                            RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
                            NODE_ENV: process.env.NODE_ENV || 'development',
                            nobooking: nobooking,
                            userid: userid,
                            timestamp: new Date().toISOString()
                        }
                    });
                    
                    res.json({
                        success: true,
                        message: 'Files uploaded successfully to Cloudinary',
                        data: {
                            nobooking,
                            uploadedFiles: Object.keys(uploadedFiles),
                            proxyUrls: {
                                aktaTanah: aktaTanahUrl,
                                sertifikatTanah: sertifikatTanahUrl,
                                pelengkap: pelengkapUrl
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
            console.log('🌐 [CLOUDINARY-PDF] Starting PDF upload process...');
            console.log('🌐 [CLOUDINARY-PDF] Railway deployment info:', {
                RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
                RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
                NODE_ENV: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString(),
                endpoint: '/api/ppatk_upload-pdf'
            });
            
            mixedCloudinaryUpload.single('pdfDokumen')(req, res, (err) => {
                if (err) {
                    console.error('❌ [CLOUDINARY-PDF] Upload error:', err);
                    return res.status(400).json({ 
                      success: false, 
                      message: err.message || 'Error uploading PDF file' 
                    });
                }
                
                console.log('PDF uploaded successfully:', req.file);
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
                    console.log('🔄 [CLOUDINARY-PDF] Extracted publicId from URL:', pdfPublicId);
                }
            }
            
            // Final fallback: Generate publicId based on expected format
            if (!pdfPublicId || pdfPublicId === 'null') {
                console.log('🔄 [CLOUDINARY-PDF] Generating fallback publicId...');
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
                    
                    pdfPublicId = `${userid}_DokumenP_${sequence}_${year}_${timestamp}`;
                    console.log('🔄 [CLOUDINARY-PDF] Generated fallback publicId:', pdfPublicId);
                }
            }
            
            console.log('🔍 [CLOUDINARY-PDF] PDF file metadata:', {
                filePath: req.file.path,
                pdfDokumenPath: pdfDokumenPath,
                filePublicId: req.file.public_id,
                extractedPublicId: extractPublicIdFromUrl(pdfDokumenPath),
                finalPublicId: pdfPublicId,
                filename: req.file.filename,
                mimetype: req.file.mimetype
            });
            
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

            try {
                const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'Booking not found' });
                }

                // Update database dengan proxy URL untuk PDF (always raw for PDFs)
                const pdfProxyPath = `/api/files/cloudinary-proxy?publicId=${encodeURIComponent(pdfPublicId)}&resourceType=raw`;
                
                const updateResult = await pool.query(
                    'UPDATE pat_1_bookingsspd SET pdf_dokumen_path = $1, updated_at = CURRENT_TIMESTAMP WHERE nobooking = $2 AND userid = $3',
                    [pdfProxyPath, nobooking, userid]
                );

                if (updateResult.rowCount > 0) {
                    console.log('✅ [CLOUDINARY-PDF] PDF uploaded and saved successfully:', {
                        nobooking,
                        userid,
                        pdfProxyPath,
                        pdfPublicId
                    });
                    
                    res.json({
                        success: true,
                        message: 'PDF uploaded successfully to Cloudinary',
                        data: {
                            nobooking,
                            pdfProxyPath,
                            pdfPublicId
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
