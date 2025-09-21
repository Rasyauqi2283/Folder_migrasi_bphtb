import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getFaqsPublic,
  createFaq,
  updateFaq,
  deleteFaq,
  uploadFaqImageHandler
} from './faqController.js';

const router = express.Router();

// Multer storage under public/uploads/faq
const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'faq');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `faq-${Date.now()}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Public GET
router.get('/', getFaqsPublic);

// Admin-guard for mutations
router.use((req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Administrator') {
    return res.sendStatus(403);
  }
  next();
});

router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);
router.post('/upload', upload.single('image'), uploadFaqImageHandler);

export default router;
