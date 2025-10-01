// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

// Enhanced logging untuk Railway-Cloudinary connection
console.log('🌐 [CLOUDINARY-CONFIG] Initializing Cloudinary connection...');
console.log('🌐 [CLOUDINARY-CONFIG] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
  RAILWAY_REGION: process.env.RAILWAY_REGION || 'local'
});

// Check for CLOUDINARY_URL first (preferred method)
const hasCloudinaryUrl = !!process.env.CLOUDINARY_URL;
const hasIndividualCredentials = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

console.log('🌐 [CLOUDINARY-CONFIG] Configuration method check:', {
  has_cloudinary_url: hasCloudinaryUrl ? '✅ SET' : '❌ MISSING',
  has_individual_credentials: hasIndividualCredentials ? '✅ SET' : '❌ MISSING',
  cloudinary_url_preview: process.env.CLOUDINARY_URL ? 
    'cloudinary://***:***@' + (process.env.CLOUDINARY_URL.split('@')[1] || 'unknown') : 'NOT_SET'
});

console.log('🌐 [CLOUDINARY-CONFIG] Individual credentials check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING',
  cloud_name_value: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
  api_key_preview: process.env.CLOUDINARY_API_KEY ? 
    '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT_SET',
  api_secret_preview: process.env.CLOUDINARY_API_SECRET ? 
    '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT_SET'
});

// Validate credentials before config
if (!hasCloudinaryUrl && !hasIndividualCredentials) {
  console.error('❌ [CLOUDINARY-CONFIG] Missing required environment variables!');
  console.error('❌ [CLOUDINARY-CONFIG] Required: Either CLOUDINARY_URL or individual credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
  throw new Error('Cloudinary configuration incomplete - missing environment variables');
}

// Configure Cloudinary
if (hasCloudinaryUrl) {
  console.log('🌐 [CLOUDINARY-CONFIG] Using CLOUDINARY_URL for configuration');
  cloudinary.config({
    secure: true
  });
} else {
  console.log('🌐 [CLOUDINARY-CONFIG] Using individual credentials for configuration');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Test connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ [CLOUDINARY-CONFIG] Connection test successful:', {
      status: result.status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  })
  .catch(error => {
    console.error('❌ [CLOUDINARY-CONFIG] Connection test failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
export const uploadFile = async (filePath, customName) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "dokumen_sspd/ppat",     // opsional → untuk grup file
        public_id: customName,      // nama file custom (tanpa ekstensi)
        resource_type: "raw",       // pakai "raw" kalau PDF, DOCX, dll
        overwrite: true             // biar bisa replace kalau nama sama
      });
      console.log("✅ Upload success:", result.secure_url);
      return result;
    } catch (err) {
      console.error("❌ Upload error:", err);
    }
  };

export default cloudinary;