// 1. multer untuk upload ktp
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { validateKTPFile, saveSecureFile } from '../secure_storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direktori temporary untuk upload (akan dihapus setelah enkripsi)
const TEMP_UPLOAD_PATH = path.join(__dirname, '..', '..', 'temp_uploads');

// Pastikan direktori temp ada
if (!fs.existsSync(TEMP_UPLOAD_PATH)) {
    fs.mkdirSync(TEMP_UPLOAD_PATH, { recursive: true });
    if (process.env.STARTUP_QUIET !== '1') console.log('📁 [SECURE] Temp upload directory created:', TEMP_UPLOAD_PATH);
} else {
    if (process.env.STARTUP_QUIET !== '1') console.log('📁 [SECURE] Temp upload directory already exists:', TEMP_UPLOAD_PATH);
}

// Konfigurasi multer untuk temporary storage
const tempStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, TEMP_UPLOAD_PATH);
    },
    filename: (_req, file, cb) => {
        // Generate nama file temporary yang aman
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(file.originalname).toLowerCase();
        const tempFilename = `temp_ktp_${timestamp}_${randomId}${ext}`;
        cb(null, tempFilename);
    }
});

// File filter yang lebih ketat
const secureFileFilter = (req, file, cb) => {
    try {
        console.log('🔍 [SECURE_FILTER] Validating file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        // Validasi MIME type
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimes.includes(file.mimetype)) {
            console.error('❌ [SECURE_FILTER] Invalid MIME type:', file.mimetype);
            return cb(new Error('INVALID_MIME_TYPE'), false);
        }
        
        // Validasi ekstensi
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            console.error('❌ [SECURE_FILTER] Invalid file extension:', fileExtension);
            return cb(new Error('INVALID_FILE_EXTENSION'), false);
        }
        
        console.log('✅ [SECURE_FILTER] File validation passed');
        cb(null, true);
    } catch (error) {
        console.error('❌ [SECURE_FILTER] Validation error:', error);
        cb(new Error('FILE_VALIDATION_ERROR'), false);
    }
};

// Middleware multer untuk upload KTP
export const secureUploadKTP = multer({
    storage: tempStorage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
        files: 1 // Hanya 1 file
    },
    fileFilter: secureFileFilter
});

// Middleware untuk memproses file KTP setelah upload
export const processKTPUpload = async (req, res, next) => {
    try {
        // Validasi email terlebih dahulu
        if (!req.body?.email) {
            console.log('🚫 [SECURE_UPLOAD] No email provided in form data');
            return res.status(400).json({
                success: false,
                message: 'Email harus disediakan untuk registrasi.'
            });
        }

        // Debug logging untuk file upload
        console.log('🔍 [SECURE_UPLOAD] Processing upload request:', {
            hasFile: !!req.file,
            email: req.body?.email,
            contentType: req.headers['content-type'],
            contentLength: req.headers['content-length']
        });

        if (!req.file) {
            console.error('❌ [SECURE_UPLOAD] No file detected in request');
            console.error('🔍 [SECURE_UPLOAD] Request details:', {
                body: req.body,
                files: req.files,
                headers: {
                    'content-type': req.headers['content-type'],
                    'content-length': req.headers['content-length']
                }
            });
            return res.status(400).json({
                success: false,
                message: 'File KTP tidak terdeteksi. Pastikan file dipilih dan formatnya JPEG/PNG.'
            });
        }

        console.log('✅ [SECURE_UPLOAD] File upload successful:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
        
        // Validasi file yang lebih ketat
        const validation = validateKTPFile(req.file);
        if (!validation.isValid) {
            // Hapus file temporary jika validasi gagal
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            return res.status(400).json({
                success: false,
                message: 'File KTP gagal diupload. Silakan coba lagi dengan file yang lebih kecil atau format yang berbeda.',
                errors: validation.errors
            });
        }
        
        // Simpan file dengan enkripsi
        // SELALU gunakan email dari form data untuk konsistensi dengan database
        const userId = req.body.email; // Email sudah divalidasi di atas
        
        console.log(`📧 [SECURE_UPLOAD] Processing KTP for user: ${userId}`);
        console.log(`📁 [SECURE_UPLOAD] Will create/use directory: secure_storage/ktp/${userId}/`);
        
        // Debug session data dan form data
        console.log('🔍 [DEBUG] Upload context:', {
            hasSession: !!req.session,
            hasUser: !!req.session?.user,
            formEmail: req.body?.email,
            finalUserId: userId,
            requestType: 'registration-only',
            logic: 'email-based-identifier'
        });
        
        const secureFile = await saveSecureFile(req.file, userId);
        
        // Tambahkan informasi file yang sudah dienkripsi ke request
        req.secureFile = secureFile;
        
        next();
        
    } catch (error) {
        console.error('🔒 [SECURE] Error processing KTP upload:', error);
        console.error('🔒 [SECURE] Error details:', {
            message: error.message,
            stack: error.stack,
            email: req.body?.email,
            hasFile: !!req.file,
            fileDetails: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : null
        });
        
        // Hapus file temporary jika ada error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        // Return specific error message based on error type
        let errorMessage = 'File KTP gagal diupload. Silakan coba lagi dengan file yang lebih kecil atau format yang berbeda.';
        let statusCode = 500;
        
        if (error.message.includes('Invalid userId')) {
            errorMessage = 'Email tidak valid untuk upload file KTP.';
            statusCode = 400;
        } else if (error.message.includes('Gagal mengenkripsi')) {
            errorMessage = 'Gagal memproses file KTP. Silakan coba lagi.';
            statusCode = 500;
        } else if (error.message.includes('File path is required')) {
            errorMessage = 'File KTP tidak terdeteksi. Silakan pilih file yang valid.';
            statusCode = 400;
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware untuk mendapatkan file KTP (hanya admin)
export const getSecureKTP = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.query.userId;
        const requesterRole = req.session?.user?.role || 'user';
        
        if (!fileId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Parameter fileId dan userId diperlukan'
            });
        }
        
        // Import fungsi getSecureFile secara dinamis untuk menghindari circular dependency
        const { getSecureFile } = await import('../secure_storage.js');
        const secureFile = await getSecureFile(fileId, userId, requesterRole);
        
        // Set header untuk download
        res.setHeader('Content-Type', secureFile.metadata.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${secureFile.metadata.originalName}"`);
        res.setHeader('Content-Length', secureFile.data.length);
        
        res.send(secureFile.data);
        
    } catch (error) {
        console.error('🔒 [SECURE] Error getting secure KTP:', error);
        
        if (error.message.includes('Akses ditolak')) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: Anda tidak memiliki izin untuk mengakses file ini'
            });
        }
        
        if (error.message.includes('tidak ditemukan')) {
            return res.status(404).json({
                success: false,
                message: 'File tidak ditemukan'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil file'
        });
    }
};

export default secureUploadKTP;
