const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getUserResults,
  getResultById,
  createAssessment,
  updateAssessment,
  deleteAssessment
} = require('../controllers/assessmentController');
const { protect, adminOnly } = require('../middleware/auth');

// Public / Authenticated assessment list
router.get('/', getAssessments);

// Admin-only Assessment Creation
router.post('/', protect, adminOnly, createAssessment);

// Student Assessment Results
router.get('/results', protect, getUserResults);
router.get('/my-results', protect, getUserResults);
router.get('/results/:resultId', protect, getResultById);

// Single Assessment & Submission
router.get('/:id', getAssessmentById);
router.post('/:id/submit', protect, submitAssessment);

// Admin-only Assessment Updates & Deletion
router.put('/:id', protect, adminOnly, updateAssessment);
router.delete('/:id', protect, adminOnly, deleteAssessment);

module.exports = router;

