import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const staticConfig = (app) => {
    // Root aplikasi E-BPHTB (tempat index.js, backend/, public/)
    const projectRoot = path.join(__dirname, '..', '..');
    const publicDir = path.join(projectRoot, 'public');
    const backendDir = path.join(projectRoot, 'backend');
    app.use(express.static(publicDir));
    
    // Specific static routes for uploaded files - menggunakan path yang benar
    // HAPUS: Tidak lagi expose folder KTP secara langsung
    app.use('/penting_F_simpan', express.static(path.join(publicDir, 'penting_F_simpan')));
    app.use('/file_paraf', express.static(path.join(publicDir, 'file_paraf')));
    app.use('/libs', express.static(path.join(publicDir, 'Peneliti', 'ParafKasie-sspd', 'libs')));
    
    // Railway storage static route (renamed to ppat)
    app.use('/storage/ppat', express.static(path.join(backendDir, 'storage', 'ppat')));
    
    if (process.env.STARTUP_QUIET !== '1') {
      console.log('📁 [STATIC] Static routes configured:');
      console.log('📁 [STATIC] - Main public directory ->', publicDir);
      console.log('📁 [STATIC] - /penting_F_simpan ->', path.join(publicDir, 'penting_F_simpan'));
      console.log('📁 [STATIC] - /file_paraf ->', path.join(publicDir, 'file_paraf'));
      console.log('📁 [STATIC] - /libs ->', path.join(publicDir, 'Peneliti', 'ParafKasie-sspd', 'libs'));
      console.log('📁 [STATIC] - /storage/ppat ->', path.join(backendDir, 'storage', 'ppat'));
      console.log('🔒 [SECURE] KTP files are now protected and not accessible via direct URL');
    }
};