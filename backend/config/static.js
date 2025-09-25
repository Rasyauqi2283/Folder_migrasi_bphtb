import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const staticConfig = (app) => {
    // Main public directory
    app.use(express.static(path.join(__dirname, "public")));
    
    // Specific static routes for uploaded files - menggunakan path yang benar
    app.use('/penting_F_simpan', express.static(path.join(__dirname, '..', '..', 'public', 'penting_F_simpan')));
    app.use('/file_paraf', express.static(path.join(__dirname, '..', '..', 'public', 'file_paraf')));
    app.use('/libs', express.static(path.join(__dirname, '..', '..', 'public', 'Peneliti', 'ParafKasie-sspd', 'libs')));
    
    console.log('📁 [STATIC] Static routes configured:');
    console.log('📁 [STATIC] - /penting_F_simpan ->', path.join(__dirname, '..', '..', 'public', 'penting_F_simpan'));
    console.log('📁 [STATIC] - /file_paraf ->', path.join(__dirname, '..', '..', 'public', 'file_paraf'));
    console.log('📁 [STATIC] - /libs ->', path.join(__dirname, '..', '..', 'public', 'Peneliti', 'ParafKasie-sspd', 'libs'));
};