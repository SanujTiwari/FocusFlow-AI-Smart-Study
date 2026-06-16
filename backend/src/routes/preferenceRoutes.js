import express from 'express';
import { getPreference, updatePreference } from '../controllers/preferenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPreference).put(protect, updatePreference);

export default router;
