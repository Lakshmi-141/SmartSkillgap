const express = require('express');
const router = express.Router();
const {
  getCareers,
  getCareerById,
  selectTargetCareer,
  compareCareers,
  createCareer,
  updateCareer,
  deleteCareer
} = require('../controllers/careerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getCareers);
router.post('/', protect, admin, createCareer);
router.post('/compare', protect, compareCareers);
router.get('/:id', protect, getCareerById);
router.put('/:id', protect, admin, updateCareer);
router.delete('/:id', protect, admin, deleteCareer);
router.post('/:id/select', protect, selectTargetCareer);

module.exports = router;


