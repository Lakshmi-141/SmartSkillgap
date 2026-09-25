const mongoose = require('mongoose');

const skillGapItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Technical'
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'None'],
    default: 'None'
  },
  importance: {
    type: String,
    default: 'Required'
  }
}, { _id: false });

const skillGapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetCareer: {
      type: String,
      required: true
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    matchingSkills: [skillGapItemSchema],
    skillsToImprove: [skillGapItemSchema],
    missingSkills: [skillGapItemSchema],
    totalRequiredSkillsCount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SkillGap', skillGapSchema);
