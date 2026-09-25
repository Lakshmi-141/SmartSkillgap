const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus
} = require('../controllers/resourceController');
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/recommendations', protect, getRecommendations);
router.get('/', protect, getResources);
router.get('/:id', protect, getResourceById);

router.post('/', protect, adminOnly, createResource);
router.put('/:id', protect, adminOnly, updateResource);
router.delete('/:id', protect, adminOnly, deleteResource);

router.post('/bookmark', protect, updateResourceStatus);

module.exports = router;
