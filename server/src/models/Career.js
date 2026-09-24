const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Career title is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Career slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Career description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'Software Engineering'
  },
  demand: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Very High', 'Critical'],
      message: '{VALUE} is not a valid demand level'
    },
    default: 'High'
  },
  salaryRange: {
    type: String,
    required: [true, 'Salary range is required'],
    trim: true
  },
  icon: {
    type: String,
    default: 'Briefcase'
  }
}, {
  timestamps: true
});

// Auto-generate slug before validate if not present
careerSchema.pre('validate', function() {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
});

const Career = mongoose.model('Career', careerSchema);
module.exports = Career;
