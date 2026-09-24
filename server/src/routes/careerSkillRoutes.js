const express = require('express');
const router = express.Router();
const {
  updateCareerSkill,
  deleteCareerSkill
} = require('../controllers/careerController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.put('/:id', updateCareerSkill);
router.delete('/:id', deleteCareerSkill);

module.exports = router;
