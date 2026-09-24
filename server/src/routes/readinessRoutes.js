const express = require('express');
const router = express.Router();
const { getCareerReadiness } = require('../controllers/readinessController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCareerReadiness);

module.exports = router;
