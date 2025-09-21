// routes/userRoutes.js
import express from 'express';
import {
  generateUserIdHandler,
  assignUserIdHandler,
  getCompleteUsersHandler,
  getPendingUsersHandler
} from './userController.js';

const router = express.Router();

router.post('/generate-userid', generateUserIdHandler);
router.post('/assign-userid-and-divisi', assignUserIdHandler);
router.get('/complete', getCompleteUsersHandler);
router.get('/pending', getPendingUsersHandler);

export default router;