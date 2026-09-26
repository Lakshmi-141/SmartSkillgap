const mongoose = require('mongoose');

const userProjectProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'NOT_STARTED'
  },
  githubRepoUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

userProjectProgressSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('UserProjectProgress', userProjectProgressSchema);
