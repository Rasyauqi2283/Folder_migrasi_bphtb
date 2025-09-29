import multer from 'multer';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Pastikan selalu mengacu ke root proyek (bukan folder modul ini)
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Configuration
// Direktori dasar tanda tangan di dalam public root
const BASE_SIGNATURE_DIR = path.join(ROOT_DIR, 'public', 'penting_F_simpan', 'folderttd');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // increase limit to be tolerant

// Ensure storage directory exists
const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Memory storage for initial upload
const storage = multer.memoryStorage();
// IMPORTANT: multer's fileFilter is called BEFORE buffering, so file.buffer is undefined here.
// Only perform lightweight checks and defer heavy validation to processTTDVerif.
const fileFilter = (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
    if (!allowedExt.includes(ext) || !isMimeAllowed) {
      return cb(new Error('Hanya file gambar (JPG/PNG/WebP) yang diperbolehkan'), false);
    }
    return cb(null, true);
  } catch (e) {
    return cb(new Error('Gagal memproses file upload'), false);
  }
};

// Resolve subfolder based on user division
const resolveSignatureFolder = (req) => {
  const divisiRaw = req.session?.user?.divisi || '';
  const useridRaw = req.session?.user?.userid || '';
  const divisi = String(divisiRaw).toLowerCase();
  const useridUpper = String(useridRaw).toUpperCase();

  if (divisi === 'peneliti validasi' || divisi === 'peneliti_validasi') return 'parafv_sign';
  if (divisi === 'peneliti') return 'peneliti_sign';
  if (divisi === 'ppat' || divisi === 'ppats') return 'ppat_sign';
  // Fallback berdasarkan prefix userid
  if (useridUpper.startsWith('PAT') || useridUpper.startsWith('PATS')) return 'ppat_sign';
  return 'ppat_sign';
};

// Advanced preprocessing untuk tanda tangan
const preprocessSignature = async (buffer) => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Deteksi apakah gambar perlu preprocessing khusus
    const stats = await image.stats();
    const isAlreadyGreyscale = stats.channels === 1;
    
    let processedImage = image;
    
    if (!isAlreadyGreyscale) {
      // Konversi ke greyscale dengan contrast yang baik
      processedImage = processedImage
        .greyscale()
        .modulate({
          brightness: 1.1,  // Sedikit lebih terang
          saturation: 0,    // Pastikan tidak ada warna
          hue: 0
        });
    }
    
    // Enhance contrast untuk tanda tangan yang lebih jelas
    processedImage = processedImage
      .linear(1.2, -(128 * 0.2)) // Increase contrast
      .normalize(); // Normalize brightness
    
    return processedImage;
  } catch (error) {
    console.error('❌ [TTD] Preprocessing error:', error);
    return sharp(buffer); // Fallback ke original
  }
};

const processTTDVerif = async (req, res, next) => {
  // Support both single('signature1') and fields(['signature','signature1'])
  const pickFile = () => {
    if (req.file) return req.file;
    if (req.files) {
      if (Array.isArray(req.files.signature) && req.files.signature[0]) return req.files.signature[0];
      if (Array.isArray(req.files.signature1) && req.files.signature1[0]) return req.files.signature1[0];
    }
    return null;
  };

  const uploaded = pickFile();
  if (!uploaded) return next();

  try {
    console.log('🔄 [TTD] Processing signature upload...');
    
    const subfolder = resolveSignatureFolder(req);
    const targetDir = path.join(BASE_SIGNATURE_DIR, subfolder);
    await ensureDir(targetDir);

    const userid = req.session?.user?.userid || 'unknown';
    // Gunakan nama file tetap agar selalu overwrite versi lama
    const filename = `ttd-${userid}.png`;
    const filePath = path.join(targetDir, filename);
    const publicUrl = `/penting_F_simpan/folderttd/${subfolder}/${filename}`;

    // Step 1: Advanced preprocessing
    const preprocessedImage = await preprocessSignature(uploaded.buffer);
    
    // Step 2: Smart cropping dan resizing
    await preprocessedImage
      // Crop otomatis untuk menghilangkan area kosong di sekitar tanda tangan
      .trim({
        threshold: 15, // Threshold untuk mendeteksi background (ditingkatkan)
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Background putih untuk crop
      })
      // Resize ke ukuran standar dengan padding putih yang bersih
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // Background putih (sesuai PDF)
        position: 'center' // Posisi di tengah
      })
      // Pastikan background benar-benar putih tanpa artefak
      .flatten({ 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      // Final cleanup untuk menghilangkan noise
      .median(1) // Remove small noise/artifacts
      .png({ 
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true, // Optimasi untuk hitam-putih
        quality: 100   // Kualitas maksimal untuk tanda tangan
      })
      .toFile(filePath);
    
    console.log('✅ [TTD] Signature processed successfully:', {
      userid,
      filename,
      size: (await fs.stat(filePath)).size
    });

    // Generate multiple sizes untuk berbagai kebutuhan PDF
    const sizes = [
      { name: 'small', size: 200, suffix: '_s' },
      { name: 'medium', size: 400, suffix: '_m' },
      { name: 'large', size: 800, suffix: '_l' }
    ];

    const processedFiles = {};

    // Generate base file (large)
    processedFiles.large = {
      path: filePath,
      url: publicUrl,
      size: (await fs.stat(filePath)).size,
      mimeType: 'image/png'
    };

    // Generate smaller sizes untuk optimasi PDF
    for (const { name, size, suffix } of sizes.slice(0, 2)) { // Skip large (already done)
      const smallFilename = `ttd-${userid}${suffix}.png`;
      const smallFilePath = path.join(targetDir, smallFilename);
      const smallPublicUrl = `/penting_F_simpan/folderttd/${subfolder}/${smallFilename}`;

      await preprocessedImage
        .trim({
          threshold: 15,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
          position: 'center'
        })
        .flatten({ 
          background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .median(1)
        .png({ 
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true,
          quality: 100
        })
        .toFile(smallFilePath);

      processedFiles[name] = {
        path: smallFilePath,
        url: smallPublicUrl,
        size: (await fs.stat(smallFilePath)).size,
        mimeType: 'image/png'
      };
    }

    // Attach processed file info to request
    req.processedTTD = processedFiles;
    req.processedTTD.main = processedFiles.large; // Backward compatibility
    
    next();
  } catch (err) {
    next(err);
  }
};

// Multer configuration for TTD Verifikasi
const uploadTTDVerif = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// Middleware for handling TTD verification upload
export const ttdVerifMiddleware = [
  // Terima 'signature' (frontend profil) atau 'signature1' (varian lain)
  (req, res, next) => uploadTTDVerif.fields([
    { name: 'signature', maxCount: 1 },
    { name: 'signature1', maxCount: 1 }
  ])(req, res, next),
  processTTDVerif
];

// For routes that need multiple TTD types
export const uploadTTD = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folders = {
        signature1: path.join(ROOT_DIR, 'public', 'penting_F_simpan', 'folderttd', 'folderttdwp')
      };
      const destPath = folders[file.fieldname];
      ensureDir(destPath)
        .then(() => cb(null, destPath))
        .catch(err => cb(err));
    },
    filename: (req, file, cb) => {
      if (!req.body.nobooking) {
        return cb(new Error('Nomor booking diperlukan'), false);
      }
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${req.body.nobooking}_${Date.now()}_${file.fieldname}${ext}`);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  },
  fileFilter
});

// For Kasie signature (memory storage only)
export const uploadTTDKasie = multer({ 
  storage: multer.memoryStorage() 
}).fields([{ name: 'signature1', maxCount: 1 }]);