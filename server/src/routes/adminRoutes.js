const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  getCareerSkills,
  createCareerSkill,
  updateCareerSkill,
  deleteCareerSkill,
  getRoadmaps,
  deleteRoadmap
} = require('../controllers/adminController');

const {
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');

const {
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  deleteAssessment
} = require('../controllers/assessmentController');

const { protect, adminOnly } = require('../middleware/auth');

// MANDATORY ADMIN MIDDLEWARE PIPELINE
router.use(protect);
router.use(adminOnly);

// Stats
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Skill Management (CRUD)
router.get('/skills', getSkills);
router.get('/skills/:id', getSkillById);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// Career Management (CRUD)
router.get('/careers', getCareers);
router.get('/careers/:id', getCareerById);
router.post('/careers', createCareer);
router.put('/careers/:id', updateCareer);
router.delete('/careers/:id', deleteCareer);

// Career Skill Management (CRUD)
router.get('/career-skills', getCareerSkills);
router.post('/career-skills', createCareerSkill);
router.put('/career-skills/:id', updateCareerSkill);
router.delete('/career-skills/:id', deleteCareerSkill);

// Roadmap Management
router.get('/roadmaps', getRoadmaps);
router.delete('/roadmaps/:id', deleteRoadmap);

// Resource Management (CRUD Aliases under /admin)
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Assessment Management (CRUD Aliases under /admin)
router.get('/assessments', getAssessments);
router.get('/assessments/:id', getAssessmentById);
router.post('/assessments', createAssessment);
router.delete('/assessments/:id', deleteAssessment);

// Project Management (CRUD Aliases under /admin)
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

module.exports = router;
