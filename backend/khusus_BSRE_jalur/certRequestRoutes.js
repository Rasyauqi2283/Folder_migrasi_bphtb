//untuk submit CSR

import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { pool } from '../../db.js';

export default function certRequestRoutes(app) {
    //submit CSR
    app.post('/api/v1/sign/cert-requests', async (req, res) => {
        const { csr } = req.body;
        const { userid } = req.user;
        const { nobooking } = req.params;
    });

    //get RequestCSR
    app.get('/api/v1/sign/cert-requests/:id', async (req, res) => {
        const { id } = req.params;
        const { userid } = req.user;
        const { nobooking } = req.params;
        const { csr } = req.body;
    });
}
