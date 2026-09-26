const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Resource description is required']
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
    validate: {
      validator: function(v) {
        return /^(http:\/\/|https:\/\/)/.test(v);
      },
      message: props => `${props.value} is not a valid HTTP or HTTPS URL!`
    }
  },
  type: {
    type: String,
    enum: ['Course', 'Video', 'Article', 'Documentation', 'Book', 'Tutorial'],
    default: 'Documentation'
  },
  skill: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
