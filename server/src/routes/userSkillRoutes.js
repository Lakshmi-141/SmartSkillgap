const express = require('express');
const router = express.Router();
const {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill
} = require('../controllers/userSkillController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getUserSkills);
router.post('/', addUserSkill);
router.put('/:id', updateUserSkill);
router.delete('/:id', deleteUserSkill);

module.exports = router;
