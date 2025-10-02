// backend/config/uploads/cloudinary_storage.js
// CLOUDINARY STORAGE - PRODUCTION SYSTEM
// NOTE: Ini adalah sistem upload utama untuk production
// Menggunakan external storage (Cloudinary) untuk persistent file storage
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import { pool } from '../../../db.js';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🌐 [CLOUDINARY-STORAGE] Initializing Cloudinary storage...');
console.log('🌐 [CLOUDINARY-STORAGE] Railway environment info:', {
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
  RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
  RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID || 'local'
});

console.log('🌐 [CLOUDINARY-STORAGE] Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET',
  config_status: process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? '✅ COMPLETE' : '❌ INCOMPLETE'
});

// Cloudinary Storage untuk Mixed Upload (PDF & Images)
const cloudinaryMixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
    console.log('📤 [CLOUDINARY-UPLOAD] Starting upload process...');
    console.log('📤 [CLOUDINARY-UPLOAD] Railway context:', {
      RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
      RAILWAY_REGION: process.env.RAILWAY_REGION || 'local',
      NODE_ENV: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
    
    const userid = req.session?.user?.userid || 'unknown';
    const ppatk_khusus = req.session?.user?.ppatk_khusus || 'PPATK';
    const currentYear = new Date().getFullYear();
    
    console.log('📤 [CLOUDINARY-UPLOAD] Session data:', {
      userid: userid,
      ppatk_khusus: ppatk_khusus,
      divisi: req.session?.user?.divisi || 'unknown',
      hasSession: !!req.session,
      hasUser: !!req.session?.user
    });
    
    // Determine document type dengan mapping yang lebih pendek
    const fieldToKeyMap = {
      aktaTanah: 'Akta',
      sertifikatTanah: 'Sertifikat',
      pelengkap: 'Pelengkap'
    };
    const docType = fieldToKeyMap[file.fieldname] || 'Dokumen';
    
    const isPdf = file.mimetype === 'application/pdf';
    const ext = path.extname(file.originalname).toLowerCase().replace('.', ''); // Hapus dot
    
    // Get nobooking from request body (MUST be available during upload)
    const nobooking = req.body?.nobooking;
    
    // Validate nobooking is present
    if (!nobooking) {
      console.error('❌ [CLOUDINARY] nobooking is required but not provided in request body');
      throw new Error('nobooking is required for file upload');
    }
    
    // Extract sequence number from nobooking (format: ppatk_khusus-year-sequence)
    // Example: 20012-2025-000030 -> extract 000030
    let sequenceNumber;
    if (nobooking.includes('-')) {
      const parts = nobooking.split('-');
      if (parts.length >= 3) {
        sequenceNumber = parts[2]; // Get the last part (sequence number)
      } else {
        console.error('❌ [CLOUDINARY] Invalid nobooking format:', nobooking);
        throw new Error('Invalid nobooking format - expected format: ppatk_khusus-year-sequence');
      }
    } else {
      console.error('❌ [CLOUDINARY] Invalid nobooking format (no dashes):', nobooking);
      throw new Error('Invalid nobooking format - expected format: ppatk_khusus-year-sequence');
    }
    
    // Validate sequence number is numeric and properly formatted
    if (!sequenceNumber || !/^\d{6}$/.test(sequenceNumber)) {
      console.error('❌ [CLOUDINARY] Invalid sequence number format:', sequenceNumber);
      throw new Error('Invalid sequence number format - expected 6 digits');
    }
    
    // Generate public_id dengan format: docType_sequence_timestamp (untuk folder structure)
    // Format: Akta_000001_20251002_143022 (YYYYMMDD_HHMMSS)
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = currentDate.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    const timestamp = `${dateStr}_${timeStr}`;
    
    // PublicId akan menjadi: docType_sequence_timestamp (folder sudah mengandung userid/nobooking)
    const publicId = `${userid}_${docType}_${sequenceNumber}_${timestamp}`;
    
    console.log('🔍 [CLOUDINARY-UPLOAD] Generated publicId:', {
      userid,
      docType,
      sequenceNumber,
      currentYear,
      timestamp,
      generatedPublicId: publicId,
      isValid: !!publicId && publicId !== 'null' && publicId !== 'undefined'
    });
    
    // Prepare upload parameters - PUBLIC ACCESS (REVIEW FRIENDLY)
    const uploadParams = {
      folder: `bappenda/sspd/${currentYear}/${userid}/${nobooking}`,
      public_id: `${userid}_${docType}_${sequenceNumber}_${timestamp}`,
      // Use correct resource type based on file type
      resource_type: isPdf ? 'raw' : 'image',
      format: ext,
      // Public access mode
      type: 'upload',
      // Additional parameters - DON'T use filename when public_id is set
      use_filename: false,
      unique_filename: false,
      overwrite: true,
      // Enhanced metadata for better organization
      context: `userid=${userid}|docType=${docType}|nobooking=${nobooking}|sequence=${sequenceNumber}|ppatk=${ppatk_khusus}|year=${currentYear}|timestamp=${timestamp}`,
      tags: `${userid},${docType},${sequenceNumber},${ppatk_khusus},${currentYear},bappenda-sspd,public-access`
    };
    
    // PDF-specific options are already set above
    
    console.log(`📁 [CLOUDINARY] Upload parameters:`, {
      ...uploadParams,
      // Log validation info separately
      validation: {
        nobookingProvided: !!nobooking,
        sequenceNumberValid: /^\d{6}$/.test(sequenceNumber),
        formatCorrect: nobooking.includes('-') && nobooking.split('-').length >= 3
      },
      fileInfo: {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });
    
    console.log(`📁 [CLOUDINARY] Expected publicId:`, publicId);
    console.log(`📁 [CLOUDINARY] Upload will use public_id:`, publicId);
    
    return uploadParams;
    } catch (error) {
      console.error('❌ [CLOUDINARY-UPLOAD] Error in params function:', error);
      throw error;
    }
  }
});

