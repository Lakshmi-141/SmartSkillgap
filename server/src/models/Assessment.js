const mongoose = require('mongoose');
const { questionSchema } = require('./Question');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assessment description is required'],
    trim: true
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
    default: 'intermediate'
  },
  timeLimitMinutes: {
    type: Number,
    default: 15
  },
  passingScore: {
    type: Number,
    default: 60
  },
  questions: [questionSchema]
}, {
  timestamps: true
});

// Ensure question correctAnswers are stripped when serializing assessment
assessmentSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map(q => {
      delete q.correctAnswer;
      delete q.explanation;
      return q;
    });
  }
  return obj;
};

module.exports = mongoose.model('Assessment', assessmentSchema);
