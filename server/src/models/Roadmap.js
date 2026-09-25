const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: String,
  resourceType: { type: String, default: 'Documentation' },
  url: String
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  phaseNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  learningObjectives: [String],
  prerequisites: [String],
  estimatedTime: {
    type: String,
    default: '1 Week'
  },
  resources: [resourceSchema],
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  }
}, { _id: true, timestamps: true });

const roadmapSchema = new mongoose.Schema(
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
    overallProgress: {
      type: Number,
      default: 0
    },
    phases: [phaseSchema]
  },
  {
    timestamps: true
  }
);

roadmapSchema.virtual('progress').get(function () {
  return this.overallProgress;
});

roadmapSchema.set('toJSON', { virtuals: true });
roadmapSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
