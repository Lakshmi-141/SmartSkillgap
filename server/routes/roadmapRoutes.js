const express = require('express');
const router = express.Router();
const { getRoadmap, toggleRoadmapStep } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRoadmap);
router.post('/toggle-step', protect, toggleRoadmapStep);

module.exports = router;
