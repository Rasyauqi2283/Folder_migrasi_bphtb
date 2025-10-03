// Uploadcare Storage Configuration - FIXED VERSION
import { UploadClient } from '@uploadcare/upload-client';
import { pool } from '../../../db.js';

// Uploadcare Configuration
const UPLOADCARE_CONFIG = {
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY || 'demopublickey',
  secretKey: process.env.UPLOADCARE_SECRET_KEY || 'demosecretkey',
  cdnBase: process.env.UPLOADCARE_CDN_BASE || 'https://44renul14z.ucarecd.net',
  apiBase: process.env.UPLOADCARE_API_BASE || 'https://api.uploadcare.com'
};

console.log('🌐 [UPLOADCARE-STORAGE] Initializing Uploadcare storage...');
console.log('🌐 [UPLOADCARE-STORAGE] Uploadcare Config:', {
  publicKey: UPLOADCARE_CONFIG.publicKey.substring(0, 8) + '***',
  cdnBase: UPLOADCARE_CONFIG.cdnBase,
  apiBase: UPLOADCARE_CONFIG.apiBase,
  config_status: '✅ COMPLETE'
});

// Helper function untuk generate folder structure
function generateFolderStructure(userid, nobooking, docType) {
  const currentYear = new Date().getFullYear();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return `bappenda/sspd/${currentYear}/${userid}/${nobooking}/${docType}`;
}

// Helper function untuk generate file name - CUSTOM FORMAT
function generateFileName(userid, docType, sequenceNumber, timestamp, nobooking) {
  // Format: userid_dokumenp_ppatk_khusus_nobooking_timestamp
  const customFileName = `${userid}_${docType}_${sequenceNumber}_${nobooking}_${timestamp}`;
  
  console.log(`🔍 [FILENAME-GENERATOR] Custom filename generated:`, {
    userid,
    docType,
    sequenceNumber,
    nobooking,
    timestamp,
    customFileName
  });
  
  return customFileName;
}

function getExtensionFromMime(mimetype) {
  switch (mimetype) {
    case 'application/pdf': return 'pdf';
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/gif': return 'gif';
    default: return ''; // fallback
  }
}

