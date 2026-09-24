const express = require('express');
const router = express.Router();
const {
  getAllCareers,
  getCareerById,
  selectTargetCareer
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCareers);
router.get('/:id', getCareerById);
router.post('/select-target', protect, selectTargetCareer);

module.exports = router;
