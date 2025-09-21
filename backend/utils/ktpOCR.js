import Tesseract from 'tesseract.js';
import cv from '@techstark/opencv-js';

class KTPOCR {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    this.worker = await Tesseract.createWorker('eng+ind');
    await this.worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ '
    });
  }

  async extractKTPInfo(imagePath) {
    if (!this.worker) {
      await this.initialize();
    }

    try {
      // Preprocess image untuk improve OCR accuracy
      const processedImagePath = await this.preprocessImage(imagePath);
      
      const { data } = await this.worker.recognize(processedImagePath);
      const text = data.text;
      
      // Ekstrak NIK dan Nama dari text
      const nik = this.extractNIK(text);
      const nama = this.extractNama(text);
      
      return { nik, nama, rawText: text };
    } catch (error) {
      console.error('OCR Error:', error);
      return { nik: null, nama: null, rawText: '', error: error.message };
    }
  }

  extractNIK(text) {
    // Pattern untuk NIK (16 digit angka)
    const nikPattern = /\b\d{16}\b/;
    const match = text.match(nikPattern);
    return match ? match[0] : null;
  }

  extractNama(text) {
    // Pattern untuk mencari "NAMA" atau variasi lainnya
    const namaPattern = /NAMA\s*[:\.]?\s*([A-Z\s]{5,})/i;
    const match = text.match(namaPattern);
    
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
    
    // Fallback: cari line dengan huruf kapital semua (potensi nama)
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.length > 5 && line === line.toUpperCase() && !line.match(/\d/) && !line.includes('PROVINSI') && !line.includes('KOTA')) {
        return line.trim();
      }
    }
    
    return null;
  }

  async preprocessImage(imagePath) {
    // Image preprocessing untuk improve OCR accuracy
    const imageData = fs.readFileSync(imagePath);
    const image = cv.imdecode(imageData);
    
    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    
    // Apply threshold
    const threshold = new cv.Mat();
    cv.threshold(gray, threshold, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    
    // Save processed image
    const processedPath = imagePath.replace('.', '_processed.');
    cv.imwrite(processedPath, threshold);
    
    // Clean up
    image.delete();
    gray.delete();
    threshold.delete();
    
    return processedPath;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}

export default KTPOCR;