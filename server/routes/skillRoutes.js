const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getUserSkills,
  updateUserSkill,
  removeUserSkill
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllSkills);
router.get('/my-skills', protect, getUserSkills);
router.post('/my-skills', protect, updateUserSkill);
router.delete('/my-skills/:skillId', protect, removeUserSkill);

module.exports = router;
