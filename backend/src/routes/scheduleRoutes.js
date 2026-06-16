import express from 'express';
import { 
  getSchedules, 
  generateSchedules, 
  getWeekly,
  markComplete,
  markSkipped,
  reschedule,
  getMissedCount
} from '../controllers/scheduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSchedules);
router.route('/generate').post(protect, generateSchedules);
router.route('/week').get(protect, getWeekly);
router.route('/reschedule').post(protect, reschedule);
router.route('/missed-count').get(protect, getMissedCount);
router.route('/:id/complete').put(protect, markComplete);
router.route('/:id/skip').put(protect, markSkipped);

export default router;
