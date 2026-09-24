const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return false;
        const lower = v.trim().toLowerCase();
        if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.startsWith('vbscript:')) {
          return false;
        }
        return /^https?:\/\//i.test(v);
      },
      message: 'Resource URL must begin with http:// or https:// and cannot use unsafe schemes'
    }
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    lowercase: true,
    enum: {
      values: ['article', 'video', 'course', 'documentation', 'book', 'tutorial', 'other'],
      message: '{VALUE} is not a valid resource type'
    }
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: [true, 'Skill reference is required']
  },
  difficulty: {
    type: String,
    lowercase: true,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid difficulty level'
    },
    default: 'beginner'
  },
  targetLevel: {
    type: Number,
    min: 0,
    max: 4,
    default: 1
  },
  isFree: {
    type: Boolean,
    default: true
  },
  provider: {
    type: String,
    default: 'Web Resource',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
