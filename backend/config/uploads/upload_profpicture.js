import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';

const PROFILE_PHOTO_PATH = 'public/penting_F_simpan/profile-photo';

// Optimized storage configuration
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(PROFILE_PHOTO_PATH, { recursive: true });
      cb(null, PROFILE_PHOTO_PATH);
    } catch (err) {
      cb(err);
    }
  },
  filename: async (req, file, cb) => {
    const userid = req.session?.user?.userid;
    if (!userid) return cb(new Error('User ID tidak valid'));

    // Gunakan ekstensi konsisten .jpeg karena output diproses ke JPEG
    const ext = '.jpeg';
    const prefix = `${userid}_foto_profile_`;
    const timestamp = Date.now();
    const newFilename = `${prefix}${timestamp}${ext}`; // contoh: PAT01_foto_profile_1736439200000.jpeg

    // Hapus semua file lama milik user ini (berdasarkan prefix)
    try {
      const files = await fs.readdir(PROFILE_PHOTO_PATH);
      for (const name of files) {
        if (name.startsWith(prefix)) {
          try {
            await fs.unlink(path.join(PROFILE_PHOTO_PATH, name));
            console.log(`Deleted old profile photo for user ${userid}: ${name}`);
          } catch (e) {
            console.warn(`Gagal menghapus file lama ${name}:`, e.message);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal membaca folder foto profil:', err.message);
    }

    cb(null, newFilename);
  }
});

// File filter for image validation
const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedTypes.includes(ext)) {
    return cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'), false);
  }
  cb(null, true);
};

// Image processor middleware
const processImage = async (req, _res, next) => {
  if (!req.file) return next();

  const tempPath = `${req.file.path}.tmp`;
  try {
    // Tulis ke file sementara untuk menghindari konflik lock file di Windows
    await sharp(req.file.path)
      .resize(500, 500, {
        fit: 'cover',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        mozjpeg: true
      })
      .toFile(tempPath);

    // Gantikan file asli secara atomik
    await fs.rename(tempPath, req.file.path);
    next();
  } catch (err) {
    // Bersihkan file sementara jika ada
    try { await fs.unlink(tempPath); } catch (_) {}
    next(err);
  }
};

const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1 
  }
});

export { uploadProfile, processImage };