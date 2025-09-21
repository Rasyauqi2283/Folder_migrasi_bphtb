import cv from '@techstark/opencv-js';
import fs from 'fs';

class ImageValidator {
  constructor() {
    this.initializeOpenCV();
  }

  initializeOpenCV() {
    console.log('OpenCV.js initialized for KTP validation');
  }

  async validateKTP(imagePath, options = {}) {
    const {
      maxSkewAngle = 5,
      minLineConfidence = 100,
      minResolution = 480,       // Dinaikkan dari 500 ke 480
      maxAspectRatio = 1.7,
      minAspectRatio = 1.5,
      minWidth = 480,
      minHeight = 300
    } = options;

    try {
      const imageData = fs.readFileSync(imagePath);
      const image = cv.imdecode(imageData);

      if (image.empty()) {
        return {
          isValid: false,
          errors: ['Gambar tidak dapat dibaca atau format tidak didukung']
        };
      }

      // Periksa resolusi
      const width = image.cols;
      const height = image.rows;
      
      if (width < minWidth || height < minHeight) {
        image.delete();
        return {
          isValid: false,
          errors: [
            `Resolusi gambar terlalu rendah.`, 
            `Minimal ${minWidth}x${minHeight}px,`,
            `Anda: ${width}x${height}px`
          ].join(' ')
        };
      }

      // Periksa aspect ratio
      const aspectRatio = width / height;
      if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
        image.delete();
        return {
          isValid: false,
          errors: [
            `Proporsi gambar tidak sesuai.`, 
            `Harus antara ${minAspectRatio}:1 hingga ${maxAspectRatio}:1,`,
            `Anda: ${aspectRatio.toFixed(2)}:1`
          ].join(' ')
        };
      }

      // Konversi ke grayscale
      const gray = new cv.Mat();
      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);

      // Deteksi tepi
      const edges = new cv.Mat();
      cv.Canny(gray, edges, 50, 150);

      // Deteksi garis
      const lines = new cv.Mat();
      cv.HoughLines(edges, lines, 1, Math.PI / 180, minLineConfidence);

      // Analisis hasil
      const validationResult = this.analyzeKTP(lines, width, height, maxSkewAngle);

      // Bersihkan memory
      image.delete();
      gray.delete();
      edges.delete();
      lines.delete();

      return validationResult;

    } catch (error) {
      console.error('Error validating KTP:', error);
      return {
        isValid: false,
        errors: ['Terjadi kesalahan dalam memvalidasi KTP']
      };
    }
  }

  analyzeKTP(lines, width, height, maxSkewAngle) {
    const errors = [];
    const angles = [];

    if (lines.rows === 0) {
      errors.push('Tidak dapat mendeteksi garis pada KTP. Pastikan KTP terlihat jelas, tidak blur, dan memiliki kontras yang baik.');
      return { 
        isValid: false, 
        errors, 
        angle: 0, 
        resolution: { width, height } 
      };
    }

    // Analisis sudut garis
    for (let i = 0; i < lines.rows; i++) {
      const rho = lines.data32F[i * 2];
      const theta = lines.data32F[i * 2 + 1];
      const angle = theta * 180 / Math.PI;
      const normalizedAngle = angle > 90 ? angle - 180 : angle;
      
      // Hanya tambahkan angles yang signifikan
      if (Math.abs(normalizedAngle) > 2) {
        angles.push(normalizedAngle);
      }
    }

    if (angles.length === 0) {
      errors.push('KTP sudah cukup lurus, tetapi pastikan semua informasi terbaca jelas');
      return { 
        isValid: true, // Masih dianggap valid
        errors: [],
        angle: 0,
        resolution: { width, height }
      };
    }

    // Hitung rata-rata sudut
    const avgAngle = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;

    // Periksa kemiringan
    if (Math.abs(avgAngle) > maxSkewAngle) {
      errors.push(`KTP terlalu miring (${avgAngle.toFixed(2)}°). Maksimal kemiringan: ${maxSkewAngle}°. Silakan ambil foto ulang dengan KTP yang lurus.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      angle: avgAngle,
      resolution: { width, height }
    };
  }
}

export default ImageValidator;