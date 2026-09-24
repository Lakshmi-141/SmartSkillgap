const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    lowercase: true,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid difficulty level'
    },
    default: 'intermediate'
  },
  requiredSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  skillsGained: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  estimatedDuration: {
    type: String,
    default: '10-15 hours',
    trim: true
  },
  githubUrl: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function (v) {
        if (!v || v.trim() === '') return true;
        const lower = v.trim().toLowerCase();
        if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.startsWith('vbscript:')) {
          return false;
        }
        return /^https?:\/\//i.test(v);
      },
      message: 'GitHub URL must begin with http:// or https://'
    }
  },
  demoUrl: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function (v) {
        if (!v || v.trim() === '') return true;
        const lower = v.trim().toLowerCase();
        if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.startsWith('vbscript:')) {
          return false;
        }
        return /^https?:\/\//i.test(v);
      },
      message: 'Demo URL must begin with http:// or https://'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
