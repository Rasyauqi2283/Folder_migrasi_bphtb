// backend/config/uploads/cloudinary_storage.js
// CLOUDINARY STORAGE - PRODUCTION SYSTEM
// NOTE: Ini adalah sistem upload utama untuk production
// Menggunakan external storage (Cloudinary) untuk persistent file storage
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

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
    
    // Generate public_id dengan format: userid_dokumenpath_sequence_tahun
    // Format: PAT10_Akta_000001_2025
    const publicId = `${userid}_${docType}_${sequenceNumber}_${currentYear}`;
    
    // Prepare upload parameters - AUTHENTICATED ACCESS (SECURE)
    const uploadParams = {
      folder: 'bappenda/dokumen-sspd',
      public_id: publicId,
      // Use correct resource type based on file type
      resource_type: isPdf ? 'raw' : 'image',
      format: ext,
      // Secure authenticated access
      type: 'authenticated',
      // Additional parameters
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      // Metadata
      context: `userid=${userid}|docType=${docType}|nobooking=${nobooking}|sequence=${sequenceNumber}|ppatk=${ppatk_khusus}|year=${currentYear}`,
      tags: `${userid},${docType},${sequenceNumber},${ppatk_khusus},${currentYear},bappenda-sspd`
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
  if (!url) return null;
  
  // Format URL: https://res.cloudinary.com/[cloud]/[type]/upload/v[version]/[folder]/[public_id].[ext]
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (match) {
    // Remove extension if present
    return match[1].replace(/\.\w+$/, '');
  }
  return null;
}

// Helper function untuk generate signed URL (untuk RAW/PDF files)
export function generateSignedUrl(publicId, options = {}) {
  try {
    const defaultOptions = {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      ...options
    };
    
    const url = cloudinary.url(publicId, defaultOptions);
    console.log(`🔐 [CLOUDINARY] Generated signed URL for: ${publicId}`);
    return url;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Failed to generate signed URL:`, error);
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

export { cloudinary };

