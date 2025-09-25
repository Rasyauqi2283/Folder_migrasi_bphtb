import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Konfigurasi enkripsi
if (!process.env.FILE_ENCRYPTION_KEY) {
    throw new Error("FILE_ENCRYPTION_KEY is not set in environment variables");
}
const ENCRYPTION_KEY_RAW = process.env.FILE_ENCRYPTION_KEY;
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_RAW, 'hex');

const ALGORITHM = 'aes-256-gcm';

// Direktori penyimpanan aman (di luar public)
const SECURE_STORAGE_PATH = path.join(__dirname, '..', '..', 'secure_storage');

// Pastikan direktori secure storage ada
if (!fs.existsSync(SECURE_STORAGE_PATH)) {
    fs.mkdirSync(SECURE_STORAGE_PATH, { recursive: true });
    console.log('🔒 [SECURE] Secure storage directory created:', SECURE_STORAGE_PATH);
}

/**
 * Enkripsi file dengan AES-256-GCM
 * @param {Buffer} data - Data file yang akan dienkripsi
 * @returns {Object} - {encrypted, iv, authTag}
 */
export function encryptFile(data) {
    try {
        const iv = crypto.randomBytes(12);
        
        const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        // Get auth tag from GCM (built-in authentication)
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv,
            authTag
        };
    } catch (error) {
        console.error('🔒 [SECURE] Encryption error:', error);
        throw new Error('Gagal mengenkripsi file');
    }
}

/**
 * Dekripsi file
 * @param {Buffer} encryptedData - Data terenkripsi
 * @param {Buffer} iv - Initialization Vector
 * @param {Buffer} authTag - Authentication Tag
 * @returns {Buffer} - Data asli
 */
export function decryptFile(encryptedData, iv, authTag) {
    try {
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
        
        // Set auth tag for GCM verification
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted;
    } catch (error) {
        console.error('🔒 [SECURE] Decryption error:', error);
        throw new Error('Gagal mendekripsi file');
    }
}

/**
 * Simpan file KTP dengan enkripsi
 * @param {Object} file - File dari multer
 * @param {string} userId - ID pengguna
 * @returns {Object} - {fileId, filePath, metadata}
 */
export async function saveSecureFile(file, userId) {
    try {
        // Baca file asli
        const originalData = fs.readFileSync(file.path);
        
        // Enkripsi file
        const { encrypted, iv, authTag } = encryptFile(originalData);
        
        // Generate unique file ID
        const fileId = crypto.randomUUID();
        const timestamp = Date.now();
        
        // Buat direktori user jika belum ada
        const userDir = path.join(SECURE_STORAGE_PATH, 'ktp', userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        
        // Path file terenkripsi
        const encryptedFilePath = path.join(userDir, `${fileId}_encrypted.bin`);
        
        // Simpan metadata enkripsi
        const metadata = {
            fileId,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: originalData.length,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            timestamp,
            userId
        };
        
        // Simpan file terenkripsi
        fs.writeFileSync(encryptedFilePath, encrypted);
        
        // Simpan metadata
        const metadataPath = path.join(userDir, `${fileId}_metadata.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        
        // Hapus file asli dari temp
        fs.unlinkSync(file.path);
        
        console.log('🔒 [SECURE] File saved securely:', fileId);
        
        return {
            fileId,
            filePath: encryptedFilePath,
            metadata
        };
        
    } catch (error) {
        console.error('🔒 [SECURE] Error saving secure file:', error);
        throw error;
    }
}

/**
 * Ambil file KTP dengan dekripsi (hanya untuk admin/authorized)
 * @param {string} fileId - ID file
 * @param {string} userId - ID pengguna yang meminta
 * @param {string} requesterRole - Role yang meminta file
 * @returns {Buffer} - Data file asli
 */
export async function getSecureFile(fileId, userId, requesterRole = 'user') {
    try {
        // Validasi akses berdasarkan role
        if (requesterRole !== 'admin' && requesterRole !== 'super_admin') {
            throw new Error('Akses ditolak: Role tidak memiliki izin');
        }
        
        const userDir = path.join(SECURE_STORAGE_PATH, 'ktp', userId);
        const metadataPath = path.join(userDir, `${fileId}_metadata.json`);
        const encryptedFilePath = path.join(userDir, `${fileId}_encrypted.bin`);
        
        // Cek apakah file ada
        if (!fs.existsSync(metadataPath) || !fs.existsSync(encryptedFilePath)) {
            throw new Error('File tidak ditemukan');
        }
        
        // Baca metadata
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        
        // Baca file terenkripsi
        const encryptedData = fs.readFileSync(encryptedFilePath);
        
        // Dekripsi file
        const iv = Buffer.from(metadata.iv, 'hex');
        const authTag = Buffer.from(metadata.authTag, 'hex');
        const decryptedData = decryptFile(encryptedData, iv, authTag);
        
        // Log akses file
        await logFileAccess(fileId, userId, requesterRole, 'READ', req);
        
        return {
            data: decryptedData,
            metadata
        };
        
    } catch (error) {
        console.error('🔒 [SECURE] Error getting secure file:', error);
        throw error;
    }
}

/**
 * Log akses file untuk audit
 * @param {string} fileId - ID file
 * @param {string} userId - ID pengguna
 * @param {string} requesterRole - Role yang mengakses
 * @param {string} action - Aksi yang dilakukan
 */
export async function logFileAccess(fileId, userId, requesterRole, action, req) {
    try {
        const logEntry = {
            timestamp: new Date().toISOString(),
            fileId,
            userId,
            requesterRole,
            action,
            ip: req.ip || null, // Bisa ditambahkan dari request
            userAgent: req.headers['user-agent'] || null // Bisa ditambahkan dari request
        };
        
        const logDir = path.join(SECURE_STORAGE_PATH, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFile = path.join(logDir, `file_access_${new Date().toISOString().split('T')[0]}.log`);
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFileSync(logFile, logLine);
        
        console.log('🔒 [SECURE] File access logged:', logEntry);
        
    } catch (error) {
        console.error('🔒 [SECURE] Error logging file access:', error);
    }
}

/**
 * Validasi file KTP yang lebih ketat
 * @param {Object} file - File dari multer
 * @returns {Object} - {isValid, errors}
 */
export function validateKTPFile(file) {
    const errors = [];
    
    // Validasi ukuran file (maksimal 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        errors.push('Ukuran file terlalu besar (maksimal 5MB)');
    }
    
    // Validasi tipe MIME
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
        errors.push('Format file tidak didukung (hanya JPEG/PNG)');
    }
    
    // Validasi ekstensi file
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        errors.push('Ekstensi file tidak valid');
    }
    
    // Deteksi magic number untuk memastikan file adalah gambar
    const buffer = fs.readFileSync(file.path);
    const isValidImage = (
        (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) || // JPEG
        (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) // PNG
    );
    
    if (!isValidImage) {
        errors.push('File bukan gambar yang valid');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export {
    SECURE_STORAGE_PATH,
    ENCRYPTION_KEY
};
