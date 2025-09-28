// tempat ini merupakan util untuk generate qrcode sederhana
// bagi pengguna user dari divisi 'Peneliti Validasi'

import fs from 'fs';
import path from 'path';

let QR;
try {
  QR = await import('qrcode');
} catch (_) {
  QR = null;
}

export async function generateQrBuffer(text, size = 256) {
  const payload = String(text || '').slice(0, 2048) || 'EMPTY';
  if (QR && QR.toBuffer) {
    return await QR.toBuffer(payload, { type: 'png', width: size, margin: 1 });
  }
  // Fallback: simple PNG placeholder (1x1) if lib is unavailable
  // PNG: 1x1 transparent pixel
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBgF+1C1EAAAAASUVORK5CYII=',
    'base64'
  );
}

export async function saveQrToPublic({ filename, text, size = 256 }) {
  const buf = await generateQrBuffer(text, size);
  const publicDir = path.resolve(process.cwd(), 'public');
  const outDir = path.join(publicDir, 'penting_F_simpan', 'qr_code_place');
  await fs.promises.mkdir(outDir, { recursive: true });
  const safe = (String(filename || 'qr').replace(/[^A-Za-z0-9_\-\.]/g, '_')) + '.png';
  const outPath = path.join(outDir, safe);
  await fs.promises.writeFile(outPath, buf);
  return { path: `/penting_F_simpan/qr_code_place/${safe}`, abs: outPath };
}
