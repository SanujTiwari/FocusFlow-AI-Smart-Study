import Schedule from '../models/Schedule.js';
import Subject from '../models/Subject.js';
import StudyPreference from '../models/StudyPreference.js';
import { generateStudyPlan } from '../services/geminiService.js';
import { Op } from 'sequelize';

export const getSchedules = async (req, res) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.date) {
      where.date = req.query.date;
    }
    const schedules = await Schedule.findAll({
      where,
      include: [{ model: Subject, as: 'Subject' }],
      order: [['startTime', 'ASC']]
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeekly = async (req, res) => {
  try {
    const startDate = new Date(req.query.start);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const schedules = await Schedule.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      },
      include: [{ model: Subject, as: 'Subject' }],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markComplete = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.userId !== req.user.id) return res.status(401).json({ message: 'User not authorized' });
    
    schedule.status = 'COMPLETED';
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markSkipped = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.userId !== req.user.id) return res.status(401).json({ message: 'User not authorized' });
    
    schedule.status = 'MISSED';
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reschedule = async (req, res) => {
  try {
    await Schedule.update(
      { status: 'RESCHEDULED' },
      { where: { userId: req.user.id, status: 'MISSED' } }
    );
    res.json({ message: 'Missed tasks rescheduled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMissedCount = async (req, res) => {
  try {
    const count = await Schedule.count({ where: { userId: req.user.id, status: 'MISSED' } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateSchedules = async (req, res) => {
  const { startDate, numberOfDays } = req.body;
  try {
    const subjects = await Subject.findAll({ where: { userId: req.user.id } });
    if (subjects.length === 0) {
      return res.status(400).json({ message: 'No subjects found. Please add subjects first.' });
    }
    let preference = await StudyPreference.findOne({ where: { userId: req.user.id } });
    if (!preference) {
      preference = { studyTimePreference: 'FLEXIBLE', availableHoursPerDay: 6, breakDurationMinutes: 15, pomodoroWorkMinutes: 25, pomodoroBreakMinutes: 5 };
    }

    const plan = await generateStudyPlan(subjects, preference, startDate, numberOfDays);
    
    const newSchedules = [];
    for (const item of plan) {
      const subjectDoc = subjects.find(s => s.subjectName === item.subjectName);
      const schedule = {
        userId: req.user.id,
        subjectId: subjectDoc ? subjectDoc.id : null,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        taskDescription: item.taskDescription,
        taskType: item.taskType,
        isRevision: item.isRevision,
        status: 'PENDING'
      };
      newSchedules.push(schedule);
    }
    
    await Schedule.bulkCreate(newSchedules);
    res.status(201).json({ message: 'Schedules generated successfully', count: newSchedules.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
