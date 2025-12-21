import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import cv from '@techstark/opencv-js';
import sharp from 'sharp';

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
      // Set parameters before any recognition
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO, // AUTO mode works better for KTP
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ .:-/',
        // Don't set tessedit_ocr_engine_mode here (causes error)
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
      // Reduced to 2 methods to prevent timeout (adaptive + otsu only)
      const preprocessingMethods = [
        () => this.preprocessImage(imagePath, 'otsu'), // Fastest and most reliable
        () => this.preprocessImage(imagePath, 'adaptive'),
        // Fallback: Direct OCR without preprocessing (fastest)
        () => Promise.resolve(fs.readFileSync(imagePath))
      ];

      let bestResult = null;
      let bestScore = 0;

      for (let i = 0; i < preprocessingMethods.length; i++) {
        const preprocessMethod = preprocessingMethods[i];
        try {
          const processedImage = await preprocessMethod();
          
          // OCR with timeout (reduced to 20 seconds per method to prevent 502)
          const { data } = await Promise.race([
            this.worker.recognize(processedImage),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('OCR timeout')), 20000)
            )
          ]);

          const text = data.text;
          const confidence = data.confidence || 0;

          // Log raw OCR text for debugging (first 500 chars)
          if (i === 0) {
            console.log(`📝 [KTP OCR] Raw text (first 500 chars): ${text.substring(0, 500)}`);
          }

          // Extract fields
          const extracted = this.extractAllFields(text);
          extracted.confidence = confidence;
          extracted.method = i === preprocessingMethods.length - 1 ? 'direct' : ['adaptive', 'otsu', 'gaussian'][i] || 'unknown';
          
          // Log extracted data for debugging
          if (i === 0) {
            console.log(`🔍 [KTP OCR] Extracted NIK: ${extracted.nik}, Nama: ${extracted.nama}, Status: ${extracted.statusPerkawinan}`);
          }

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
        // Last resort: Try direct OCR on original file
        console.log('🔄 [KTP OCR] Trying direct OCR as last resort...');
        try {
          const originalBuffer = fs.readFileSync(imagePath);
          const { data } = await this.worker.recognize(originalBuffer);
          const extracted = this.extractAllFields(data.text);
          extracted.confidence = data.confidence || 0;
          extracted.method = 'direct_fallback';
          bestResult = extracted;
          bestScore = this.calculateScore(extracted, extracted.confidence);
        } catch (fallbackError) {
          throw new Error(`Semua metode preprocessing gagal: ${fallbackError.message}`);
        }
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
        jenisKelamin: null,
        golonganDarah: null,
        agama: null,
        statusPerkawinan: null,
        pekerjaan: null,
        kewarganegaraan: null,
        berlakuHingga: null,
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

  // Extract all fields at once (LENGKAP - termasuk field KTP Ohim)
  extractAllFields(text) {
    return {
      nik: this.extractNIK(text),
      nama: this.extractNama(text),
      ttl: this.extractTTL(text),
      alamat: this.extractAlamat(text),
      rtRw: this.extractRTRW(text),
      kelurahan: this.extractKelurahan(text),
      kecamatan: this.extractKecamatan(text),
      jenisKelamin: this.extractJenisKelamin(text),
      golonganDarah: this.extractGolonganDarah(text),
      agama: this.extractAgama(text),
      statusPerkawinan: this.extractStatusPerkawinan(text),
      pekerjaan: this.extractPekerjaan(text),
      kewarganegaraan: this.extractKewarganegaraan(text),
      berlakuHingga: this.extractBerlakuHingga(text),
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

  // Ekstrak Nama - Enhanced (untuk KTP Ohim)
  extractNama(text) {
    // Clean text first - remove common OCR errors
    const cleanedText = text
      .replace(/[^\w\s:\.\-]/g, ' ') // Remove special chars except : . -
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/[:\.]\s*/g, ' '); // Replace : and . with space
    
    const patterns = [
      // Pattern untuk "NAMA: MUCHAMMAD ABDUROHIM"
      /NAMA\s*[:\.]?\s*([A-Z][A-Z\s]{4,30})/i,
      // Pattern untuk "Nama: MUCHAMMAD ABDUROHIM"
      /Nama\s*[:\.]?\s*([A-Z][A-Z\s]{4,30})/i,
      // Pattern tanpa label, setelah NIK
      /(\d{16})\s+([A-Z][A-Z\s]{4,30})/i,
      // Pattern umum
      /NAMA\s+([A-Z][A-Z\s]{4,30})/i
    ];

    for (const pattern of patterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        let nama = (match[1] || match[2] || '').trim();
        
        // Clean nama: remove invalid characters
        nama = nama
          .replace(/[^A-Z\s]/g, '') // Only keep letters and spaces
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
        
        // Validation: should be 5-50 chars, mostly letters, no numbers
        if (nama.length >= 5 && nama.length <= 50 && 
            /^[A-Z\s]+$/.test(nama) && 
            !/\d/.test(nama)) {
          return nama;
        }
      }
    }

    // Fallback: find longest uppercase line without numbers (after NIK line)
    const lines = cleanedText.split('\n');
    let bestMatch = null;
    let longestLength = 0;
    let foundNIK = false;

    for (const line of lines) {
      // Check if this line contains NIK
      if (/\d{16}/.test(line)) {
        foundNIK = true;
        continue;
      }
      
      // After NIK, look for name
      if (foundNIK) {
        const trimmed = line.trim()
          .replace(/[^A-Z\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
          
        if (
          trimmed.length > longestLength &&
          trimmed.length >= 5 &&
          trimmed.length <= 50 &&
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

  // Ekstrak Alamat (termasuk RT/RW untuk format KTP Ohim)
  extractAlamat(text) {
    const patterns = [
      // Pattern untuk: "ALAMAT: KEDUNG BADAK NO.16"
      /ALAMAT\s*[:\.]?\s*([A-Z0-9\s,.-]{5,})/i,
      // Pattern untuk: "Alamat: ..."
      /Alamat\s*[:\.]?\s*([A-Z0-9\s,.-]{5,})/i,
      // Pattern untuk kombinasi: "ALAMAT: ... RT/RW: ..."
      /ALAMAT\s*[:\.]?\s*([A-Z0-9\s,.-]{5,})\s*RT\/RW/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let alamat = match[1].trim().replace(/\s+/g, ' ');
        // Hapus bagian RT/RW jika ikut terambil
        alamat = alamat.replace(/\s*RT\/RW.*$/i, '').trim();
        // Basic validation: should be reasonable length
        if (alamat.length >= 5 && (/\d/.test(alamat) || /[A-Z]/.test(alamat))) {
          return alamat;
        }
      }
    }

    return null;
  }

  // Ekstrak RT/RW (field terpisah untuk KTP Ohim)
  extractRTRW(text) {
    const patterns = [
      /RT\/RW\s*[:\.]?\s*(\d{3,4}\/\d{3,4})/i,
      /RT\/RW\s+(\d{3,4}\/\d{3,4})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Ekstrak Kelurahan/Desa
  extractKelurahan(text) {
    const patterns = [
      /KEL\/DESA\s*[:\.]?\s*([A-Z\s]{3,})/i,
      /Kel\/Desa\s*[:\.]?\s*([A-Z\s]{3,})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const kel = match[1].trim().replace(/\s+/g, ' ');
        if (kel.length >= 3) {
          return kel;
        }
      }
    }

    return null;
  }

  // Ekstrak Kecamatan
  extractKecamatan(text) {
    const patterns = [
      /KECAMATAN\s*[:\.]?\s*([A-Z\s]{3,})/i,
      /Kecamatan\s*[:\.]?\s*([A-Z\s]{3,})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const kec = match[1].trim().replace(/\s+/g, ' ');
        if (kec.length >= 3) {
          return kec;
        }
      }
    }

    return null;
  }

  // Ekstrak Jenis Kelamin
  extractJenisKelamin(text) {
    const patterns = [
      /JENIS\s+KE[LI]AMIN\s*[:\.]?\s*(LAKI-LAKI|PEREMPUAN|LAKI|PEREMPUAN)/i,
      /JK\s*[:\.]?\s*(LAKI-LAKI|PEREMPUAN|L|P)/i,
      /(LAKI-LAKI|PEREMPUAN)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const jk = match[1].toUpperCase();
        if (jk.includes('LAKI')) return 'Laki-laki';
        if (jk.includes('PEREMPUAN') || jk === 'P') return 'Perempuan';
        if (jk === 'L') return 'Laki-laki';
      }
    }

    return null;
  }

  // Ekstrak Golongan Darah
  extractGolonganDarah(text) {
    const patterns = [
      /GOL[\.]?\s*DARAH\s*[:\.]?\s*(A|B|AB|O|-\s*)/i,
      /DARAH\s*[:\.]?\s*(A|B|AB|O)/i,
      /\b(A|B|AB|O)\b(?=.*DARAH)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const darah = match[1].trim().toUpperCase();
        if (['A', 'B', 'AB', 'O'].includes(darah)) {
          return darah;
        }
      }
    }

    return null;
  }

  // Ekstrak Agama
  extractAgama(text) {
    const agamaList = ['ISLAM', 'KRISTEN', 'KATHOLIK', 'HINDU', 'BUDHA', 'KONGHUCU'];
    const patterns = [
      /AGAMA\s*[:\.]?\s*([A-Z]+)/i,
      /AGAMA\s+([A-Z]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const agama = match[1].trim().toUpperCase();
        for (const validAgama of agamaList) {
          if (agama.includes(validAgama) || validAgama.includes(agama)) {
            return validAgama;
          }
        }
      }
    }

    return null;
  }

  // Ekstrak Status Perkawinan (PENTING!)
  extractStatusPerkawinan(text) {
    const patterns = [
      // Pattern untuk format: "STATUS PERKAWINAN: BELUM KAWIN" (format KTP Ohim)
      /STATUS\s+PERKAWINAN\s*[:\.]?\s*(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)/i,
      // Pattern untuk format: "STATUS: BELUM KAWIN"
      /STATUS\s*[:\.]?\s*(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)/i,
      // Pattern untuk format: "BELUM KAWIN" (tanpa label)
      /\b(BELUM\s+KAWIN|KAWIN|CERAI\s+HIDUP|CERAI\s+MATI|JANDA|DUDA)\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const status = (match[1] || match[0]).trim().toUpperCase();
        
        // Normalize status dengan prioritas
        if (status.includes('BELUM') && status.includes('KAWIN')) {
          return 'Belum Kawin';
        }
        if (status.includes('CERAI') && status.includes('HIDUP')) {
          return 'Cerai Hidup';
        }
        if (status.includes('CERAI') && status.includes('MATI')) {
          return 'Cerai Mati';
        }
        if (status.includes('JANDA')) {
          return 'Janda';
        }
        if (status.includes('DUDA')) {
          return 'Duda';
        }
        if (status === 'KAWIN' || status.includes('KAWIN')) {
          return 'Kawin';
        }
      }
    }

    return null;
  }

  // Ekstrak Pekerjaan
  extractPekerjaan(text) {
    const patterns = [
      /PEKERJAAN\s*[:\.]?\s*([A-Z\s]{3,})/i,
      /PEKERJAAN\s+([A-Z\s]{3,})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const pekerjaan = match[1].trim().replace(/\s+/g, ' ');
        // Filter out common false positives
        if (pekerjaan.length >= 3 && 
            !pekerjaan.includes('WARGA') && 
            !pekerjaan.includes('NEGARA') &&
            !pekerjaan.includes('BERLAKU')) {
          return pekerjaan;
        }
      }
    }

    return null;
  }

  // Ekstrak Kewarganegaraan
  extractKewarganegaraan(text) {
    const patterns = [
      /KEWARGANEGARAAN\s*[:\.]?\s*(WNI|WNA|INDONESIA)/i,
      /WARGA\s+NEGARA\s*[:\.]?\s*(WNI|WNA|INDONESIA)/i,
      /\b(WNI|WNA)\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const warga = match[1].trim().toUpperCase();
        if (warga === 'WNI' || warga.includes('INDONESIA')) {
          return 'WNI';
        }
        if (warga === 'WNA') {
          return 'WNA';
        }
      }
    }

    return 'WNI'; // Default untuk KTP Indonesia
  }

  // Ekstrak Berlaku Hingga
  extractBerlakuHingga(text) {
    const patterns = [
      /BERLAKU\s+HINGGA\s*[:\.]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
      /BERLAKU\s*[:\.]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
      /SEUMUR\s+HIDUP/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].includes('SEUMUR HIDUP')) {
          return 'SEUMUR HIDUP';
        }
        if (match[1]) {
          return match[1].trim();
        }
      }
    }

    return null;
  }

  // Preprocess gambar dengan multiple methods
  async preprocessImage(imagePath, method = 'otsu') {
    // Try OpenCV first, fallback to Sharp if OpenCV fails
    let image;
    let useOpenCV = false;
    
    try {
      // Method 1: Try cv.imread (for Node.js OpenCV)
      if (typeof cv.imread === 'function') {
        try {
          image = cv.imread(imagePath);
          if (image && typeof image.empty === 'function' && !image.empty()) {
            useOpenCV = true;
          } else {
            throw new Error('cv.imread returned empty or invalid image');
          }
        } catch (imreadError) {
          throw new Error(`cv.imread failed: ${imreadError.message}`);
        }
      } 
      // Method 2: Try cv.imdecode (alternative method)
      else if (typeof cv.imdecode === 'function') {
        try {
          const imageData = fs.readFileSync(imagePath);
          image = cv.imdecode(imageData);
          if (image && typeof image.empty === 'function' && !image.empty()) {
            useOpenCV = true;
          } else {
            throw new Error('cv.imdecode returned empty or invalid image');
          }
        } catch (imdecodeError) {
          throw new Error(`cv.imdecode failed: ${imdecodeError.message}`);
        }
      } 
      // Method 3: Use Sharp for simple preprocessing (no OpenCV)
      else {
        console.warn('⚠️ [KTP OCR] OpenCV functions not available, using Sharp preprocessing');
        return await this.preprocessWithSharp(imagePath, method);
      }
    } catch (cvError) {
      console.warn(`⚠️ [KTP OCR] OpenCV error: ${cvError.message}, using Sharp fallback`);
      // Fallback to Sharp preprocessing
      return await this.preprocessWithSharp(imagePath, method);
    }

    // If we reach here, OpenCV is working
    if (!useOpenCV || !image) {
      return await this.preprocessWithSharp(imagePath, method);
    }

    // Final check: if image is not a cv.Mat, use Sharp
    if (!image || typeof image.empty !== 'function') {
      console.warn('⚠️ [KTP OCR] Invalid OpenCV image object, using Sharp fallback');
      return await this.preprocessWithSharp(imagePath, method);
    }

    let processed = new cv.Mat();

    try {
      // Convert to grayscale
      const gray = new cv.Mat();
      
      // Check if cv.cvtColor is available
      if (typeof cv.cvtColor !== 'function') {
        throw new Error('cv.cvtColor is not a function');
      }
      
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
      if (image && typeof image.delete === 'function') {
        image.delete();
      }
      if (processed && typeof processed.empty === 'function' && !processed.empty()) {
        processed.delete();
      }
      // Fallback to Sharp if OpenCV processing fails
      console.warn(`⚠️ [KTP OCR] OpenCV processing failed, using Sharp fallback: ${error.message}`);
      return await this.preprocessWithSharp(imagePath, method);
    }
  }

  // Preprocess dengan Sharp (fallback ketika OpenCV tidak tersedia) - ENHANCED
  async preprocessWithSharp(imagePath, method = 'otsu') {
    try {
      let pipeline = sharp(imagePath);

      switch (method) {
        case 'otsu':
          // Aggressive preprocessing for better OCR
          pipeline = pipeline
            .greyscale()
            .normalize() // Normalize brightness
            .linear(1.5, -(128 * 0.3)) // High contrast
            .modulate({ brightness: 1.1, saturation: 0 }) // Slightly brighter
            .sharpen({ sigma: 1.5, flat: 1, jagged: 2 }) // Aggressive sharpening
            .threshold(128, { grayscale: true }); // Binary threshold
          break;

        case 'gaussian':
          // Gaussian-like preprocessing
          pipeline = pipeline
            .greyscale()
            .normalize()
            .linear(1.3, -(128 * 0.25)) // Medium-high contrast
            .modulate({ brightness: 1.05 })
            .sharpen({ sigma: 1.2, flat: 1, jagged: 1.5 })
            .threshold(140, { grayscale: true });
          break;

        case 'adaptive':
          // Adaptive-like preprocessing
          pipeline = pipeline
            .greyscale()
            .normalize()
            .linear(1.4, -(128 * 0.28)) // High contrast
            .modulate({ brightness: 1.08 })
            .sharpen({ sigma: 1.8, flat: 1.2, jagged: 2.2 })
            .threshold(135, { grayscale: true });
          break;

        default:
          // Enhanced default
          pipeline = pipeline
            .greyscale()
            .normalize()
            .linear(1.2, -(128 * 0.2))
            .sharpen();
      }

      // Resize if too large (max 2000px width) for better OCR performance
      const metadata = await sharp(imagePath).metadata();
      if (metadata.width > 2000) {
        pipeline = pipeline.resize(2000, null, {
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        });
      }

      // Convert to PNG buffer for Tesseract
      const buffer = await pipeline.png({ 
        compressionLevel: 9,
        quality: 100 
      }).toBuffer();
      
      return buffer;

    } catch (error) {
      console.warn(`⚠️ [KTP OCR] Sharp preprocessing failed: ${error.message}, using original image`);
      // Last resort: return original file
      return fs.readFileSync(imagePath);
    }
  }

  // Get extraction statistics
  getExtractionStats(result) {
    const stats = {
      totalFields: 11, // nik, nama, ttl, alamat, jenisKelamin, golonganDarah, agama, statusPerkawinan, pekerjaan, kewarganegaraan, berlakuHingga
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
    if (result.jenisKelamin) stats.extractedFields++;
    if (result.golonganDarah) stats.extractedFields++;
    if (result.agama) stats.extractedFields++;
    if (result.statusPerkawinan) stats.extractedFields++;
    if (result.pekerjaan) stats.extractedFields++;
    if (result.kewarganegaraan) stats.extractedFields++;
    if (result.berlakuHingga) stats.extractedFields++;

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
