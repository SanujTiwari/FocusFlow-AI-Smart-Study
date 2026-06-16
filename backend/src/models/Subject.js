import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subjectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    allowNull: false,
  },
  examDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  colorCode: {
    type: DataTypes.STRING,
  },
  syllabus: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, { timestamps: true });

Subject.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Subject, { foreignKey: 'userId' });

export default Subject;
