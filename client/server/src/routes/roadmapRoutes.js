const express = require('express');
const router = express.Router();
const {
  getMyRoadmap,
  getRoadmapByCareer,
  generateRoadmap,
  updateStepProgress,
  toggleRoadmapStep
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

// Phase 8 Core API Endpoints
router.get('/my-roadmap', protect, getMyRoadmap);
router.get('/:careerId', protect, getRoadmapByCareer);
router.post('/generate', protect, generateRoadmap);
router.put('/:stepId', protect, updateStepProgress);

// Legacy/Compatibility Endpoints
router.get('/', protect, getMyRoadmap);
router.post('/toggle-step', protect, toggleRoadmapStep);

module.exports = router;
