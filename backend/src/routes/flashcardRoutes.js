import express from 'express';
import { getFlashcards, createFlashcard, generateAIFlashcards, reviewFlashcard, deleteFlashcard } from '../controllers/flashcardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFlashcards)
  .post(protect, createFlashcard);

router.route('/generate')
  .post(protect, generateAIFlashcards);

router.route('/:id/review')
  .put(protect, reviewFlashcard);

router.route('/:id')
  .delete(protect, deleteFlashcard);

export default router;
