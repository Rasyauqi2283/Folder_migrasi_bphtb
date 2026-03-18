/**
 * Client for KTP Scanner Python microservice (DL/ML).
 * Falls back to local KTPOCR (Tesseract) if service is down or errors.
 */

import fs from 'fs';
import path from 'path';

const KTP_OCR_SERVICE_URL = process.env.KTP_OCR_SERVICE_URL || 'http://localhost:8001';
const REQUEST_TIMEOUT_MS = 45000; // 45s to leave room before route timeout

/**
 * Call Python KTP scanner service POST /scan with multipart form 'fotoktp'.
 * @param {string} imagePath - Path to uploaded KTP image file
 * @returns {Promise<object|null>} Result object (same shape as KTPOCR.extract) or null on failure
 */
export async function scanViaService(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    return null;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const filename = path.basename(imagePath);
    const formData = new FormData();
    formData.append('fotoktp', new Blob([fileBuffer]), filename);
    const res = await fetch(`${KTP_OCR_SERVICE_URL}/scan`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // Let fetch set Content-Type with boundary for FormData
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const text = await res.text();
      console.warn(`[KTP OCR Client] Service returned ${res.status}: ${text.substring(0, 200)}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[KTP OCR Client] Request timeout');
    } else {
      console.warn('[KTP OCR Client] Service error:', err.message);
    }
    return null;
  }
}

/**
 * Run KTP OCR: try Python service first, fallback to local Tesseract.
 * @param {string} imagePath - Path to uploaded KTP image file
 * @returns {Promise<object>} Result with nik, nama, ttl, ... stats (same as KTPOCR.extract)
 */
export async function extractKTPWithFallback(imagePath) {
  const serviceResult = await scanViaService(imagePath);
  if (serviceResult && !serviceResult.error) {
    return serviceResult;
  }
  const KTPOCR = (await import('./ktpOCR.js')).default;
  return KTPOCR.extract(imagePath);
}