// Multer middleware dengan Cloudinary storage
export const mixedCloudinaryUpload = multer({
  storage: cloudinaryMixedStorage,
  fileFilter: (req, file, cb) => {
    try {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      const isValidMimeType = allowed.includes(file.mimetype);
      const isValidExtension = ['.pdf', '.jpg', '.jpeg', '.png'].includes(fileExtension);
      
      console.log('🔍 [CLOUDINARY] File validation:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        extension: fileExtension,
        isValidMimeType,
        isValidExtension,
        userid: req.session?.user?.userid || 'no-session'
      });
      
      if (isValidMimeType && isValidExtension) {
        cb(null, true);
      } else {
        console.log('❌ [CLOUDINARY] File rejected:', {
          filename: file.originalname,
          mimetype: file.mimetype,
          extension: fileExtension
        });
        cb(new Error(`Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG.`), false);
      }
    } catch (error) {
      console.error('❌ [CLOUDINARY] File filter error:', error);
      cb(error, false);
    }
  },
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3 // Maximum 3 files
  },
  // Add error handling for multer
  onError: (err, next) => {
    console.error('❌ [CLOUDINARY] Multer error:', err);
    next(err);
  }
});

// Helper function untuk rename file di Cloudinary
export async function renameCloudinaryFile(oldPublicId, newPublicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.rename(
      oldPublicId,
      newPublicId,
      { 
        resource_type: resourceType,
        invalidate: true // Clear CDN cache
      }
    );
    console.log(`✅ [CLOUDINARY] File renamed: ${oldPublicId} → ${newPublicId}`);
    return result;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Rename failed:`, error.message);
    throw error;
  }
}

// Helper function untuk delete file di Cloudinary
export async function deleteCloudinaryFile(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    console.log(`🗑️ [CLOUDINARY] File deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Delete failed:`, error.message);
    throw error;
  }
}

// Helper function untuk extract public_id dari Cloudinary URL
export function extractPublicIdFromUrl(url) {
  if (!url) {
    console.log('❌ [EXTRACT-PUBLIC-ID] No URL provided');
    return null;
  }
  
  console.log('🔍 [EXTRACT-PUBLIC-ID] Extracting from URL:', url);
  
  // Support multiple Cloudinary URL formats:
  // 1. Regular: https://res.cloudinary.com/[cloud]/[type]/upload/v[version]/[folder]/[public_id].[ext]
  // 2. Public: https://res.cloudinary.com/[cloud]/[type]/upload/v[version]/bappenda/sspd/2025/userid/nobooking/[public_id].[ext]
  
  let publicId = null;
  
  // Try different regex patterns
  const patterns = [
    // Pattern 1: Regular upload URLs
    /\/upload\/(?:v\d+\/)?(.+)$/,
    // Pattern 2: Public URLs with new folder structure
    /\/upload\/(?:v\d+\/)?bappenda\/sspd\/\d+\/\w+\/\w+\/(.+)$/,
    // Pattern 3: Any Cloudinary URL with folder structure
    /\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      publicId = match[1];
      break;
    }
  }
  
  if (publicId) {
    // Remove extension if present
    publicId = publicId.replace(/\.\w+$/, '');
    
    // For new structure, publicId format: userid_docType_sequence_timestamp
    // e.g., "PAT09_Pelengkap_000002_20251002_035509"
    console.log('✅ [EXTRACT-PUBLIC-ID] Extracted publicId:', publicId);
    return publicId;
  }
  
  console.log('❌ [EXTRACT-PUBLIC-ID] Failed to extract publicId from URL:', url);
  return null;
}

// Helper function untuk generate public URL (untuk RAW/PDF files)
export function generateSignedUrl(publicId, options = {}) {
  try {
    const defaultOptions = {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      ...options
    };
    
    // Generate full public URL dengan folder structure
    const url = cloudinary.url(publicId, defaultOptions);
    console.log(`🔐 [CLOUDINARY] Generated public URL for: ${publicId}`);
    return url;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Failed to generate public URL:`, error);
    return null;
  }
}

