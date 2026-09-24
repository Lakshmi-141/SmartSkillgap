const mongoose = require('mongoose');

const careerSkillSchema = new mongoose.Schema({
  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
    required: [true, 'Career reference is required']
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: [true, 'Skill reference is required']
  },
  requiredLevel: {
    type: Number,
    required: [true, 'Required level is required'],
    min: [0, 'Required level cannot be less than 0'],
    max: [4, 'Required level cannot be greater than 4'],
    validate: {
      validator: Number.isInteger,
      message: 'Required level must be an integer between 0 and 4'
    }
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    lowercase: true,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: '{VALUE} is not a valid priority level'
    }
  }
}, {
  timestamps: true
});

// Enforce uniqueness of career + skill combination
careerSkillSchema.index({ career: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('CareerSkill', careerSkillSchema);
