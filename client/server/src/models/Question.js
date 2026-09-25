const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    required: [true, 'Options are required'],
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    select: false // NEVER return correctAnswer in default query results
  },
  explanation: {
    type: String,
    default: '',
    select: false // Exclude explanation before submission
  },
  points: {
    type: Number,
    default: 10
  }
});

// Ensure correctAnswer and explanation are stripped from JSON serialization
questionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.correctAnswer;
  delete obj.explanation;
  return obj;
};

const Question = mongoose.model('Question', questionSchema);
module.exports = { Question, questionSchema };