// Enhanced function dengan fallback untuk resource type
export async function generateSignedUrlWithFallback(publicId, options = {}) {
  const {
    resourceType = 'raw',
    expirySeconds = 3600,
    ...otherOptions
  } = options;

  // Try original resource type first
  try {
    const signedUrl = generateSignedUrl(publicId, { ...otherOptions, resource_type: resourceType });
    
    if (!signedUrl) {
      throw new Error('Failed to generate URL');
    }
    
    // Test if URL is accessible
    const response = await axios.head(signedUrl, { 
      timeout: 5000,
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 200) {
      return { url: signedUrl, resourceType, success: true };
    }
    
  } catch (error) {
    console.warn(`⚠️ [SIGNED-URL-FALLBACK] Original resource type ${resourceType} failed:`, error.message);
  }

  // Try alternative resource types
  const alternativeTypes = resourceType === 'raw' ? ['image', 'video'] : ['raw', 'video'];
  
  for (const altResourceType of alternativeTypes) {
    try {
      const altUrl = generateSignedUrl(publicId, { ...otherOptions, resource_type: altResourceType });
      
      if (!altUrl) {
        continue;
      }
      
      const response = await axios.head(altUrl, { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        console.log(`✅ [SIGNED-URL-FALLBACK] Found working resource type: ${altResourceType}`);
        return { url: altUrl, resourceType: altResourceType, success: true, fallback: true };
      }
      
    } catch (error) {
      console.warn(`⚠️ [SIGNED-URL-FALLBACK] Alternative resource type ${altResourceType} failed:`, error.message);
    }
  }

  // All attempts failed
  throw new Error(`File not accessible with any resource type. Public ID: ${publicId}`);
}

// Helper function untuk generate public URL dengan folder structure
export function generatePublicUrlWithFolder(userid, nobooking, publicId, resourceType = 'raw') {
  try {
    const currentYear = new Date().getFullYear();
    // PublicId sudah mengandung userid, jadi tidak perlu tambah folder lagi
    // Format publicId: userid_docType_sequence_timestamp
    // Folder sudah di-set saat upload: bappenda/sspd/year/userid/nobooking
    const fullPublicId = publicId; // Langsung gunakan publicId yang sudah lengkap
    
    const url = cloudinary.url(fullPublicId, {
      resource_type: resourceType,
      type: 'upload',
      secure: true
    });
    
    console.log(`🌐 [CLOUDINARY] Generated public URL: ${fullPublicId}`);
    return url;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Failed to generate public URL:`, error);
    return null;
  }
}

// Helper function untuk generate public delivery URL
export function generatePublicUrl(publicId, resourceType = 'image', format = null) {
  try {
    const options = {
      resource_type: resourceType,
      type: 'upload',
      secure: true
    };
    
    if (format) {
      options.format = format;
    }
    
    const url = cloudinary.url(publicId, options);
    console.log(`🌐 [CLOUDINARY] Generated public URL for: ${publicId}`);
    return url;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Failed to generate URL:`, error);
    return null;
  }
}

// Helper function untuk mengecek apakah file masih direferensikan di database
async function checkFileInDatabase(publicId, nobooking, userid) {
  try {
    if (!nobooking || !userid) {
      console.log(`⚠️ [CLOUDINARY-VALIDATION] Missing nobooking or userid, skipping database check`);
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

    // Check if any path contains the public ID
    const isReferenced = filePaths.some(path => 
      path && path.includes(publicId)
    );

    if (isReferenced) {
      console.log(`🔍 [CLOUDINARY-VALIDATION] File ${publicId} is still referenced in database`);
    }

    return isReferenced;
  } catch (error) {
    console.error(`❌ [CLOUDINARY-VALIDATION] Error checking database for ${publicId}:`, error);
    return false; // Assume not referenced if check fails
  }
}

// Helper function untuk mengecek apakah file masih accessible di Cloudinary
async function checkFileAccessibility(publicId, resourceType) {
  try {
    const testUrl = generateSignedUrl(publicId, 60, resourceType);
    
    const response = await axios.head(testUrl, {
      timeout: 5000,
      validateStatus: (status) => status < 500
    });

    const isAccessible = response.status === 200;
    
    if (!isAccessible) {
      console.log(`🔍 [CLOUDINARY-VALIDATION] File ${publicId} not accessible (status: ${response.status})`);
    }

    return isAccessible;
  } catch (error) {
    console.log(`🔍 [CLOUDINARY-VALIDATION] File ${publicId} not accessible: ${error.message}`);
    return false;
  }
}

// Helper function untuk mencari file lama berdasarkan pattern
export async function findOldFiles(userid, docType, sequenceNumber, currentYear, resourceType = 'image', nobooking = null) {
  try {
    console.log(`🔍 [CLOUDINARY-CLEANUP] Searching for old files:`, {
      userid,
      docType,
      sequenceNumber,
      currentYear,
      resourceType,
      nobooking
    });

    // Pattern untuk mencari file lama dengan folder structure baru
    let searchPattern;
    if (nobooking) {
      // Search dalam folder spesifik: bappenda/sspd/year/userid/nobooking/userid_docType_sequence_*
      searchPattern = `bappenda/sspd/${currentYear}/${userid}/${nobooking}/${userid}_${docType}_${sequenceNumber}_*`;
    } else {
      // Search dalam folder user: bappenda/sspd/year/userid/*/userid_docType_sequence_*
      searchPattern = `bappenda/sspd/${currentYear}/${userid}/*/${userid}_${docType}_${sequenceNumber}_*`;
    }
    
    const result = await cloudinary.search
      .expression(`public_id:${searchPattern}`)
      .resource_type(resourceType)
      .max_results(50)
      .execute();

    console.log(`🔍 [CLOUDINARY-CLEANUP] Found ${result.resources.length} old files`);
    
    return result.resources.map(resource => ({
      public_id: resource.public_id,
      created_at: resource.created_at,
      bytes: resource.bytes,
      format: resource.format
    }));
  } catch (error) {
    console.error(`❌ [CLOUDINARY-CLEANUP] Failed to search old files:`, error);
    return [];
  }
}

// Helper function untuk menghapus file lama (kecuali yang terbaru)
export async function cleanupOldFiles(userid, docType, sequenceNumber, currentYear, resourceType = 'image', keepLatest = 1, nobooking = null) {
  try {
    console.log(`🧹 [CLOUDINARY-CLEANUP] Starting cleanup for:`, {
      userid,
      docType,
      sequenceNumber,
      currentYear,
      resourceType,
      keepLatest,
      nobooking
    });

    const oldFiles = await findOldFiles(userid, docType, sequenceNumber, currentYear, resourceType, nobooking);
    
    if (oldFiles.length <= keepLatest) {
      console.log(`✅ [CLOUDINARY-CLEANUP] No cleanup needed - only ${oldFiles.length} files found`);
      return { deleted: 0, kept: oldFiles.length };
    }

    // Sort by created_at (newest first) dan ambil yang terbaru untuk di-keep
    const sortedFiles = oldFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const filesToKeep = sortedFiles.slice(0, keepLatest);
    const filesToDelete = sortedFiles.slice(keepLatest);

    console.log(`🧹 [CLOUDINARY-CLEANUP] Will delete ${filesToDelete.length} old files, keep ${filesToKeep.length} latest`);

    // 🛡️ SAFETY CHECK: Validate files before deletion
    const validatedFilesToDelete = [];
    
    for (const file of filesToDelete) {
      try {
        // Check if file is currently referenced in database
        const isReferenced = await checkFileInDatabase(file.public_id, nobooking, userid);
        
        if (isReferenced) {
          console.warn(`⚠️ [CLOUDINARY-CLEANUP] SKIPPING deletion of ${file.public_id} - still referenced in database`);
          continue;
        }
        
        // Check if file is accessible (not already deleted)
        const isAccessible = await checkFileAccessibility(file.public_id, resourceType);
        
        if (!isAccessible) {
          console.warn(`⚠️ [CLOUDINARY-CLEANUP] SKIPPING deletion of ${file.public_id} - file not accessible (may already be deleted)`);
          continue;
        }
        
        validatedFilesToDelete.push(file);
        console.log(`✅ [CLOUDINARY-CLEANUP] Validated for deletion: ${file.public_id}`);
        
      } catch (validationError) {
        console.warn(`⚠️ [CLOUDINARY-CLEANUP] Validation failed for ${file.public_id}:`, validationError.message);
        // Skip this file if validation fails
        continue;
      }
    }

    console.log(`🧹 [CLOUDINARY-CLEANUP] After validation: ${validatedFilesToDelete.length} files safe to delete`);

    let deletedCount = 0;
    const deletionResults = [];

    for (const file of validatedFilesToDelete) {
      try {
        const result = await cloudinary.uploader.destroy(file.public_id, {
          resource_type: resourceType
        });
        
        if (result.result === 'ok') {
          deletedCount++;
          console.log(`🗑️ [CLOUDINARY-CLEANUP] Deleted: ${file.public_id}`);
          deletionResults.push({ public_id: file.public_id, status: 'deleted', bytes: file.bytes });
        } else {
          console.warn(`⚠️ [CLOUDINARY-CLEANUP] Failed to delete: ${file.public_id} - ${result.result}`);
          deletionResults.push({ public_id: file.public_id, status: 'failed', reason: result.result });
        }
      } catch (deleteError) {
        console.error(`❌ [CLOUDINARY-CLEANUP] Error deleting ${file.public_id}:`, deleteError);
        deletionResults.push({ public_id: file.public_id, status: 'error', error: deleteError.message });
      }
    }

    const totalBytesFreed = deletionResults
      .filter(r => r.status === 'deleted' && r.bytes)
      .reduce((sum, r) => sum + r.bytes, 0);

    console.log(`✅ [CLOUDINARY-CLEANUP] Cleanup completed:`, {
      deleted: deletedCount,
      kept: filesToKeep.length,
      totalBytesFreed: totalBytesFreed,
      results: deletionResults
    });

    return {
      deleted: deletedCount,
      kept: filesToKeep.length,
      totalBytesFreed: totalBytesFreed,
      results: deletionResults
    };

  } catch (error) {
    console.error(`❌ [CLOUDINARY-CLEANUP] Cleanup failed:`, error);
    throw error;
  }
}

export { cloudinary };

