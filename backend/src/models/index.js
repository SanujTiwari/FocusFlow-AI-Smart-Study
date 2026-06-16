import { sequelize } from '../config/db.js';
import User from './User.js';
import Subject from './Subject.js';
import Schedule from './Schedule.js';
import StudyPreference from './StudyPreference.js';
import Notification from './Notification.js';

// Define relationships after all models are imported
export const initializeModels = async () => {
  // Models are already defined in their individual files
  // This function just ensures relationships are set up
  return { User, Subject, Schedule, StudyPreference, Notification };
};

export { User, Subject, Schedule, StudyPreference, Notification };
export { sequelize };
