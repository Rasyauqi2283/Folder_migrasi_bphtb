import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import cv from '@techstark/opencv-js';

class KTPOCR {
  constructor() {
    this.worker = null;
    this.initialized = false;
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp'];
  }

  // Init worker Tesseract
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.worker = await Tesseract.createWorker('eng+ind');
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ .:-',
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY
      });
      this.initialized = true;
      console.log('✅ KTP OCR initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize KTP OCR:', error);
      throw new Error('Failed to initialize OCR engine');
    }
  }

  // Validate file format and existence
  validateImageFile(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error('File tidak ditemukan');
    }

    const ext = path.extname(imagePath).toLowerCase();
    if (!this.supportedFormats.includes(ext)) {
      throw new Error(`Format file tidak didukung. Gunakan: ${this.supportedFormats.join(', ')}`);
    }

    const stats = fs.statSync(imagePath);
    if (stats.size === 0) {
      throw new Error('File kosong');
    }

    if (stats.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File terlalu besar (maksimal 10MB)');
    }

    return true;
  }

  // Pipeline utama OCR
  async extractKTPInfo(imagePath, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate file
      this.validateImageFile(imagePath);
      
      // Initialize if needed
      if (!this.initialized) {
        await this.initialize();
      }

      console.log(`🔍 [KTP OCR] Processing: ${path.basename(imagePath)}`);

      // Multiple preprocessing attempts for better accuracy
      const preprocessingMethods = [
        () => this.preprocessImage(imagePath, 'adaptive'),
        () => this.preprocessImage(imagePath, 'otsu'),
        () => this.preprocessImage(imagePath, 'gaussian')
      ];

      let bestResult = null;
      let bestScore = 0;

      for (const preprocessMethod of preprocessingMethods) {
        try {
          const processedImage = await preprocessMethod();
          
          // OCR with timeout
          const { data } = await Promise.race([
            this.worker.recognize(processedImage),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('OCR timeout')), 30000)
            )
          ]);

          const text = data.text;
          const confidence = data.confidence || 0;

          // Extract fields
          const extracted = this.extractAllFields(text);
          extracted.confidence = confidence;
          extracted.method = preprocessMethod.name || 'unknown';

          // Score based on confidence and completeness
          const score = this.calculateScore(extracted, confidence);
          
          if (score > bestScore) {
            bestScore = score;
            bestResult = extracted;
          }

          console.log(`📊 [KTP OCR] Method: ${extracted.method}, Score: ${score.toFixed(2)}, Confidence: ${confidence.toFixed(2)}`);

        } catch (methodError) {
          console.warn(`⚠️ [KTP OCR] Method failed:`, methodError.message);
          continue;
        }
      }

      if (!bestResult) {
        throw new Error('Semua metode preprocessing gagal');
      }

      const processingTime = Date.now() - startTime;
      bestResult.processingTime = processingTime;
      bestResult.filePath = imagePath;

      console.log(`✅ [KTP OCR] Completed in ${processingTime}ms, Best score: ${bestScore.toFixed(2)}`);
      
      return bestResult;

    } catch (error) {
      console.error('❌ [KTP OCR] Error:', error);
      return { 
        nik: null, 
        nama: null, 
        ttl: null,
        alamat: null,
        rawText: '', 
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Calculate extraction score
  calculateScore(extracted, confidence) {
    let score = confidence / 100; // Base score from OCR confidence
    
    // Bonus for each extracted field
    if (extracted.nik) score += 0.3;
    if (extracted.nama) score += 0.2;
    if (extracted.ttl) score += 0.15;
    if (extracted.alamat) score += 0.1;
    
    // Penalty for invalid NIK format
    if (extracted.nik && !this.validateNIK(extracted.nik)) {
      score -= 0.2;
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  // Validate NIK format
  validateNIK(nik) {
    if (!nik || nik.length !== 16) return false;
    
    // Check if all digits
    if (!/^\d{16}$/.test(nik)) return false;
    
    // Basic NIK validation (province, city, etc.)
    const province = nik.substring(0, 2);
    const city = nik.substring(2, 4);
    const district = nik.substring(4, 6);
    
    // Valid province codes (11-94 for Indonesian provinces)
    const validProvinces = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '31', '32', '33', '34', '35', '36', '51', '52', '53', '61', '62', '63', '64', '65', '71', '72', '73', '74', '75', '76', '81', '82', '91', '92', '93', '94'];
    
    return validProvinces.includes(province);
  }

  // Extract all fields at once
  extractAllFields(text) {
    return {
      nik: this.extractNIK(text),
      nama: this.extractNama(text),
      ttl: this.extractTTL(text),
      alamat: this.extractAlamat(text),
      rawText: text
    };
  }

  // Ekstrak NIK (16 digit) - Enhanced
  extractNIK(text) {
    // Multiple patterns for better detection
    const patterns = [
      /\b\d{16}\b/,                    // Standard 16 digits
      /NIK\s*[:\.]?\s*(\d{16})/i,      // NIK: 1234567890123456
      /NIK\s+(\d{16})/i                // NIK 1234567890123456
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const nik = match[1] || match[0];
        if (this.validateNIK(nik)) {
          return nik;
        }
      }
    }
    
    return null;
  }

  // Ekstrak Nama - Enhanced
  extractNama(text) {
    const patterns = [
      /NAMA\s*[:\.]?\s*([A-Z\s]{5,})/i,
      /Nama\s*[:\.]?\s*([A-Z\s]{5,})/i,
      /NAMA\s+([A-Z\s]{5,})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const nama = match[1].trim().replace(/\s+/g, ' ');
        // Basic validation: should be at least 3 characters and contain letters
        if (nama.length >= 3 && /[A-Z]/.test(nama)) {
          return nama;
        }
      }
    }

    // Fallback: find longest uppercase line without numbers
    const lines = text.split('\n');
    let bestMatch = null;
    let longestLength = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > longestLength &&
        trimmed.length >= 3 &&
        trimmed === trimmed.toUpperCase() &&
        !trimmed.match(/\d/) &&
        !trimmed.includes('PROVINSI') &&
        !trimmed.includes('KOTA') &&
        !trimmed.includes('KABUPATEN') &&
        !trimmed.includes('KECAMATAN') &&
        !trimmed.includes('KELURAHAN') &&
        !trimmed.includes('RT/RW') &&
        /[A-Z]/.test(trimmed)
      ) {
        bestMatch = trimmed;
        longestLength = trimmed.length;
      }
    }

    return bestMatch;
  }

  // Ekstrak TTL (Tanggal Lahir)
  extractTTL(text) {
    const patterns = [
      /TEMPAT\s+LAHIR\s*[:\.]?\s*([^,]+),\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
      /TEMPAT\s+LAHIR\s*[:\.]?\s*([^,]+),\s*(\d{1,2}\s+\w+\s+\d{4})/i,
      /TTL\s*[:\.]?\s*([^,]+),\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
      /TTL\s*[:\.]?\s*([^,]+),\s*(\d{1,2}\s+\w+\s+\d{4})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        return {
          tempat: match[1].trim(),
          tanggal: match[2].trim()
        };
      }
    }

    return null;
  }

  // Ekstrak Alamat
  extractAlamat(text) {
    const patterns = [
      /ALAMAT\s*[:\.]?\s*([A-Z0-9\s,.-]{10,})/i,
      /Alamat\s*[:\.]?\s*([A-Z0-9\s,.-]{10,})/i,
      /RT\/RW\s*[:\.]?\s*([A-Z0-9\s,.-]{10,})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const alamat = match[1].trim().replace(/\s+/g, ' ');
        // Basic validation: should be reasonable length and contain letters/numbers
        if (alamat.length >= 10 && (/\d/.test(alamat) || /[A-Z]/.test(alamat))) {
          return alamat;
        }
      }
    }

    return null;
  }

  // Preprocess gambar dengan multiple methods
  async preprocessImage(imagePath, method = 'otsu') {
    const imageData = fs.readFileSync(imagePath);
    const image = cv.imdecode(imageData);

    if (image.empty()) {
      throw new Error('Failed to decode image');
    }

    let processed = new cv.Mat();

    try {
      // Convert to grayscale
      const gray = new cv.Mat();
      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);

      switch (method) {
        case 'otsu':
          // Original Otsu thresholding
          cv.threshold(gray, processed, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
          break;

        case 'adaptive':
          // Adaptive thresholding
          cv.adaptiveThreshold(gray, processed, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
          break;

        case 'gaussian':
          // Gaussian blur + Otsu
          const blurred = new cv.Mat();
          cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);
          cv.threshold(blurred, processed, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
          blurred.delete();
          break;

        default:
          cv.threshold(gray, processed, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
      }

      // Additional noise reduction
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
      const cleaned = new cv.Mat();
      cv.morphologyEx(processed, cleaned, cv.MORPH_CLOSE, kernel);
      
      // Encode to PNG buffer
      const processedBuffer = cv.imencode('.png', cleaned);

      // Clean up
      image.delete();
      gray.delete();
      processed.delete();
      cleaned.delete();
      kernel.delete();

      return processedBuffer;

    } catch (error) {
      // Clean up on error
      image.delete();
      if (processed && !processed.empty()) {
        processed.delete();
      }
      throw new Error(`Preprocessing failed (${method}): ${error.message}`);
    }
  }

  // Get extraction statistics
  getExtractionStats(result) {
    const stats = {
      totalFields: 4, // nik, nama, ttl, alamat
      extractedFields: 0,
      confidence: result.confidence || 0,
      processingTime: result.processingTime || 0,
      isValidNIK: false,
      completeness: 0
    };

    if (result.nik) {
      stats.extractedFields++;
      stats.isValidNIK = this.validateNIK(result.nik);
    }
    if (result.nama) stats.extractedFields++;
    if (result.ttl) stats.extractedFields++;
    if (result.alamat) stats.extractedFields++;

    stats.completeness = (stats.extractedFields / stats.totalFields) * 100;

    return stats;
  }

  // Clean up temporary files (if any)
  cleanupTempFiles() {
    // This method can be extended to clean up any temporary files
    console.log('🧹 [KTP OCR] Cleanup completed');
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.initialized = false;
      console.log('🔄 [KTP OCR] Worker terminated');
    }
  }

  // Static method for quick extraction (creates new instance)
  static async extract(imagePath, options = {}) {
    const ocr = new KTPOCR();
    try {
      const result = await ocr.extractKTPInfo(imagePath, options);
      const stats = ocr.getExtractionStats(result);
      
      return {
        ...result,
        stats
      };
    } finally {
      await ocr.terminate();
    }
  }
}

export default KTPOCR;
