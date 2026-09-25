const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    required: [true, 'Step order is required']
  },
  priority: {
    type: String,
    enum: {
      values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'low', 'medium', 'high', 'critical'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: {
      values: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'not_started', 'in_progress', 'completed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'NOT_STARTED'
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be greater than 100'],
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { _id: true });

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
    required: [true, 'Career reference is required']
  },
  steps: [roadmapStepSchema],
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
