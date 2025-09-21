import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory (3 levels up from this file)
const projectRoot = path.resolve(__dirname, '../../../');

// PDF Upload
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(projectRoot, 'public', 'penting_F_simpan', 'folder_input_sspd', 'pdf');
    
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('PDF directory created:', uploadPath);
      }
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error creating PDF directory:', error);
      cb(error);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `doc-${timestamp}${ext}`);
  }
});

// Image Upload
const imgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(projectRoot, 'public', 'penting_F_simpan', 'folder_input_sspd', 'images');
    
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('Image directory created:', uploadPath);
      }
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error creating image directory:', error);
      cb(error);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `img-${timestamp}${ext}`);
  }
});

// Mixed (PDF or Image) Upload
const mixedStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf';
    const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Additional check for file extension
    const isValidPdfExt = fileExtension === '.pdf';
    const isValidImageExt = ['.jpg', '.jpeg', '.png'].includes(fileExtension);

    if ((isPdf && isValidPdfExt) || (isImage && isValidImageExt)) {
      const targetSubFolder = isPdf ? 'pdf' : 'images';
      const uploadPath = path.join(projectRoot, 'public', 'penting_F_simpan', 'folder_input_sspd', targetSubFolder);

      try {
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
          console.log(`${targetSubFolder.toUpperCase()} directory created:`, uploadPath);
        }
        cb(null, uploadPath);
      } catch (error) {
        console.error('Error creating mixed upload directory:', error);
        cb(error);
      }
    } else {
      return cb(new Error(`Format file tidak didukung. File: ${file.originalname}, MimeType: ${file.mimetype}. Gunakan PDF, JPG, JPEG, atau PNG.`), false);
    }
  },
  filename: (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const userid = req.session?.user?.userid || 'unknown';
      const nobooking = req.body?.nobooking || '';
      // Extract year and serial from nobooking pattern e.g. XXXXX-YYYY-######
      let year = '0000';
      let serial = '000000';
      if (typeof nobooking === 'string' && nobooking.includes('-')) {
        const parts = nobooking.split('-');
        if (parts.length >= 3) {
          year = (parts[1] || '').replace(/[^0-9]/g, '').padStart(4, '0').slice(-4);
          serial = (parts[2] || '').replace(/[^0-9]/g, '').padStart(6, '0').slice(-6);
        }
      }

      // Determine document key by fieldname
      const field = file.fieldname || '';
      const fieldToKeyMap = {
        aktaTanah: 'Akta',
        sertifikatTanah: 'SertifikatTanah',
        pelengkap: 'DokumenP'
      };
      const docKey = fieldToKeyMap[field] || 'Dokumen';

      const filename = `${userid}_${docKey}_${serial}_${year}${ext}`;
      cb(null, filename);
    } catch (err) {
      const fallback = `upload-${Date.now()}${path.extname(file.originalname).toLowerCase()}`;
      cb(null, fallback);
    }
  }
});

// Middleware
export const pdfDUpload = multer({
  storage: pdfStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF yang diperbolehkan'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const imgDUpload = multer({
  storage: imgStorage,
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file JPEG/PNG yang diperbolehkan'), false);
    }
  },
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

// Mixed uploader: accepts PDF and Images, max 5MB
export const mixedDUpload = multer({
  storage: mixedStorage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Check both mimetype and file extension
    const isValidMimeType = allowed.includes(file.mimetype);
    const isValidExtension = ['.pdf', '.jpg', '.jpeg', '.png'].includes(fileExtension);
    
    if (isValidMimeType && isValidExtension) {
      cb(null, true);
    } else {
      console.log('File rejected:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        extension: fileExtension
      });
      cb(new Error(`Format file tidak didukung. File: ${file.originalname}, MimeType: ${file.mimetype}. Gunakan PDF, JPG, JPEG, atau PNG.`), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});