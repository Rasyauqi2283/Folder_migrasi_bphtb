// Uploadcare Routes
import express from 'express';
import { 
  createUploadcareUploadHandler, 
  createUploadcarePDFUploadHandler, 
  createUploadcareProxyEndpoint,
  upload 
} from './uploadcare_ppat.js';

const router = express.Router();

// Uploadcare file upload endpoint (multiple files)
router.post('/uploadcare-upload', upload.fields([
  { name: 'aktaTanah', maxCount: 1 },
  { name: 'sertifikatTanah', maxCount: 1 },
  { name: 'pelengkap', maxCount: 1 }
]), createUploadcareUploadHandler());

// Uploadcare PDF upload endpoint (single file)
router.post('/uploadcare-pdf-upload', upload.single('pdfFile'), createUploadcarePDFUploadHandler());

// Uploadcare proxy endpoint (for file access with transformations)
router.get('/uploadcare-proxy', createUploadcareProxyEndpoint());

// Health check endpoint
router.get('/uploadcare-health', (req, res) => {
  res.json({
    success: true,
    message: 'Uploadcare service is running',
    timestamp: new Date().toISOString(),
    service: 'uploadcare-ppat'
  });
});

export default router;
