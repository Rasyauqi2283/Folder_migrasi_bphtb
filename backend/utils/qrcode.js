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

// Enhanced QR generation with nomor validasi for uniqueness
export async function generateQrWithValidasi({ 
  basePayload, 
  nomorValidasi, 
  filename, 
  size = 256 
}) {
  if (!basePayload || !nomorValidasi) {
    throw new Error('basePayload dan nomorValidasi wajib diisi');
  }
  
  // Format: basePayload + | + nomorValidasi
  const enhancedPayload = `${basePayload}|${nomorValidasi}`;
  
  const buf = await generateQrBuffer(enhancedPayload, size);
  const publicDir = path.resolve(process.cwd(), 'public');
  const outDir = path.join(publicDir, 'penting_F_simpan', 'qr_code_place');
  await fs.promises.mkdir(outDir, { recursive: true });
  
  const safeFilename = (String(filename || 'qr').replace(/[^A-Za-z0-9_\-\.]/g, '_')) + '.png';
  const outPath = path.join(outDir, safeFilename);
  await fs.promises.writeFile(outPath, buf);
  
  return { 
    path: `/penting_F_simpan/qr_code_place/${safeFilename}`, 
    abs: outPath,
    payload: enhancedPayload,
    nomorValidasi 
  };
}

// Enhanced QR generation with database data
export async function generateQrWithValidasiFromDB({ 
  pool, 
  userid, 
  nomorValidasi, 
  filename, 
  size = 256 
}) {
  if (!pool || !userid || !nomorValidasi) {
    throw new Error('pool, userid, dan nomorValidasi wajib diisi');
  }
  
  try {
    // Generate payload dari database
    const enhancedPayload = await generateQrPayloadFromDB({ pool, userid, nomorValidasi });
    
    const buf = await generateQrBuffer(enhancedPayload, size);
    const publicDir = path.resolve(process.cwd(), 'public');
    const outDir = path.join(publicDir, 'penting_F_simpan', 'qr_code_place');
    await fs.promises.mkdir(outDir, { recursive: true });
    
    const safeFilename = (String(filename || 'qr').replace(/[^A-Za-z0-9_\-\.]/g, '_')) + '.png';
    const outPath = path.join(outDir, safeFilename);
    await fs.promises.writeFile(outPath, buf);
    
    return { 
      path: `/penting_F_simpan/qr_code_place/${safeFilename}`, 
      abs: outPath,
      payload: enhancedPayload,
      nomorValidasi,
      userid
    };
  } catch (error) {
    console.error('Error generating QR with DB data:', error);
    throw error;
  }
}

// Generate QR payload with dynamic user data + nomor validasi
export function generateQrPayload({ nomorValidasi, userData = null, customBase = null }) {
  let baseFormat;
  
  if (customBase) {
    baseFormat = customBase;
  } else if (userData) {
    // Format: NIP/TANGGAL/SPECIAL_PARAFV//E-BPHTB BAPPENDA KAB BOGOR
    const { nip, special_parafv, cert_date } = userData;
    const formattedDate = cert_date ? new Date(cert_date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID');
    baseFormat = `${nip}/${formattedDate}/${special_parafv}//E-BPHTB BAPPENDA KAB BOGOR`;
  } else {
    // Fallback ke format default jika tidak ada data
    baseFormat = "3218301223/17-10-2025/Ini ST. ESTE. MT//E-BPHTB BAPPENDA KAB BOGOR";
  }
  
  if (!nomorValidasi) {
    throw new Error('nomorValidasi wajib diisi untuk membuat QR unik');
  }
  
  return `${baseFormat}|${nomorValidasi}`;
}

// Generate QR payload dengan data user dari database
export async function generateQrPayloadFromDB({ pool, userid, nomorValidasi }) {
  if (!pool || !userid || !nomorValidasi) {
    throw new Error('pool, userid, dan nomorValidasi wajib diisi');
  }
  
  try {
    // Ambil data user dari a_2_verified_users
    const userQuery = `
      SELECT nip, special_parafv 
      FROM a_2_verified_users 
      WHERE userid = $1
    `;
    const userResult = await pool.query(userQuery, [userid]);
    
    if (userResult.rows.length === 0) {
      throw new Error(`User dengan userid ${userid} tidak ditemukan`);
    }
    
    const userData = userResult.rows[0];
    
    // Ambil tanggal pembuatan sertifikat terbaru dari pv_local_certs
    const certQuery = `
      SELECT created_at 
      FROM pv_local_certs 
      WHERE userid = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const certResult = await pool.query(certQuery, [userid]);
    
    const certDate = certResult.rows.length > 0 ? certResult.rows[0].created_at : new Date();
    
    // Generate payload dengan data real
    const userDataForQR = {
      nip: userData.nip || '3218301223',
      special_parafv: userData.special_parafv || 'Ini ST. ESTE. MT',
      cert_date: certDate
    };
    
    return generateQrPayload({ nomorValidasi, userData: userDataForQR });
    
  } catch (error) {
    console.error('Error generating QR payload from DB:', error);
    // Fallback ke format default jika ada error
    return generateQrPayload({ nomorValidasi });
  }
}