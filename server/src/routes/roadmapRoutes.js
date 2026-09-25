const express = require('express');
const router = express.Router();
const {
  generateRoadmap,
  getRoadmapByUserId,
  updateRoadmapProgress
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRoadmap);
router.get('/:userId', protect, getRoadmapByUserId);
router.put('/:id/progress', protect, updateRoadmapProgress);

module.exports = router;
