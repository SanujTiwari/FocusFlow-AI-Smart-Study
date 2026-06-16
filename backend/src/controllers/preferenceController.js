import StudyPreference from '../models/StudyPreference.js';

export const getPreference = async (req, res) => {
  try {
    let preference = await StudyPreference.findOne({ where: { userId: req.user.id } });
    if (!preference) {
      // Create default preference if none exists
      preference = await StudyPreference.create({ userId: req.user.id });
    }
    res.json(preference);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePreference = async (req, res) => {
  try {
    let preference = await StudyPreference.findOne({ where: { userId: req.user.id } });
    if (!preference) {
      preference = await StudyPreference.create({ userId: req.user.id, ...req.body });
    } else {
      await preference.update(req.body);
    }
    res.json(preference);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
