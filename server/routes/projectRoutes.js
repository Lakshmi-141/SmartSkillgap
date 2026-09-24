const express = require('express');
const router = express.Router();
const { getProjects, updateProjectProgress } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProjects);
router.post('/progress', protect, updateProjectProgress);

module.exports = router;
