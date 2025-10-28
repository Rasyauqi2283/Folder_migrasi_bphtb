import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const staticConfig = (app) => {
    // Main public directory - perbaiki path ke root project
    const projectRoot = path.join(__dirname, '..', '..');
    app.use(express.static(path.join(projectRoot, "public")));
    
    // Specific static routes for uploaded files - menggunakan path yang benar
    // HAPUS: Tidak lagi expose folder KTP secara langsung
    app.use('/penting_F_simpan', express.static(path.join(projectRoot, 'public', 'penting_F_simpan')));
    app.use('/file_paraf', express.static(path.join(projectRoot, 'public', 'file_paraf')));
    app.use('/libs', express.static(path.join(projectRoot, 'public', 'Peneliti', 'ParafKasie-sspd', 'libs')));
    
    // Railway storage static route (renamed to ppat)
    app.use('/storage/ppat', express.static(path.join(projectRoot, 'backend', 'storage', 'ppat')));
    
    console.log('📁 [STATIC] Static routes configured:');
    console.log('📁 [STATIC] - Main public directory ->', path.join(projectRoot, 'public'));
    console.log('📁 [STATIC] - /penting_F_simpan ->', path.join(projectRoot, 'public', 'penting_F_simpan'));
    console.log('📁 [STATIC] - /file_paraf ->', path.join(projectRoot, 'public', 'file_paraf'));
    console.log('📁 [STATIC] - /libs ->', path.join(projectRoot, 'public', 'Peneliti', 'ParafKasie-sspd', 'libs'));
    console.log('📁 [STATIC] - /storage/ppat ->', path.join(projectRoot, 'backend', 'storage', 'ppat'));
    console.log('🔒 [SECURE] KTP files are now protected and not accessible via direct URL');
};