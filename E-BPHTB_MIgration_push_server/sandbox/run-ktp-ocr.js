#!/usr/bin/env node
/**
 * Sandbox: uji KTP OCR (modul migrasi).
 * Dari root repo: node E-BPHTB_MIgration/sandbox/run-ktp-ocr.js <path-gambar-ktp>
 * Contoh: node E-BPHTB_MIgration/sandbox/run-ktp-ocr.js ./sample_ktp.jpg
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = process.argv[2];

if (!imagePath) {
  console.log('Usage: node E-BPHTB_MIgration/sandbox/run-ktp-ocr.js <path-gambar-ktp>');
  process.exit(1);
}

const resolvedPath = path.isAbsolute(imagePath) ? imagePath : path.resolve(process.cwd(), imagePath);

async function main() {
  const modulePath = path.join(__dirname, '../migrated/node/utils/ktpOCR.js');
  const mod = await import(pathToFileURL(modulePath).href);
  const KTPOCR = mod.default;
  console.log('Running KTP OCR (migrated module)...');
  console.log('Image:', resolvedPath);
  try {
    const result = await KTPOCR.extract(resolvedPath);
    console.log('\n--- Hasil ---');
    console.log('nik:', result.nik);
    console.log('nama:', result.nama);
    console.log('ttl:', result.ttl);
    console.log('alamat:', result.alamat);
    console.log('jenisKelamin:', result.jenisKelamin);
    console.log('golonganDarah:', result.golonganDarah);
    console.log('agama:', result.agama);
    console.log('statusPerkawinan:', result.statusPerkawinan);
    console.log('stats:', result.stats);
    if (result.error) console.log('error:', result.error);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
