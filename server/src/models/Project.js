const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  skillsGained: [{
    type: String,
    trim: true
  }],
  estimatedDuration: {
    type: String,
    default: '1-2 Weeks'
  },
  githubUrl: {
    type: String,
    default: ''
  },
  demoUrl: {
    type: String,
    default: ''
  },
  targetCareers: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
