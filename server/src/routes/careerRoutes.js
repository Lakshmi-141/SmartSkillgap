const express = require('express');
const router = express.Router();
const {
  getAllCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  selectTargetCareer,
  getCareerSkills,
  addCareerSkill
} = require('../controllers/careerController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllCareers);
router.get('/:id', getCareerById);
router.get('/:id/skills', getCareerSkills);

// Protected student routes
router.post('/select-target', protect, selectTargetCareer);

// Protected admin-only routes
router.post('/', protect, adminOnly, createCareer);
router.put('/:id', protect, adminOnly, updateCareer);
router.delete('/:id', protect, adminOnly, deleteCareer);
router.post('/:id/skills', protect, adminOnly, addCareerSkill);

module.exports = router;
