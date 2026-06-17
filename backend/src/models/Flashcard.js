import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';
import Subject from './Subject.js';

const Flashcard = sequelize.define('Flashcard', {
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
    allowNull: false,
  },
  front: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  back: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  easeFactor: {
    type: DataTypes.DOUBLE,
    defaultValue: 2.5,
  },
  interval: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 0 days means it should be reviewed today/immediately
  },
  repetitions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  nextReviewDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { timestamps: true });

// Setup relationships
Flashcard.belongsTo(User, { foreignKey: 'userId' });
Flashcard.belongsTo(Subject, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
User.hasMany(Flashcard, { foreignKey: 'userId' });
Subject.hasMany(Flashcard, { foreignKey: 'subjectId', onDelete: 'CASCADE' });

export default Flashcard;
