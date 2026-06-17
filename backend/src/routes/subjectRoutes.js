import express from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject, parseSyllabusText, parseSyllabusFile } from '../controllers/subjectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSubjects).post(protect, createSubject);
router.route('/:id').put(protect, updateSubject).delete(protect, deleteSubject);
router.route('/:id/syllabus/parse-text').post(protect, parseSyllabusText);
router.route('/:id/syllabus/parse-file').post(protect, parseSyllabusFile);

export default router;
