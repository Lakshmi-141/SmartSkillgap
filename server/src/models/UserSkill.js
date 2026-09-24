const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: [true, 'Skill reference is required']
  },
  proficiency: {
    type: Number,
    required: [true, 'Proficiency is required'],
    min: [0, 'Proficiency cannot be less than 0'],
    max: [4, 'Proficiency cannot be greater than 4'],
    validate: {
      validator: Number.isInteger,
      message: 'Proficiency must be an integer between 0 and 4'
    }
  },
  source: {
    type: String,
    enum: {
      values: ['self', 'assessment', 'project', 'admin'],
      message: '{VALUE} is not a valid source'
    },
    default: 'self'
  }
}, {
  timestamps: true
});

// Enforce uniqueness of user + skill combination
userSkillSchema.index({ user: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('UserSkill', userSkillSchema);
