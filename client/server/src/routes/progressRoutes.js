const express = require('express');
const router = express.Router();
const {
  getProgress,
  refreshProgress,
  updateProgressStep
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgress);
router.post('/', protect, refreshProgress);
router.put('/:roadmapStepId', protect, updateProgressStep);

module.exports = router;
