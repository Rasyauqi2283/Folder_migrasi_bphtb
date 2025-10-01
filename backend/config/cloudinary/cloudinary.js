// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
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