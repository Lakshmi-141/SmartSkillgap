const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDashboardSummary } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/dashboard-summary', protect, getDashboardSummary);

module.exports = router;
