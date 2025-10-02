// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

// ===============================
// STEP 1: Logging awal
// ===============================
console.log('🌐 [CLOUDINARY-CONFIG] Initializing Cloudinary connection...');
console.log('🌐 [CLOUDINARY-CONFIG] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
  RAILWAY_REGION: process.env.RAILWAY_REGION || 'local'
});

// ===============================
// STEP 2: Check credentials
// ===============================
const hasCloudinaryUrl = !!process.env.CLOUDINARY_URL;
const hasIndividualCredentials = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

console.log('🌐 [CLOUDINARY-CONFIG] Configuration method check:', {
  has_cloudinary_url: hasCloudinaryUrl ? '✅ SET' : '❌ MISSING',
  has_individual_credentials: hasIndividualCredentials ? '✅ SET' : '❌ MISSING',
  cloudinary_url_preview: process.env.CLOUDINARY_URL ? 
    'cloudinary://***:***@' + (process.env.CLOUDINARY_URL.split('@')[1] || 'unknown') 
    : 'NOT_SET'
});

// Individual preview
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

// ===============================
// STEP 3: Validate
// ===============================
if (!hasCloudinaryUrl && !hasIndividualCredentials) {
  console.error('❌ [CLOUDINARY-CONFIG] Missing required environment variables!');
  throw new Error('Cloudinary configuration incomplete - missing environment variables');
}

// ===============================
// STEP 4: Configure
// ===============================
if (hasCloudinaryUrl) {
  console.log('🌐 [CLOUDINARY-CONFIG] Using CLOUDINARY_URL for configuration');
  cloudinary.config({ secure: true });
} else {
  console.log('🌐 [CLOUDINARY-CONFIG] Using individual credentials for configuration');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// ===============================
// STEP 5: Test connection
// ===============================
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


// ===============================
// STEP 6: Upload File (RAW / PDF) 
// - masih sama, tapi resource_type: "raw"
// ===============================
export const uploadFile = async (filePath, customName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "dokumen_sspd/ppat",
      public_id: customName,
      resource_type: "raw",  // untuk PDF, DOCX, ZIP, dsb
      overwrite: true
    });

    console.log("✅ Upload success:", {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type
    });

    return result;
  } catch (err) {
    console.error("❌ Upload error:", err);
    throw err;
  }
};


// ===============================
// STEP 7: Generate Signed URL (Authenticated Mode)
// - dipanggil saat user ingin lihat file
// ===============================
export const generateSignedUrl = (publicId, expirySeconds = 300, resourceType = "raw") => {
  try {
    const expiresAt = Math.floor(Date.now() / 1000) + expirySeconds;

    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      expires_at: expiresAt
    });

    console.log("🔑 [SIGNED-URL] Generated:", {
      public_id: publicId,
      resource_type: resourceType,
      expires_in: expirySeconds + "s",
      type: "authenticated"
    });

    return signedUrl;
  } catch (err) {
    console.error("❌ Signed URL generation failed:", err);
    throw err;
  }
};

export default cloudinary;
