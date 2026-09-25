const express = require('express');
const router = express.Router();
const {
  getSkills,
  addSkill,
  updateSkillProficiency,
  deleteSkill
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSkills)
  .post(protect, addSkill);

router.route('/:id')
  .put(protect, updateSkillProficiency)
  .delete(protect, deleteSkill);

module.exports = router;
