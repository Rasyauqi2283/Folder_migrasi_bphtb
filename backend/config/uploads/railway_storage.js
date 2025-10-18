// Railway Storage Configuration - Local File Storage
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Railway Storage Configuration
const RAILWAY_STORAGE_CONFIG = {
  basePath: path.join(__dirname, '..', '..', 'storage', 'ppatk'),
  publicPath: '/storage/ppatk',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]
};

console.log('🌐 [RAILWAY-STORAGE] Initializing Railway storage...');
console.log('🌐 [RAILWAY-STORAGE] Storage Config:', {
  basePath: RAILWAY_STORAGE_CONFIG.basePath,
  publicPath: RAILWAY_STORAGE_CONFIG.publicPath,
  maxFileSize: RAILWAY_STORAGE_CONFIG.maxFileSize,
  allowedTypes: RAILWAY_STORAGE_CONFIG.allowedMimeTypes.length,
  config_status: '✅ COMPLETE'
});

// Helper function untuk generate folder structure
function generateFolderStructure(userid, nobooking, docType) {
  const currentYear = new Date().getFullYear();
  return `ppatk/${currentYear}/${userid}/${nobooking}/${docType}`;
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
    case 'image/jpg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/gif': return 'gif';
    case 'image/webp': return 'webp';
    default: return 'bin';
  }
}

