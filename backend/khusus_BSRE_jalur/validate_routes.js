//untuk submit CSR

import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { pool } from '../../db.js';

export default function certRequestRoutes(app) {
    //Validate sertifikat
    app.post('/api/v1/sign/validate', async (req, res) => {
        const { csr } = req.body;
        const { userid } = req.user;
        const { nobooking } = req.params;
    });
    //Validate Document
    app.post('/api/v1/sign/validate/docx', async (req, res) => {
        const { document } = req.body;
        const { userid } = req.user;
        const { nobooking } = req.params;
    });
}
