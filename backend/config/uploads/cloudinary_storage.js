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

console.log('🌐 Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET'
});

// Cloudinary Storage untuk Mixed Upload (PDF & Images)
const cloudinaryMixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userid = req.session?.user?.userid || 'unknown';
    const currentYear = new Date().getFullYear();
    
    // Determine document type dengan mapping yang lebih pendek
    const fieldToKeyMap = {
      aktaTanah: 'Akta',
      sertifikatTanah: 'Sertifikat',
      pelengkap: 'Pelengkap'
    };
    const docType = fieldToKeyMap[file.fieldname] || 'Dokumen';
    
    const isPdf = file.mimetype === 'application/pdf';
    const ext = path.extname(file.originalname).toLowerCase().replace('.', ''); // Hapus dot
    
    // Generate public_id dengan format: userid_namapath_tahun
    const publicId = `${userid}_${docType}_${currentYear}`;
    
    console.log(`📁 [CLOUDINARY] Uploading to cloud:`, {
      folder: 'bappenda/dokumen-sspd',
      publicId: publicId,
      type: isPdf ? 'PDF (raw)' : 'Image',
      resourceType: isPdf ? 'raw' : 'image',
      format: ext,
      originalName: file.originalname,
      namingFormat: 'userid_namapath_tahun'
    });
    
    return {
      folder: 'bappenda/dokumen-sspd',
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image', // PDF = raw, Image = image
      format: ext, // Set format explicitly (pdf, jpg, png, jpeg)
      access_mode: 'public', // ✅ Make files publicly accessible
      type: 'upload', // Upload type
      // Add metadata
      context: {
        userid: userid,
        docType: docType,
        year: currentYear,
        uploadDate: new Date().toISOString(),
        namingFormat: 'userid_namapath_tahun'
      },
      tags: [userid, docType, currentYear.toString(), 'bappenda-sspd']
    };
  }
});

// Multer middleware dengan Cloudinary storage
export const mixedCloudinaryUpload = multer({
  storage: cloudinaryMixedStorage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    const isValidMimeType = allowed.includes(file.mimetype);
    const isValidExtension = ['.pdf', '.jpg', '.jpeg', '.png'].includes(fileExtension);
    
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
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
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

