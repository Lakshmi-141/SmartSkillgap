const mongoose = require('mongoose');

const userAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionText: String,
  selectedOption: Number,
  correctAnswer: Number,
  isCorrect: Boolean,
  explanation: String
}, { _id: false });

const assessmentResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: [true, 'Assessment reference is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot be greater than 100']
  },
  proficiency: {
    type: Number,
    min: [0, 'Proficiency cannot be less than 0'],
    max: [4, 'Proficiency cannot be greater than 4']
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  answers: [userAnswerSchema],
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
