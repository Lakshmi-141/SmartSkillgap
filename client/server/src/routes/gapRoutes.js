const express = require('express');
const router = express.Router();
const { getSkillGap, analyzeSkillGap } = require('../controllers/gapController');
const { protect } = require('../middleware/auth');

// GET /api/skill-gap or /api/gap-analysis
router.get('/', protect, getSkillGap);

// POST /api/skill-gap/analyze or /api/gap-analysis/analyze
router.post('/analyze', protect, analyzeSkillGap);

// GET /api/skill-gap/analyze fallback
router.get('/analyze', protect, getSkillGap);

module.exports = router;
