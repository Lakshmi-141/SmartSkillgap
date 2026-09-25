const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  importance: {
    type: String,
    enum: ['Core', 'Required', 'Recommended'],
    default: 'Required'
  },
  category: {
    type: String,
    default: 'Technical'
  }
}, { _id: false });

const roadmapStepSchema = new mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  skills: [String]
}, { _id: false });

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Career description is required']
    },
    requiredSkills: [requiredSkillSchema],
    recommendedSkills: [{
      type: String
    }],
    roadmap: [roadmapStepSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Career', careerSchema);
