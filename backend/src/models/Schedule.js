import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';
import Subject from './Subject.js';

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.UUID,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taskDescription: {
    type: DataTypes.STRING,
  },
  taskType: {
    type: DataTypes.ENUM('STUDY', 'REVISION', 'BREAK'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'MISSED', 'RESCHEDULED'),
    defaultValue: 'PENDING',
  },
  isRevision: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, { timestamps: true });

Schedule.belongsTo(User, { foreignKey: 'userId' });
Schedule.belongsTo(Subject, { foreignKey: 'subjectId' });
User.hasMany(Schedule, { foreignKey: 'userId' });
Subject.hasMany(Schedule, { foreignKey: 'subjectId' });

export default Schedule;
