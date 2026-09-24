const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  createSkill,
  createCareer,
  createAssessment
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.post('/skills', createSkill);
router.post('/careers', createCareer);
router.post('/assessments', createAssessment);

module.exports = router;
