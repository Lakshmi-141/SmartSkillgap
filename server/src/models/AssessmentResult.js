const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['No Knowledge', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  proficiencyNumeric: {
    type: Number,
    default: 1
  },
  suggestions: [{
    type: String
  }],
  userAnswers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
