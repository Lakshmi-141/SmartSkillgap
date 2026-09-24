const express = require('express');
const router = express.Router();
const { getCareerReadiness } = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCareerReadiness);

module.exports = router;
