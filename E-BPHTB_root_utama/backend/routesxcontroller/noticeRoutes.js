import express from 'express';
import { getActiveNotice, updateNotice } from '../routesxcontroller/noticeController.js';

const router = express.Router();

router.get('/', getActiveNotice);
router.post('/', updateNotice); // hanya admin
export default router;
