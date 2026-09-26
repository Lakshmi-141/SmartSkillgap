const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getResources);
router.get('/:id', protect, getResourceById);

// Admin Routes
router.post('/', protect, admin, createResource);
router.put('/:id', protect, admin, updateResource);
router.delete('/:id', protect, admin, deleteResource);

module.exports = router;