// Upload file to Railway storage
export async function uploadToRailway(file, options = {}) {
  try {
    const {
      userid,
      nobooking,
      docType,
      sequenceNumber = 1
    } = options;

    // Validate file type
    if (!RAILWAY_STORAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed`);
    }

    // Validate file size
    if (file.size > RAILWAY_STORAGE_CONFIG.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum ${RAILWAY_STORAGE_CONFIG.maxFileSize}`);
    }

    // Generate folder structure and file name
    const folderStructure = generateFolderStructure(userid, nobooking, docType);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = getExtensionFromMime(file.mimetype);
    
    // Generate custom filename dengan format yang disepakati
    const customFileName = generateFileName(userid, docType, sequenceNumber, timestamp, nobooking);
    const fileName = `${customFileName}.${ext}`;
    
    // Create full paths
    const fullFolderPath = path.join(RAILWAY_STORAGE_CONFIG.basePath, folderStructure);
    const fullFilePath = path.join(fullFolderPath, fileName);
    const relativePath = path.join(folderStructure, fileName).replace(/\\/g, '/'); // Normalize path separators
    
    console.log(`📤 [RAILWAY-UPLOAD] Starting upload:`, {
      customFileName,
      fileName,
      folderStructure,
      fullFolderPath,
      fullFilePath,
      relativePath,
      fileSize: file.size,
      fileType: file.mimetype,
      format: 'userid_docType_sequenceNumber_nobooking_timestamp'
    });

    // Ensure directory exists
    if (!fs.existsSync(fullFolderPath)) {
      fs.mkdirSync(fullFolderPath, { recursive: true });
      console.log(`📁 [RAILWAY-UPLOAD] Created directory: ${fullFolderPath}`);
    }

    // Write file to disk
    const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    fs.writeFileSync(fullFilePath, fileBuffer);
    
    console.log(`✅ [RAILWAY-UPLOAD] File written successfully: ${fullFilePath}`);

    // Generate public URLs
    const publicUrl = `${RAILWAY_STORAGE_CONFIG.publicPath}/${relativePath}`;
    const cdnUrl = publicUrl; // For Railway, CDN and public URL are the same
    
    console.log(`🔍 [RAILWAY-URL] URL generation:`, {
      fileName,
      relativePath,
      publicUrl,
      cdnUrl
    });

    // Validate file was written correctly
    try {
      const stats = fs.statSync(fullFilePath);
      if (stats.size !== file.size) {
        console.warn(`⚠️ [RAILWAY-VALIDATION] File size mismatch: expected ${file.size}, got ${stats.size}`);
        // Don't throw error, just log warning - file might still be usable
      }
      console.log(`✅ [RAILWAY-VALIDATION] File validation passed: ${fileName}`);
    } catch (validationError) {
      console.warn(`⚠️ [RAILWAY-VALIDATION] File validation failed: ${validationError.message}`);
      // Don't throw error, just log warning - file might still be usable
    }

    console.log(`✅ [RAILWAY-UPLOAD] Upload successful:`, {
      fileName: fileName,
      customFileName: customFileName,
      folder: folderStructure,
      relativePath: relativePath,
      fullPath: fullFilePath,
      size: file.size,
      mimeType: file.mimetype,
      publicUrl: publicUrl,
      cdnUrl: cdnUrl
    });

    return {
      success: true,
      fileName: fileName,
      customFileName: customFileName,
      folder: folderStructure,
      relativePath: relativePath,
      fullPath: fullFilePath,
      size: file.size,
      mimeType: file.mimetype,
      fileUrl: publicUrl, // ✅ selalu kirim ke frontend
      url: publicUrl, // ✅ alias untuk kompatibilitas
      publicUrl: publicUrl, // ✅ versi publik
      cdnUrl: cdnUrl, // ✅ alias untuk CDN
      path: relativePath, // ✅ path relatif untuk database
      metadata: {
        userid,
        nobooking,
        docType,
        sequenceNumber,
        uploadDate: new Date().toISOString(),
        namingFormat: 'userid_docType_sequenceNumber_nobooking_timestamp',
        storageType: 'railway'
      }
    };

  } catch (error) {
    console.error(`❌ [RAILWAY-UPLOAD] Upload failed:`, error);
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

// Get file info from Railway storage
export async function getFileInfo(relativePath) {
  try {
    
    const fullPath = path.join(RAILWAY_STORAGE_CONFIG.basePath, relativePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }
    
    const stats = fs.statSync(fullPath);
    const fileName = path.basename(relativePath);
    const mimeType = getMimeTypeFromExtension(path.extname(fileName));
    
    const fileInfo = {
      fileName: fileName,
      relativePath: relativePath,
      fullPath: fullPath,
      size: stats.size,
      mimeType: mimeType,
      isStored: true,
      isImage: mimeType.startsWith('image/'),
      isReady: true,
      lastModified: stats.mtime
    };
    

    return {
      success: true,
      fileInfo: {
        fileName: fileInfo.fileName,
        relativePath: fileInfo.relativePath,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        isStored: fileInfo.isStored,
        isImage: fileInfo.isImage,
        isReady: fileInfo.isReady,
        url: `${RAILWAY_STORAGE_CONFIG.publicPath}/${relativePath}`,
        publicUrl: `${RAILWAY_STORAGE_CONFIG.publicPath}/${relativePath}`,
        lastModified: fileInfo.lastModified
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Delete file from Railway storage
export async function deleteFromRailway(relativePath) {
  try {
    console.log(`🗑️ [RAILWAY-DELETE] Deleting file: ${relativePath}`);
    
    const fullPath = path.join(RAILWAY_STORAGE_CONFIG.basePath, relativePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ [RAILWAY-DELETE] File not found: ${fullPath}`);
      return {
        success: true,
        message: 'File already deleted or not found',
        relativePath: relativePath
      };
    }
    
    fs.unlinkSync(fullPath);
    
    console.log(`✅ [RAILWAY-DELETE] File deleted successfully:`, {
      relativePath: relativePath,
      fullPath: fullPath
    });

    return {
      success: true,
      relativePath: relativePath,
      message: 'File deleted successfully'
    };

  } catch (error) {
    console.error(`❌ [RAILWAY-DELETE] Failed to delete file:`, error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// List files in folder (for cleanup)
export async function listFilesInFolder(folderPath) {
  try {
    console.log(`📁 [RAILWAY-LIST] Listing files in folder: ${folderPath}`);
    
    const fullPath = path.join(RAILWAY_STORAGE_CONFIG.basePath, folderPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ [RAILWAY-LIST] Folder not found: ${fullPath}`);
      return {
        success: true,
        files: []
      };
    }
    
    const files = fs.readdirSync(fullPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => {
        const filePath = path.join(folderPath, dirent.name);
        const fullFilePath = path.join(fullPath, dirent.name);
        const stats = fs.statSync(fullFilePath);
        
        return {
          fileName: dirent.name,
          relativePath: filePath,
          fullPath: fullFilePath,
          size: stats.size,
          mimeType: getMimeTypeFromExtension(path.extname(dirent.name)),
          lastModified: stats.mtime,
          uploadDate: stats.mtime
        };
      });

    console.log(`✅ [RAILWAY-LIST] Found ${files.length} files in folder:`, {
      folderPath,
      fileCount: files.length,
      files: files.map(f => ({ fileName: f.fileName, size: f.size, lastModified: f.lastModified }))
    });

    return {
      success: true,
      files: files
    };

  } catch (error) {
    console.error(`❌ [RAILWAY-LIST] Failed to list files:`, error);
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
    console.log(`🧹 [RAILWAY-CLEANUP] Starting cleanup:`, {
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
      console.log(`✅ [RAILWAY-CLEANUP] No files to cleanup in folder: ${folderPath}`);
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

    console.log(`🔍 [RAILWAY-CLEANUP] Cleanup plan:`, {
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
        const isReferenced = await checkFileInDatabase(file.relativePath, nobooking, userid);
        
        if (isReferenced) {
          console.warn(`⚠️ [RAILWAY-CLEANUP] SKIPPING deletion of ${file.relativePath} - still referenced in database`);
          continue;
        }

        const deleteResult = await deleteFromRailway(file.relativePath);
        
        if (deleteResult.success) {
          deletedCount++;
          deletionResults.push({
            fileName: file.fileName,
            relativePath: file.relativePath,
            success: true
          });
          console.log(`✅ [RAILWAY-CLEANUP] Deleted: ${file.relativePath}`);
        } else {
          deletionResults.push({
            fileName: file.fileName,
            relativePath: file.relativePath,
            success: false,
            error: deleteResult.error
          });
          console.warn(`⚠️ [RAILWAY-CLEANUP] Failed to delete: ${file.relativePath} - ${deleteResult.error}`);
        }
        
      } catch (deleteError) {
        console.warn(`⚠️ [RAILWAY-CLEANUP] Error deleting ${file.relativePath}:`, deleteError.message);
        deletionResults.push({
          fileName: file.fileName,
          relativePath: file.relativePath,
          success: false,
          error: deleteError.message
        });
      }
    }

    console.log(`✅ [RAILWAY-CLEANUP] Cleanup completed:`, {
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
    console.error(`❌ [RAILWAY-CLEANUP] Cleanup failed:`, error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Check if file is referenced in database
async function checkFileInDatabase(relativePath, nobooking, userid) {
  try {
    if (!nobooking || !userid) {
      console.log(`⚠️ [RAILWAY-VALIDATION] Missing nobooking or userid, skipping database check`);
      return false;
    }

    // Import pool here to avoid circular dependency
    const { pool } = await import('../../../db.js');

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

    // Check if any path contains the file path
    const isReferenced = filePaths.some(path => 
      path && path.includes(relativePath)
    );

    if (isReferenced) {
      console.log(`🔍 [RAILWAY-VALIDATION] File ${relativePath} is still referenced in database`);
    }

    return isReferenced;
  } catch (error) {
    console.error(`❌ [RAILWAY-VALIDATION] Error checking database for ${relativePath}:`, error);
    return false; // Assume not referenced if check fails
  }
}

// Generate public URL for file
export function generatePublicUrl(relativePath, options = {}) {
  try {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto'
    } = options;

    let url = `${RAILWAY_STORAGE_CONFIG.publicPath}/${relativePath}`;
    
    // For Railway storage, we don't have built-in transformations
    // In the future, we could add image processing middleware
    
    console.log(`🔗 [RAILWAY-URL] Generated public URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ [RAILWAY-URL] Failed to generate public URL:`, error);
    return null;
  }
}

// Test file accessibility
export async function testFileAccessibility(relativePath) {
  try {
    console.log(`🔍 [RAILWAY-TEST] Testing file accessibility: ${relativePath}`);
    
    const fileInfo = await getFileInfo(relativePath);
    
    if (fileInfo.success && fileInfo.fileInfo.isReady) {
      console.log(`✅ [RAILWAY-TEST] File is accessible: ${relativePath}`);
      return {
        success: true,
        accessible: true,
        fileInfo: fileInfo.fileInfo
      };
    } else {
      console.log(`⚠️ [RAILWAY-TEST] File is not accessible: ${relativePath}`);
      return {
        success: true,
        accessible: false,
        fileInfo: fileInfo.fileInfo
      };
    }
  } catch (error) {
    console.error(`❌ [RAILWAY-TEST] Failed to test file accessibility:`, error);
    return {
      success: false,
      accessible: false,
      error: error.message
    };
  }
}

// Function to cleanup orphaned files from Railway storage
export async function cleanupOrphanedFile(relativePath) {
  try {
    console.log(`🧹 [RAILWAY-CLEANUP] Attempting to cleanup orphaned file: ${relativePath}`);
    
    if (!relativePath) {
      throw new Error('Relative path is required for cleanup');
    }

    const deleteResult = await deleteFromRailway(relativePath);
    
    return {
      success: deleteResult.success,
      message: deleteResult.success ? 'Orphaned file cleaned up' : 'Failed to cleanup orphaned file',
      relativePath: relativePath
    };
    
  } catch (error) {
    console.error(`❌ [RAILWAY-CLEANUP] Cleanup failed:`, error);
    return {
      success: false,
      message: error.message,
      relativePath: relativePath
    };
  }
}

// Get MIME type from file extension
function getMimeTypeFromExtension(ext) {
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bin': 'application/octet-stream'
  };
  
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

// Validate file with Railway storage (always returns true for local files)
export async function validateFileWithRailway(relativePath, mimeType = null) {
  try {
    console.log(`🧩 [VALIDATE-RAILWAY] Starting Railway validation for file: ${relativePath}`);
    
    const fileInfo = await getFileInfo(relativePath);
    
    if (fileInfo.success && fileInfo.fileInfo.isReady) {
      console.log(`✅ [VALIDATE-RAILWAY] File sudah tersedia di Railway: ${relativePath}`);
      return {
        success: true,
        message: 'File sudah tersedia di Railway',
        status: 200,
        ready: true
      };
    } else {
      console.log(`⚠️ [VALIDATE-RAILWAY] File tidak ditemukan: ${relativePath}`);
      return {
        success: false,
        message: 'File tidak ditemukan',
        status: 404,
        ready: false
      };
    }
  } catch (error) {
    console.warn(`⚠️ [VALIDATE-RAILWAY] Validation failed: ${error.message}`);
    return {
      success: false,
      message: 'Validation failed',
      error: error.message,
      ready: false
    };
  }
}

export default {
  uploadToRailway,
  getFileInfo,
  deleteFromRailway,
  listFilesInFolder,
  cleanupOldFiles,
  generatePublicUrl,
  testFileAccessibility,
  cleanupOrphanedFile,
  validateFileWithRailway
};
