import Subject from '../models/Subject.js';
import { parseSyllabusFromText, parseSyllabusFromFile } from '../services/geminiService.js';

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({ where: { userId: req.user.id } });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req, res) => {
  const { subjectName, difficulty, examDate, colorCode } = req.body;
  try {
    const subject = await Subject.create({
      userId: req.user.id,
      subjectName,
      difficulty,
      examDate,
      colorCode
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await subject.update(req.body);
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.userId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await subject.destroy();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const parseSyllabusText = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Syllabus text content is required' });
  }
  try {
    const chapters = await parseSyllabusFromText(text);
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const parseSyllabusFile = async (req, res) => {
  const { base64Data, mimeType } = req.body;
  if (!base64Data || !mimeType) {
    return res.status(400).json({ message: 'Syllabus file data and mimeType are required' });
  }
  try {
    const chapters = await parseSyllabusFromFile(base64Data, mimeType);
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
