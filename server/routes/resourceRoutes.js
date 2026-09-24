const express = require('express');
const router = express.Router();
const { getResources, updateResourceStatus } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getResources);
router.post('/bookmark', protect, updateResourceStatus);

module.exports = router;
