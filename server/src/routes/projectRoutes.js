const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectProgress
} = require('../controllers/projectController');
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/recommendations', protect, getRecommendations);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);

router.post('/', protect, adminOnly, createProject);
router.put('/:id', protect, adminOnly, updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

router.post('/progress', protect, updateProjectProgress);

module.exports = router;
