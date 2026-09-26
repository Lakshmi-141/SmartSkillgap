const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getMyAssessmentResults,
  createAssessment,
  updateAssessment,
  deleteAssessment
} = require('../controllers/assessmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getAssessments);
router.get('/results/me', protect, getMyAssessmentResults);
router.get('/:id', protect, getAssessmentById);
router.post('/:id/submit', protect, submitAssessment);

// Admin Routes
router.post('/', protect, admin, createAssessment);
router.put('/:id', protect, admin, updateAssessment);
router.delete('/:id', protect, admin, deleteAssessment);

module.exports = router;
