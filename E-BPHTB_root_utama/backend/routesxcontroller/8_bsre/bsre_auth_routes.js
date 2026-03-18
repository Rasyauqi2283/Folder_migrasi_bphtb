// BSRE Authentication Routes
import express from 'express';
import { pool } from '../../../db.js';
import { getAccessToken } from './bsre_service.js';

const router = express.Router();

// POST /api/bsre/auth - Get access token
router.post('/auth', async (req, res) => {
  try {
    const token = await getAccessToken(pool);
    return res.json({ success: true, token, expires_at: null });
  } catch (e) {
    console.error('BSRE auth error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mendapatkan token' });
  }
});

// GET /api/bsre/health - Health check
router.get('/health', async (_req, res) => {
  try {
    await getAccessToken(pool);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
});

export default router;