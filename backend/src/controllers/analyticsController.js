import Schedule from '../models/Schedule.js';

export const getAnalytics = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({ where: { userId: req.user.id } });
    const totalTasks = schedules.length;
    const completedTasks = schedules.filter(s => s.status === 'COMPLETED').length;
    const missedTasks = schedules.filter(s => s.status === 'MISSED').length;
    
    res.json({
      totalTasks,
      completedTasks,
      missedTasks,
      completionRate: totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
