const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getPlatformStatistics,
  getCatalogSkills,
  createCatalogSkill,
  updateCatalogSkill,
  deleteCatalogSkill
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here are protected and require ADMIN role
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.get('/statistics', getPlatformStatistics);

// Skill Catalog Admin Endpoints
router.get('/skills', getCatalogSkills);
router.post('/skills', createCatalogSkill);
router.put('/skills/:id', updateCatalogSkill);
router.delete('/skills/:id', deleteCatalogSkill);

module.exports = router;
