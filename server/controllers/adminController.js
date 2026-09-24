const User = require('../models/User');
const Skill = require('../models/Skill');
const CareerPath = require('../models/CareerPath');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Resource = require('../models/Resource');
const Project = require('../models/Project');

const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSkills = await Skill.countDocuments();
    const totalCareers = await CareerPath.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalAssessmentSubmissions = await AssessmentResult.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalProjects = await Project.countDocuments();

    const recentUsers = await User.find({ role: 'student' })
      .select('-password')
      .populate('targetCareer', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalSkills,
        totalCareers,
        totalAssessments,
        totalAssessmentSubmissions,
        totalResources,
        totalProjects
      },
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and Category are required' });
    }

    const skill = await Skill.create({ name, category, description, icon });
    res.status(201).json({ success: true, message: 'Skill created', skill });
  } catch (error) {
    next(error);
  }
};

const createCareer = async (req, res, next) => {
  try {
    const { title, description, category, averageSalary, jobDemand, requiredSkills, roadmapSteps } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and Description are required' });
    }

    const career = await CareerPath.create({
      title,
      description,
      category,
      averageSalary,
      jobDemand,
      requiredSkills: requiredSkills || [],
      roadmapSteps: roadmapSteps || []
    });

    res.status(201).json({ success: true, message: 'Career Path created', career });
  } catch (error) {
    next(error);
  }
};

const createAssessment = async (req, res, next) => {
  try {
    const { title, description, skill, difficulty, timeLimitMinutes, questions } = req.body;
    if (!title || !skill || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Title, skill and valid questions array required' });
    }

    const assessment = await Assessment.create({
      title,
      description,
      skill,
      difficulty: difficulty || 'Intermediate',
      timeLimitMinutes: timeLimitMinutes || 15,
      questions
    });

    res.status(201).json({ success: true, message: 'Assessment created', assessment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  createSkill,
  createCareer,
  createAssessment
};
