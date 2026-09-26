const express = require('express');
const router = express.Router();
const { getCareerReadiness } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/readiness', protect, getCareerReadiness);
router.get('/', protect, getCareerReadiness);

module.exports = router;
