//untuk submit CSR

import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { pool } from '../../db.js';

export default function certRequestRoutes(app) {
    //Get sertifikat
    app.get('/api/v1/sign/cert/:id', async (req, res) => {
        const { csr } = req.body;
        const { userid } = req.user;
        const { nobooking } = req.params;
    });

    //Revoke sertifikat
    app.post('/api/v1/sign/cert/revoke', async (req, res) => {
        const { id } = req.params;
        const { userid } = req.user;
        const { nobooking } = req.params;
        const { csr } = req.body;

    //Download sertifikat
    app.get('/api/v1/sign/cert/download/:id', async (req, res) => {
        const { id } = req.params;
        const { userid } = req.user;
        const { nobooking } = req.params;
        const { csr } = req.body;
    });
    });
}
