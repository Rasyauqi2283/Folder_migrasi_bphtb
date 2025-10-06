// /backend/routesxcontroller/5_PPAT_endpoint/uploadcare_ppat.js
// Uploadcare PPAT Upload Handler
import multer from 'multer';
import { 
  uploadToUploadcare, 
  getFileInfo, 
  cleanupOldFiles, 
  generatePublicUrl,
  testFileAccessibility 
} from '../../config/uploads/uploadcare_storage.js';
import { pool } from '../../../db.js';

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// Create Uploadcare upload handler
export function createUploadcareUploadHandler() {
  return async (req, res) => {
    try {
      console.log('📤 [UPLOADCARE-UPLOAD] Starting upload process...');
      
      // Check authentication
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      const userid = req.session.user.userid;
      console.log('📤 [UPLOADCARE-UPLOAD] Request body:', {
        nobooking: req.body.nobooking,
        userid: userid,
        files: Object.keys(req.files || {})
      });

      const { nobooking } = req.body;

      if (!nobooking) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: nobooking'
        });
      }

      // Check if booking exists
      const bookingResult = await pool.query(
        'SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2',
        [nobooking, userid]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      const uploadedFiles = {};
      const uploadResults = [];

      // Process each uploaded file
      for (const [fieldName, fileArray] of Object.entries(req.files)) {
        if (!Array.isArray(fileArray)) continue;
        
        for (const file of fileArray) {
          console.log(`📁 [UPLOADCARE-UPLOAD] Processing file: ${fieldName}`, {
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });

          // Determine document type and resource type
          let docType, resourceType;
          switch (fieldName) {
            case 'aktaTanah':
              docType = 'Akta';
              resourceType = 'raw'; // PDF
              break;
            case 'sertifikatTanah':
              docType = 'Sertifikat';
              resourceType = 'raw'; // PDF
              break;
            case 'pelengkap':
              docType = 'Pelengkap';
              resourceType = 'image'; // Image
              break;
            default:
              docType = 'Unknown';
              resourceType = 'auto';
          }

          // Extract sequence number from nobooking
          const parts = nobooking.split('-');
          const sequenceNumber = parts.length >= 3 ? parts[2] : '000001';

          // 🧹 CLEAN FIRST STRATEGY: Clean old files BEFORE upload
          console.log(`🧹 [UPLOADCARE-CLEANUP] Starting cleanup for ${fieldName} before upload...`);
          
          try {
            const cleanupResult = await cleanupOldFiles(
              userid,
              docType,
              sequenceNumber,
              new Date().getFullYear(),
              nobooking,
              1 // Keep only 1 file (aggressive cleanup)
            );
            
            console.log(`✅ [UPLOADCARE-CLEANUP] Cleanup completed for ${fieldName}:`, cleanupResult);
            uploadedFiles[fieldName] = { cleanup_result: cleanupResult };
            
          } catch (cleanupError) {
            console.warn(`⚠️ [UPLOADCARE-CLEANUP] Cleanup failed for ${fieldName}:`, cleanupError.message);
            uploadedFiles[fieldName] = { cleanup_error: cleanupError.message };
          }

          // Upload file to Uploadcare
          // Convert multer file object to proper format for Uploadcare
          const fileForUpload = {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          };
          
          const uploadResult = await uploadToUploadcare(fileForUpload, {
            userid,
            nobooking,
            docType,
            sequenceNumber,
            resourceType
          });

          if (uploadResult.success) {
            console.log(`✅ [UPLOADCARE-UPLOAD] Upload successful for ${fieldName}:`, {
              fileId: uploadResult.fileId,
              fileName: uploadResult.fileName,
              url: uploadResult.url
            });

            // Test file accessibility
            const testResult = await testFileAccessibility(uploadResult.fileId);
            
            if (testResult.success && testResult.accessible) {
              console.log(`✅ [UPLOADCARE-UPLOAD] File accessibility confirmed for ${fieldName}`);
              
              uploadedFiles[fieldName] = {
                ...uploadedFiles[fieldName],
                success: true,
                fileId: uploadResult.fileId,
                fileName: uploadResult.fileName,
                fileUrl: uploadResult.fileUrl,
                url: uploadResult.url,
                publicUrl: uploadResult.publicUrl,
                size: uploadResult.size,
                mimeType: uploadResult.mimeType,
                accessibility: testResult
              };

              uploadResults.push({
                field: fieldName,
                success: true,
                fileId: uploadResult.fileId,
                fileName: uploadResult.fileName
              });

            } else {
              console.warn(`⚠️ [UPLOADCARE-UPLOAD] File accessibility test failed for ${fieldName}`);
              uploadedFiles[fieldName] = {
                ...uploadedFiles[fieldName],
                success: false,
                error: 'File accessibility test failed',
                fileId: uploadResult.fileId
              };

              uploadResults.push({
                field: fieldName,
                success: false,
                error: 'File accessibility test failed'
              });
            }

          } else {
            console.error(`❌ [UPLOADCARE-UPLOAD] Upload failed for ${fieldName}:`, uploadResult.error);
            uploadedFiles[fieldName] = {
              ...uploadedFiles[fieldName],
              success: false,
              error: uploadResult.error
            };

            uploadResults.push({
              field: fieldName,
              success: false,
              error: uploadResult.error
            });
          }
        }
      }

      // Update database with new file URLs (use cdnUrl for frontend access)
      const aktaTanahUrl = uploadedFiles.aktaTanah?.fileUrl || uploadedFiles.aktaTanah?.url || null;
      const sertifikatTanahUrl = uploadedFiles.sertifikatTanah?.fileUrl || uploadedFiles.sertifikatTanah?.url || null;
      const pelengkapUrl = uploadedFiles.pelengkap?.fileUrl || uploadedFiles.pelengkap?.url || null;

      console.log('💾 [UPLOADCARE-UPLOAD] Updating database with new URLs:', {
        aktaTanah: aktaTanahUrl,
        sertifikatTanah: sertifikatTanahUrl,
        pelengkap: pelengkapUrl
      });

      const updateResult = await pool.query(
        `UPDATE pat_1_bookingsspd 
         SET akta_tanah_path = $1, 
             akta_tanah_file_id = $2,
             akta_tanah_mime_type = $3,
             akta_tanah_size = $4,
             sertifikat_tanah_path = $5, 
             sertifikat_tanah_file_id = $6,
             sertifikat_tanah_mime_type = $7,
             sertifikat_tanah_size = $8,
             pelengkap_path = $9,
             pelengkap_file_id = $10,
             pelengkap_mime_type = $11,
             pelengkap_size = $12,
             updated_at = CURRENT_TIMESTAMP
         WHERE nobooking = $13 AND userid = $14`,
        [
          aktaTanahUrl, 
          uploadedFiles.aktaTanah?.fileId || null,
          uploadedFiles.aktaTanah?.mimeType || null,
          uploadedFiles.aktaTanah?.size || null,
          sertifikatTanahUrl, 
          uploadedFiles.sertifikatTanah?.fileId || null,
          uploadedFiles.sertifikatTanah?.mimeType || null,
          uploadedFiles.sertifikatTanah?.size || null,
          pelengkapUrl,
          uploadedFiles.pelengkap?.fileId || null,
          uploadedFiles.pelengkap?.mimeType || null,
          uploadedFiles.pelengkap?.size || null,
          nobooking, 
          userid
        ]
      );

      if (updateResult.rowCount > 0) {
        console.log('✅ [UPLOADCARE-UPLOAD] Database updated successfully - Clean First strategy completed');
        
        res.json({
          success: true,
          message: 'Files uploaded successfully to Uploadcare (Clean First Strategy)',
          data: {
            nobooking,
            uploadedFiles: Object.keys(uploadedFiles),
            // URLs untuk review (menggunakan cdnUrl)
            reviewUrls: {
              aktaTanah: uploadedFiles.aktaTanah?.fileUrl || uploadedFiles.aktaTanah?.url,
              sertifikatTanah: uploadedFiles.sertifikatTanah?.fileUrl || uploadedFiles.sertifikatTanah?.url,
              pelengkap: uploadedFiles.pelengkap?.fileUrl || uploadedFiles.pelengkap?.url
            },
            // File details untuk frontend preview
            fileDetails: {
              aktaTanah: uploadedFiles.aktaTanah ? {
                fileId: uploadedFiles.aktaTanah.fileId,
                fileName: uploadedFiles.aktaTanah.fileName,
                fileUrl: uploadedFiles.aktaTanah.fileUrl || uploadedFiles.aktaTanah.url,
                mimeType: uploadedFiles.aktaTanah.mimeType,
                size: uploadedFiles.aktaTanah.size
              } : null,
              sertifikatTanah: uploadedFiles.sertifikatTanah ? {
                fileId: uploadedFiles.sertifikatTanah.fileId,
                fileName: uploadedFiles.sertifikatTanah.fileName,
                fileUrl: uploadedFiles.sertifikatTanah.fileUrl || uploadedFiles.sertifikatTanah.url,
                mimeType: uploadedFiles.sertifikatTanah.mimeType,
                size: uploadedFiles.sertifikatTanah.size
              } : null,
              pelengkap: uploadedFiles.pelengkap ? {
                fileId: uploadedFiles.pelengkap.fileId,
                fileName: uploadedFiles.pelengkap.fileName,
                fileUrl: uploadedFiles.pelengkap.fileUrl || uploadedFiles.pelengkap.url,
                mimeType: uploadedFiles.pelengkap.mimeType,
                size: uploadedFiles.pelengkap.size
              } : null
            },
            // Metadata untuk review
            reviewInfo: {
              userid,
              uploadDate: new Date().toISOString(),
              folderStructure: `bappenda/sspd/${new Date().getFullYear()}/${userid}/${nobooking}`,
              files: Object.values(uploadedFiles)
                .filter(file => file.success)
                .map(file => ({
                  fileId: file.fileId,
                  fileName: file.fileName,
                  size: file.size,
                  mimeType: file.mimeType
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
            },
            // Upload results
            uploadResults: uploadResults
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Failed to update database'
        });
      }

    } catch (error) {
      console.error('❌ [UPLOADCARE-UPLOAD] Upload failed:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed: ' + error.message,
        details: {
          error: error.message,
          stack: error.stack
        }
      });
    }
  };
}

// Create Uploadcare PDF upload handler
export function createUploadcarePDFUploadHandler() {
  return async (req, res) => {
    try {
      console.log('📤 [UPLOADCARE-PDF] Starting PDF upload process...');
      
      // Check authentication
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      const userid = req.session.user.userid;
      const { nobooking } = req.body;

      if (!nobooking) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: nobooking'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No PDF file provided'
        });
      }

      console.log('📁 [UPLOADCARE-PDF] Processing PDF file:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Extract sequence number from nobooking
      const parts = nobooking.split('-');
      const sequenceNumber = parts.length >= 3 ? parts[2] : '000001';

      // 🧹 CLEAN FIRST STRATEGY: Clean old PDF files BEFORE upload
      console.log('🧹 [UPLOADCARE-PDF-CLEANUP] Starting PDF cleanup before upload...');
      
      let pdfCleanupResult = null;
      try {
        pdfCleanupResult = await cleanupOldFiles(
          userid,
          'DokumenP',
          sequenceNumber,
          new Date().getFullYear(),
          nobooking,
          1 // Keep only 1 file (aggressive cleanup)
        );
        
        console.log(`✅ [UPLOADCARE-PDF-CLEANUP] PDF cleanup completed:`, pdfCleanupResult);
      } catch (cleanupError) {
        console.warn(`⚠️ [UPLOADCARE-PDF-CLEANUP] PDF cleanup failed:`, cleanupError.message);
      }

      
      // Upload PDF to Uploadcare
      // Convert multer file object to proper format for Uploadcare
      const fileForUpload = {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
      
      const uploadResult = await uploadToUploadcare(fileForUpload, {
        userid,
        nobooking,
        docType: 'DokumenP',
        sequenceNumber,
        resourceType: 'raw'
      });

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: `PDF upload failed: ${uploadResult.error}`,
          details: uploadResult
        });
      }

      console.log(`✅ [UPLOADCARE-PDF] PDF upload successful:`, {
        fileId: uploadResult.fileId,
        fileName: uploadResult.fileName,
        url: uploadResult.url
      });

      // Test PDF accessibility
      const testResult = await testFileAccessibility(uploadResult.fileId);
      
      if (!testResult.success || !testResult.accessible) {
        console.warn(`⚠️ [UPLOADCARE-PDF] PDF accessibility test failed`);
        return res.status(500).json({
          success: false,
          message: 'PDF file accessibility test failed',
          details: testResult
        });
      }

      console.log(`✅ [UPLOADCARE-PDF] PDF accessibility confirmed`);

      // Update database with complete metadata
      const updateResult = await pool.query(
        `UPDATE pat_1_bookingsspd 
         SET pdf_dokumen_path = $1, 
             pdf_dokumen_file_id = $2,
             pdf_dokumen_mime_type = $3,
             pdf_dokumen_size = $4,
             updated_at = CURRENT_TIMESTAMP 
         WHERE nobooking = $5 AND userid = $6`,
        [
          uploadResult.fileUrl,  // Gunakan fileUrl (cdnUrl) bukan publicUrl
          uploadResult.fileId,
          uploadResult.mimeType,
          uploadResult.size,
          nobooking, 
          userid
        ]
      );

      if (updateResult.rowCount > 0) {
        console.log('✅ [UPLOADCARE-PDF] Database updated successfully - Clean First strategy completed for PDF');
        
        res.json({
          success: true,
          message: 'PDF uploaded successfully to Uploadcare (Clean First Strategy)',
          data: {
            nobooking,
            // URLs untuk review
            reviewUrl: uploadResult.fileUrl,
            fileId: uploadResult.fileId,
            // Metadata untuk review
            reviewInfo: {
              userid,
              nobooking,
              docType: 'DokumenP',
              uploadDate: new Date().toISOString(),
              folderStructure: `bappenda/sspd/${new Date().getFullYear()}/${userid}/${nobooking}`,
              fileId: uploadResult.fileId,
              fileName: uploadResult.fileName,
              size: uploadResult.size,
              mimeType: uploadResult.mimeType
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
        res.status(404).json({
          success: false,
          message: 'Failed to update database'
        });
      }

    } catch (error) {
      console.error('❌ [UPLOADCARE-PDF] PDF upload failed:', error);
      res.status(500).json({
        success: false,
        message: 'PDF upload failed: ' + error.message,
        details: {
          error: error.message,
          stack: error.stack
        }
      });
    }
  };
}

// Create Uploadcare proxy endpoint
export function createUploadcareProxyEndpoint() {
  return async (req, res) => {
    try {
      // Check authentication
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { fileId, fileUrl, width, height, quality, format } = req.query;

      let targetFileId = fileId;
      
      // If fileUrl is provided, extract fileId from it
      if (fileUrl && !fileId) {
        if (fileUrl.includes('ucarecdn.com/') || fileUrl.includes('ucarecd.net/')) {
          // Extract fileId from URL like https://ucarecdn.com/fileId/ or https://44renul14z.ucarecd.net/fileId
          const urlParts = fileUrl.split('ucarecdn.com/').length > 1 
            ? fileUrl.split('ucarecdn.com/')
            : fileUrl.split('ucarecd.net/');
          if (urlParts.length > 1) {
            targetFileId = urlParts[1].split('/')[0].split('?')[0];
          }
        }
      }

      if (!targetFileId) {
        return res.status(400).json({
          success: false,
          message: 'Missing fileId parameter or invalid fileUrl'
        });
      }

      console.log(`🔗 [UPLOADCARE-PROXY] Proxying file request:`, {
        fileId: targetFileId,
        fileUrl,
        width,
        height,
        quality,
        format
      });

      // Generate public URL with transformations
      const publicUrl = generatePublicUrl(targetFileId, {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality: quality || 'auto',
        format: format || 'auto'
      });

      if (!publicUrl) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate public URL'
        });
      }

      // Instead of redirecting, stream the file content to avoid sandbox issues
      console.log(`📤 [UPLOADCARE-PROXY] Streaming file from: ${publicUrl}`);
      
      try {
        const axios = await import('axios');
        const response = await axios.default.get(publicUrl, {
          responseType: 'stream',
          timeout: 30000,
          headers: {
            'User-Agent': 'Bappenda-PPAT-Proxy/1.0'
          }
        });

        // Set appropriate headers for the file
        res.set({
          'Content-Type': response.headers['content-type'] || 'application/octet-stream',
          'Content-Length': response.headers['content-length'],
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': req.headers.origin || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Pipe the response stream to client
        response.data.pipe(res);

        console.log(`✅ [UPLOADCARE-PROXY] File streamed successfully: ${publicUrl}`);

      } catch (streamError) {
        console.error('❌ [UPLOADCARE-PROXY] Stream failed:', streamError.message);
        
        // Check if it's a 404 error (file not found)
        if (streamError.response && streamError.response.status === 404) {
          console.log('🔍 [UPLOADCARE-PROXY] File not found in Uploadcare CDN');
          return res.status(404).json({
            success: false,
            message: 'File not found in Uploadcare CDN',
            fileId: targetFileId,
            fileUrl: fileUrl
          });
        }
        
        // Return error instead of redirect to avoid CORS issues
        return res.status(500).json({
          success: false,
          message: 'Failed to stream file: ' + streamError.message,
          fileId: targetFileId,
          fileUrl: fileUrl
        });
      }

    } catch (error) {
      console.error('❌ [UPLOADCARE-PROXY] Proxy failed:', error);
      res.status(500).json({
        success: false,
        message: 'Proxy failed: ' + error.message
      });
    }
  };
}
// Export multer middleware
export { upload };
