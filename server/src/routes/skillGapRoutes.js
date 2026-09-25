const express = require('express');
const router = express.Router();
const { analyzeSkillGap, getSkillGapByUserId } = require('../controllers/skillGapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeSkillGap);
router.get('/:userId', protect, getSkillGapByUserId);

module.exports = router;
