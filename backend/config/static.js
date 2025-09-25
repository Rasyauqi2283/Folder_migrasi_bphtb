import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const staticConfig = (app) => {
    // Main public directory
    app.use(express.static(path.join(__dirname, "public")));
    
    // Specific static routes for uploaded files
    app.use('/penting_F_simpan', express.static(path.join(__dirname, '..', '..', 'public', 'penting_F_simpan')));
    app.use('/pdf', express.static(path.join(__dirname, '..', '..', 'public', 'penting_F_simpan', 'folder_input_sspd', 'pdf')));
    app.use('/images', express.static(path.join(__dirname, '..', '..', 'public', 'penting_F_simpan', 'folder_input_sspd', 'images')));
    app.use('/file_paraf', express.static(path.join(__dirname, '..', '..', 'public', 'file_paraf')));
    app.use('/libs', express.static(path.join(__dirname, '..', '..', 'public', 'Peneliti', 'ParafKasie-sspd', 'libs')));
    
    console.log('📁 [STATIC] Static routes configured:');
    console.log('📁 [STATIC] - /penting_F_simpan ->', path.join(__dirname, '..', '..', 'public', 'penting_F_simpan'));
    console.log('📁 [STATIC] - /pdf ->', path.join(__dirname, '..', '..', 'public', 'penting_F_simpan', 'folder_input_sspd', 'pdf'));
    console.log('📁 [STATIC] - /images ->', path.join(__dirname, '..', '..', 'public', 'penting_F_simpan', 'folder_input_sspd', 'images'));
};