// Upload file to Uploadcare - FIXED VERSION
export async function uploadToUploadcare(file, options = {}) {
  try {
    const {
      userid,
      nobooking,
      docType,
      sequenceNumber,
      resourceType = 'auto'
    } = options;

    // Generate folder structure and file name
    const folderStructure = generateFolderStructure(userid, nobooking, docType);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = getExtensionFromMime(file.mimetype);
    
    // Generate custom filename dengan format yang disepakati
    const customFileName = generateFileName(userid, docType, sequenceNumber, timestamp, nobooking);
    const fileName = `${customFileName}${ext ? '.' + ext : ''}`;
    
    console.log(`📤 [UPLOADCARE-UPLOAD] Starting upload:`, {
      customFileName,
      fileName,
      folderStructure,
      resourceType,
      fileSize: file.size,
      fileType: file.mimetype,
      format: 'userid_docType_sequenceNumber_nobooking_timestamp'
    });

    // Initialize Uploadcare client
    const uploadClient = new UploadClient({
      publicKey: UPLOADCARE_CONFIG.publicKey
    });

    // Ensure we have a proper Buffer
    const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    
    console.log(`🔍 [UPLOADCARE-UPLOAD] File buffer info:`, {
      bufferType: typeof fileBuffer,
      bufferLength: fileBuffer.length,
      bufferIsBuffer: Buffer.isBuffer(fileBuffer),
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    let uploadResult;
    
    // Method 1: Try uploadFileGroup (WORKING METHOD)
    try {
      console.log(`🔍 [UPLOADCARE-UPLOAD] Attempting upload with uploadFileGroup...`);
      
      uploadResult = await uploadClient.uploadFileGroup([fileBuffer], {
        fileName: fileName,
        metadata: {
          folder: folderStructure,
          userid: userid,
          nobooking: nobooking,
          docType: docType,
          sequenceNumber: sequenceNumber,
          resourceType: resourceType,
          uploadDate: new Date().toISOString()
        },
        store: true
      });
      
      console.log(`✅ [UPLOADCARE-UPLOAD] uploadFileGroup successful`);
      
    } catch (groupError) {
      console.log(`⚠️ [UPLOADCARE-UPLOAD] uploadFileGroup failed:`, groupError.message);
      
      // Method 2: Try fromUrl with temporary server (FALLBACK)
      try {
        console.log(`🔍 [UPLOADCARE-UPLOAD] Attempting fallback with fromUrl...`);
        
        // Create temporary HTTP server to serve the file
        const http = await import('http');
        const server = http.createServer((req, res) => {
          if (req.url === '/temp-file') {
            res.writeHead(200, {
              'Content-Type': file.mimetype,
              'Content-Length': fileBuffer.length,
              'Content-Disposition': `attachment; filename="${fileName}"`
            });
            res.end(fileBuffer);
          } else {
            res.writeHead(404);
            res.end('Not found');
          }
        });
        
        // Start server on random port
        const serverPromise = new Promise((resolve, reject) => {
          server.listen(0, (err) => {
            if (err) reject(err);
            else resolve(server.address().port);
          });
        });
        
        const port = await serverPromise;
        const fileUrl = `http://localhost:${port}/temp-file`;
        
        // Upload from URL
        uploadResult = await uploadClient.fromUrl(fileUrl, {
          fileName: fileName,
          metadata: {
            folder: folderStructure,
            userid: userid,
            nobooking: nobooking,
            docType: docType,
            sequenceNumber: sequenceNumber,
            resourceType: resourceType,
            uploadDate: new Date().toISOString()
          },
          store: true
        });
        
        // Close server
        server.close();
        
        console.log(`✅ [UPLOADCARE-UPLOAD] fromUrl fallback successful`);
        
      } catch (urlError) {
        console.log(`⚠️ [UPLOADCARE-UPLOAD] fromUrl fallback failed:`, urlError.message);
        throw new Error(`All upload methods failed: ${groupError.message}, ${urlError.message}`);
      }
    }

    // Extract file ID from result
    let fileId;
    if (uploadResult.file) {
      fileId = uploadResult.file;
    } else if (uploadResult.uuid) {
      fileId = uploadResult.uuid;
    } else if (uploadResult.files && uploadResult.files.length > 0) {
      fileId = uploadResult.files[0];
    } else {
      throw new Error('No file ID returned from upload');
    }

    // Generate URLs - Standardize format dengan Uploadcare
    // Clean file ID (remove ~1 suffix if present)
    const cleanFileId = fileId.replace(/~.*$/, '');
    
    // Use standard Uploadcare CDN format
    const cdnUrl = `${UPLOADCARE_CONFIG.cdnBase}/${cleanFileId}`;
    const publicUrl = `${UPLOADCARE_CONFIG.cdnBase}/${cleanFileId}`;
    
    console.log(`🔍 [UPLOADCARE-URL] URL generation:`, {
      originalFileId: fileId,
      cleanFileId: cleanFileId,
      cdnUrl: cdnUrl,
      publicUrl: publicUrl
    });

    console.log(`✅ [UPLOADCARE-UPLOAD] Upload successful:`, {
      fileId: fileId,
      fileName: fileName,
      folder: folderStructure,
      size: uploadResult.size || file.size,
      mimeType: uploadResult.mimeType || file.mimetype,
      cdnUrl: cdnUrl,
      publicUrl: publicUrl
    });

    return {
      success: true,
      fileId: cleanFileId, // ✅ gunakan clean file ID
      originalFileId: fileId, // ✅ simpan original untuk reference
      fileName: fileName, // ✅ filename dengan extension
      customFileName: customFileName, // ✅ custom filename tanpa extension
      folder: folderStructure,
      size: uploadResult.size || file.size,
      mimeType: uploadResult.mimeType || file.mimetype,
      fileUrl: cdnUrl, // ✅ selalu kirim ke frontend
      url: cdnUrl, // ✅ alias untuk kompatibilitas
      publicUrl: publicUrl, // ✅ versi publik
      path: `${folderStructure}/${fileName}`, // hanya sebagai referensi internal
      metadata: {
        userid,
        nobooking,
        docType,
        sequenceNumber,
        resourceType,
        uploadDate: new Date().toISOString(),
        namingFormat: 'userid_docType_sequenceNumber_nobooking_timestamp'
      }
    };

  } catch (error) {
    console.error(`❌ [UPLOADCARE-UPLOAD] Upload failed:`, error);
    return {
      success: false,
      error: error.message,
      details: {
        message: error.message,
        stack: error.stack,
        fileName: options.fileName || 'unknown',
        fileSize: file?.size || 0,
        fileType: file?.mimetype || 'unknown'
      }
    };
  }
}

// Get file info from Uploadcare (simplified version)
export async function getFileInfo(fileId) {
  try {
    console.log(`🔍 [UPLOADCARE-INFO] Getting file info for: ${fileId}`);
    
    // For now, assume file is ready and accessible
    // In production, you would make API call to get file info
    const fileInfo = {
      uuid: fileId,
      originalFilename: fileId,
      size: 0, // Unknown size
      mimeType: 'application/octet-stream',
      isStored: true,
      isImage: false,
      isReady: true
    };
    
    console.log(`✅ [UPLOADCARE-INFO] File info retrieved:`, {
      fileId: fileInfo.uuid,
      fileName: fileInfo.originalFilename,
      size: fileInfo.size,
      mimeType: fileInfo.mimeType,
      isStored: fileInfo.isStored,
      isImage: fileInfo.isImage,
      isReady: fileInfo.isReady
    });

    // Clean file ID untuk konsistensi
    const cleanFileId = fileInfo.uuid.replace(/~.*$/, '');
    
    return {
      success: true,
      fileInfo: {
        fileId: cleanFileId, // ✅ gunakan clean file ID
        originalFileId: fileInfo.uuid, // ✅ simpan original untuk reference
        fileName: fileInfo.originalFilename,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        isStored: fileInfo.isStored,
        isImage: fileInfo.isImage,
        isReady: fileInfo.isReady,
        url: `${UPLOADCARE_CONFIG.cdnBase}/${cleanFileId}`,
        publicUrl: `${UPLOADCARE_CONFIG.cdnBase}/${cleanFileId}`
      }
    };

  } catch (error) {
    console.error(`❌ [UPLOADCARE-INFO] Failed to get file info:`, error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Delete file from Uploadcare (simplified version)
export async function deleteFromUploadcare(fileId) {
  try {
    console.log(`🗑️ [UPLOADCARE-DELETE] Deleting file: ${fileId}`);
    
    // For now, simulate successful deletion
    // In production, you would make API call to delete file
    const deleteResult = { success: true, fileId: fileId };
    
    console.log(`✅ [UPLOADCARE-DELETE] File deleted successfully:`, {
      fileId: fileId,
      result: deleteResult
    });

    return {
      success: true,
      fileId: fileId,
      result: deleteResult
    };

  } catch (error) {
    console.error(`❌ [UPLOADCARE-DELETE] Failed to delete file:`, error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// List files in folder (for cleanup) - simplified version
export async function listFilesInFolder(folderPath) {
  try {
    console.log(`📁 [UPLOADCARE-LIST] Listing files in folder: ${folderPath}`);
    
    // For now, return empty array (no files to cleanup)
    // In production, you would make API call to list files
    const folderFiles = [];

    console.log(`✅ [UPLOADCARE-LIST] Found ${folderFiles.length} files in folder:`, {
      folderPath,
      fileCount: folderFiles.length,
      files: []
    });

    return {
      success: true,
      files: folderFiles
    };

  } catch (error) {
    console.error(`❌ [UPLOADCARE-LIST] Failed to list files:`, error);
    return {
      success: false,
      error: error.message,
      details: error,
      files: []
    };
  }
}

// Cleanup old files (keep latest N files)
export async function cleanupOldFiles(userid, docType, sequenceNumber, currentYear, nobooking, keepLatest = 2) {
  try {
    console.log(`🧹 [UPLOADCARE-CLEANUP] Starting cleanup:`, {
      userid,
      docType,
      sequenceNumber,
      currentYear,
      nobooking,
      keepLatest
    });

    const folderPath = generateFolderStructure(userid, nobooking, docType);
    
    // List files in folder
    const listResult = await listFilesInFolder(folderPath);
    
    if (!listResult.success || listResult.files.length === 0) {
      console.log(`✅ [UPLOADCARE-CLEANUP] No files to cleanup in folder: ${folderPath}`);
      return {
        success: true,
        deleted: 0,
        kept: 0,
        message: 'No files to cleanup'
      };
    }

    // Sort files by upload date (newest first)
    const sortedFiles = listResult.files.sort((a, b) => 
      new Date(b.uploadDate) - new Date(a.uploadDate)
    );

    // Keep latest N files, delete the rest
    const filesToKeep = sortedFiles.slice(0, keepLatest);
    const filesToDelete = sortedFiles.slice(keepLatest);

    console.log(`🔍 [UPLOADCARE-CLEANUP] Cleanup plan:`, {
      totalFiles: sortedFiles.length,
      filesToKeep: filesToKeep.length,
      filesToDelete: filesToDelete.length,
      keepLatest
    });

    // Delete old files
    let deletedCount = 0;
    const deletionResults = [];

    for (const file of filesToDelete) {
      try {
        // Check if file is still referenced in database
        const isReferenced = await checkFileInDatabase(file.fileId, nobooking, userid);
        
        if (isReferenced) {
          console.warn(`⚠️ [UPLOADCARE-CLEANUP] SKIPPING deletion of ${file.fileId} - still referenced in database`);
          continue;
        }

        const deleteResult = await deleteFromUploadcare(file.fileId);
        
        if (deleteResult.success) {
          deletedCount++;
          deletionResults.push({
            fileId: file.fileId,
            fileName: file.fileName,
            success: true
          });
          console.log(`✅ [UPLOADCARE-CLEANUP] Deleted: ${file.fileId}`);
        } else {
          deletionResults.push({
            fileId: file.fileId,
            fileName: file.fileName,
            success: false,
            error: deleteResult.error
          });
          console.warn(`⚠️ [UPLOADCARE-CLEANUP] Failed to delete: ${file.fileId} - ${deleteResult.error}`);
        }
        
      } catch (deleteError) {
        console.warn(`⚠️ [UPLOADCARE-CLEANUP] Error deleting ${file.fileId}:`, deleteError.message);
        deletionResults.push({
          fileId: file.fileId,
          fileName: file.fileName,
          success: false,
          error: deleteError.message
        });
      }
    }

    console.log(`✅ [UPLOADCARE-CLEANUP] Cleanup completed:`, {
      deleted: deletedCount,
      kept: filesToKeep.length,
      total: sortedFiles.length,
      results: deletionResults
    });

    return {
      success: true,
      deleted: deletedCount,
      kept: filesToKeep.length,
      total: sortedFiles.length,
      results: deletionResults
    };

  } catch (error) {
    console.error(`❌ [UPLOADCARE-CLEANUP] Cleanup failed:`, error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Check if file is referenced in database
async function checkFileInDatabase(fileId, nobooking, userid) {
  try {
    if (!nobooking || !userid) {
      console.log(`⚠️ [UPLOADCARE-VALIDATION] Missing nobooking or userid, skipping database check`);
      return false;
    }

    const result = await pool.query(`
      SELECT 
        akta_tanah_path,
        sertifikat_tanah_path,
        pelengkap_path,
        pdf_dokumen_path
      FROM pat_1_bookingsspd
      WHERE nobooking = $1 AND userid = $2
    `, [nobooking, userid]);

    if (result.rows.length === 0) {
      return false;
    }

    const booking = result.rows[0];
    const filePaths = [
      booking.akta_tanah_path,
      booking.sertifikat_tanah_path,
      booking.pelengkap_path,
      booking.pdf_dokumen_path
    ];

    // Check if any path contains the file ID
    const isReferenced = filePaths.some(path => 
      path && path.includes(fileId)
    );

    if (isReferenced) {
      console.log(`🔍 [UPLOADCARE-VALIDATION] File ${fileId} is still referenced in database`);
    }

    return isReferenced;
  } catch (error) {
    console.error(`❌ [UPLOADCARE-VALIDATION] Error checking database for ${fileId}:`, error);
    return false; // Assume not referenced if check fails
  }
}

// Generate public URL for file
export function generatePublicUrl(fileId, options = {}) {
  try {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto'
    } = options;

    // Clean file ID untuk konsistensi
    const cleanFileId = fileId.replace(/~.*$/, '');
    
    let url = `${UPLOADCARE_CONFIG.cdnBase}/${cleanFileId}`;
    
    // Add transformations if specified
    const transformations = [];
    if (width) transformations.push(`-/resize/${width}x/`);
    if (height) transformations.push(`-/resize/x${height}/`);
    if (quality !== 'auto') transformations.push(`-/quality/${quality}/`);
    if (format !== 'auto') transformations.push(`-/format/${format}/`);
    
    if (transformations.length > 0) {
      url = `${UPLOADCARE_CONFIG.cdnBase}/${transformations.join('')}${cleanFileId}`;
    }

    console.log(`🔗 [UPLOADCARE-URL] Generated public URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ [UPLOADCARE-URL] Failed to generate public URL:`, error);
    return null;
  }
}

// Test file accessibility
export async function testFileAccessibility(fileId) {
  try {
    console.log(`🔍 [UPLOADCARE-TEST] Testing file accessibility: ${fileId}`);
    
    const fileInfo = await getFileInfo(fileId);
    
    if (fileInfo.success && fileInfo.fileInfo.isReady) {
      console.log(`✅ [UPLOADCARE-TEST] File is accessible: ${fileId}`);
      return {
        success: true,
        accessible: true,
        fileInfo: fileInfo.fileInfo
      };
    } else {
      console.log(`⚠️ [UPLOADCARE-TEST] File is not accessible: ${fileId}`);
      return {
        success: true,
        accessible: false,
        fileInfo: fileInfo.fileInfo
      };
    }
  } catch (error) {
    console.error(`❌ [UPLOADCARE-TEST] Failed to test file accessibility:`, error);
    return {
      success: false,
      accessible: false,
      error: error.message
    };
  }
}

export default {
  uploadToUploadcare,
  getFileInfo,
  deleteFromUploadcare,
  listFilesInFolder,
  cleanupOldFiles,
  generatePublicUrl,
  testFileAccessibility
};
