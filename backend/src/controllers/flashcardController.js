import Flashcard from '../models/Flashcard.js';
import Subject from '../models/Subject.js';
import { generateFlashcardsForSubject } from '../services/geminiService.js';
import { Op } from 'sequelize';

export const getFlashcards = async (req, res) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.subjectId) {
      where.subjectId = req.query.subjectId;
    }
    
    // Check if user requested only "due" cards
    if (req.query.due === 'true') {
      where.nextReviewDate = {
        [Op.lte]: new Date()
      };
    }

    const flashcards = await Flashcard.findAll({
      where,
      include: [{ model: Subject, as: 'Subject' }],
      order: [['nextReviewDate', 'ASC']]
    });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFlashcard = async (req, res) => {
  const { subjectId, front, back } = req.body;
  try {
    const subject = await Subject.findByPk(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const flashcard = await Flashcard.create({
      userId: req.user.id,
      subjectId,
      front,
      back,
      nextReviewDate: new Date()
    });
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const generateAIFlashcards = async (req, res) => {
  const { subjectId, chapters } = req.body;
  try {
    const subject = await Subject.findByPk(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    if (!chapters || chapters.length === 0) {
      return res.status(400).json({ message: 'Please select at least one chapter/topic' });
    }

    // Call Gemini API to generate QA pairs
    const cards = await generateFlashcardsForSubject(subject.subjectName, chapters);

    if (!Array.isArray(cards)) {
      return res.status(400).json({ message: 'AI returned an invalid layout. Please try again.' });
    }

    const flashcardRecords = cards.map(c => {
      const frontText = c.front || c.question || c.concept || c.q || '';
      const backText = c.back || c.answer || c.explanation || c.a || '';
      
      if (!frontText.trim() || !backText.trim()) {
        return null; // Skip invalid pairs
      }

      return {
        userId: req.user.id,
        subjectId,
        front: frontText.trim(),
        back: backText.trim(),
        nextReviewDate: new Date(),
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0
      };
    }).filter(Boolean);

    if (flashcardRecords.length === 0) {
      return res.status(400).json({ message: 'AI was unable to generate any valid Q&A flashcards' });
    }

    const newFlashcards = await Flashcard.bulkCreate(flashcardRecords);
    res.status(201).json({ message: 'Flashcards generated successfully', count: newFlashcards.length, data: newFlashcards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewFlashcard = async (req, res) => {
  const { rating } = req.body; // AGAIN, HARD, GOOD, EASY
  try {
    const flashcard = await Flashcard.findByPk(req.params.id);
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });
    if (flashcard.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    let { repetitions, easeFactor, interval } = flashcard;

    if (rating === 'AGAIN') {
      repetitions = 0;
      interval = 0; // Show again today/soon
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'HARD') {
      repetitions = 1;
      interval = 1; // 1 day
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 'GOOD') {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 4;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    } else if (rating === 'EASY') {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 3;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      easeFactor = Math.min(5.0, easeFactor + 0.15);
    } else {
      return res.status(400).json({ message: 'Invalid rating. Expected: AGAIN, HARD, GOOD, or EASY' });
    }

    const nextReviewDate = new Date();
    // Calculate next date (0 means review again today, which we can simulate by adding a small time window e.g. 5 minutes, or just keeping nextReviewDate as now)
    if (interval > 0) {
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);
      nextReviewDate.setHours(0, 0, 0, 0); // Start of day review
    } else {
      // AGAIN cards should be reviewed again immediately in current session
      // set nextReviewDate to 5 minutes ago to keep it in the active list
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() - 1);
    }

    flashcard.repetitions = repetitions;
    flashcard.easeFactor = easeFactor;
    flashcard.interval = interval;
    flashcard.nextReviewDate = nextReviewDate;

    await flashcard.save();
    res.json(flashcard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findByPk(req.params.id);
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });
    if (flashcard.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await flashcard.destroy();
    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    res.status(550).json({ message: error.message });
  }
};
