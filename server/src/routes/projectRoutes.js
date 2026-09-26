const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectRecommendations,
  updateProjectProgress,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getProjects);
router.get('/recommendations', protect, getProjectRecommendations);
router.post('/:id/progress', protect, updateProjectProgress);

// Admin Routes
router.post('/', protect, admin, createProject);
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, deleteProject);

module.exports = router;
