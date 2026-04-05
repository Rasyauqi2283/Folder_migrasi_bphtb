/**
 * Client for KTP Scanner Python microservice (DL/ML).
 * Falls back to local KTPOCR (Tesseract) if service is down or errors.
 *
 * LOKASI MIGRASI: E-BPHTB_MIgration/migrated/node/utils/ktpOCRClient.js
 */

import fs from 'fs';
import path from 'path';

const KTP_OCR_SERVICE_URL = process.env.KTP_OCR_SERVICE_URL || 'http://localhost:8001';
const REQUEST_TIMEOUT_MS = 45000;

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

export async function extractKTPWithFallback(imagePath) {
  const serviceResult = await scanViaService(imagePath);
  if (serviceResult && !serviceResult.error) {
    return serviceResult;
  }
  const KTPOCR = (await import('./ktpOCR.js')).default;
  return KTPOCR.extract(imagePath);
}
