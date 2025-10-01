// backend/config/uploads/cloudinary_storage.js
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
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    // Determine document type
    const fieldToKeyMap = {
      aktaTanah: 'Akta',
      sertifikatTanah: 'SertifikatTanah',
      pelengkap: 'DokumenP'
    };
    const docType = fieldToKeyMap[file.fieldname] || 'Dokumen';
    
    const isPdf = file.mimetype === 'application/pdf';
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Generate public_id (filename di Cloudinary)
    const publicId = `${userid}_${docType}_${timestamp}_${randomStr}`;
    
    console.log(`📁 [CLOUDINARY] Uploading to cloud:`, {
      folder: 'bappenda/dokumen-sspd',
      publicId: publicId,
      type: isPdf ? 'PDF' : 'Image',
      originalName: file.originalname
    });
    
    return {
      folder: 'bappenda/dokumen-sspd',
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image',
      format: isPdf ? 'pdf' : undefined, // auto-detect untuk images
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png'],
      // Add metadata
      context: {
        userid: userid,
        docType: docType,
        uploadDate: new Date().toISOString()
      },
      tags: [userid, docType, 'bappenda-sspd']
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
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}

export { cloudinary };

