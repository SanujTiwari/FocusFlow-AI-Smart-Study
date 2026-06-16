import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const StudyPreference = sequelize.define('StudyPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  studyTimePreference: {
    type: DataTypes.ENUM('MORNING', 'EVENING', 'FLEXIBLE'),
    defaultValue: 'FLEXIBLE',
  },
  availableHoursPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 6,
  },
  breakDurationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  pomodoroWorkMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 25,
  },
  pomodoroBreakMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
}, { timestamps: true });

StudyPreference.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(StudyPreference, { foreignKey: 'userId' });

export default StudyPreference;
