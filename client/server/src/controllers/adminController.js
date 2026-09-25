const mongoose = require('mongoose');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
const Roadmap = require('../models/Roadmap');
const Resource = require('../models/Resource');
const Assessment = require('../models/Assessment');
const Project = require('../models/Project');
const UserSkill = require('../models/UserSkill');
const AssessmentResult = require('../models/AssessmentResult');
const { validateUrlSecurity } = require('../utils/urlValidator');

// Helper to validate ObjectId
const validateObjectId = (id, res, resourceName = 'Resource') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: `Invalid ${resourceName} ID format` });
    return false;
  }
  return true;
};

// ==========================================
// 1. DASHBOARD STATS
// ==========================================

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSkills = await Skill.countDocuments();
    const totalCareers = await Career.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalAssessmentSubmissions = await AssessmentResult.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalRoadmaps = await Roadmap.countDocuments();

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
        totalProjects,
        totalRoadmaps
      },
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

// @desc    Get all users with search and filter (password never exposed!)
// @route   GET /api/admin/users
// @access  Private / Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (role) {
      filter.role = role.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('targetCareer', 'title category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details by ID
// @route   GET /api/admin/users/:id
// @access  Private / Admin
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'User')) return;

    const user = await User.findById(id)
      .select('-password')
      .populate('targetCareer', 'title category description');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userSkills = await UserSkill.find({ user: id }).populate('skill', 'name category');

    res.json({
      success: true,
      user,
      userSkills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details or role (Admin Only)
// @route   PUT /api/admin/users/:id
// @access  Private / Admin
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'User')) return;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, role, targetCareer } = req.body;

    if (name) user.name = name;
    if (role) {
      if (!['student', 'admin'].includes(role.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid user role' });
      }
      user.role = role.toLowerCase();
    }
    if (targetCareer) {
      if (!mongoose.Types.ObjectId.isValid(targetCareer)) {
        return res.status(400).json({ success: false, message: 'Invalid target career ID format' });
      }
      user.targetCareer = targetCareer;
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password').populate('targetCareer', 'title');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin Only)
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'User')) return;

    if (id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot delete their own account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Clean up user related data
    await UserSkill.deleteMany({ user: id });
    await AssessmentResult.deleteMany({ user: id });
    await Roadmap.deleteMany({ user: id });

    res.json({
      success: true,
      message: 'User account and associated records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. SKILL MANAGEMENT (CRUD)
// ==========================================

const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json({ success: true, count: skills.length, skills });
  } catch (error) {
    next(error);
  }
};

const getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Skill')) return;

    const skill = await Skill.findById(id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    res.json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Skill Name and Category are required' });
    }

    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingSkill) {
      return res.status(400).json({ success: false, message: 'Skill with this name already exists' });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category.trim(),
      description: description || '',
      icon: icon || 'Code'
    });

    res.status(201).json({ success: true, message: 'Skill created successfully', skill });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Skill')) return;

    const skill = await Skill.findById(id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const { name, category, description, icon } = req.body;
    if (name) skill.name = name.trim();
    if (category) skill.category = category.trim();
    if (description !== undefined) skill.description = description;
    if (icon) skill.icon = icon;

    await skill.save();
    res.json({ success: true, message: 'Skill updated successfully', skill });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Skill')) return;

    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    // Safe deletion: Clean up links
    await CareerSkill.deleteMany({ skill: id });
    await Resource.deleteMany({ skill: id });

    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. CAREER MANAGEMENT (CRUD)
// ==========================================

const getCareers = async (req, res, next) => {
  try {
    const careers = await Career.find().sort({ title: 1 });
    res.json({ success: true, count: careers.length, careers });
  } catch (error) {
    next(error);
  }
};

const getCareerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Career')) return;

    const career = await Career.findById(id);
    if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

    const careerSkills = await CareerSkill.find({ career: id }).populate('skill', 'name category');

    res.json({ success: true, career, careerSkills });
  } catch (error) {
    next(error);
  }
};

const createCareer = async (req, res, next) => {
  try {
    const { title, description, category, demand, salaryRange, icon } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Career Title and Description are required' });
    }

    const career = await Career.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Software Engineering',
      demand: demand || 'High',
      salaryRange: salaryRange || '$80,000 - $120,000 / year',
      icon: icon || 'Briefcase'
    });

    res.status(201).json({ success: true, message: 'Career created successfully', career });
  } catch (error) {
    next(error);
  }
};

const updateCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Career')) return;

    const career = await Career.findById(id);
    if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

    const { title, description, category, demand, salaryRange, icon } = req.body;
    if (title) career.title = title.trim();
    if (description) career.description = description.trim();
    if (category) career.category = category;
    if (demand) career.demand = demand;
    if (salaryRange) career.salaryRange = salaryRange;
    if (icon) career.icon = icon;

    await career.save();
    res.json({ success: true, message: 'Career updated successfully', career });
  } catch (error) {
    next(error);
  }
};

const deleteCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Career')) return;

    const career = await Career.findByIdAndDelete(id);
    if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

    await CareerSkill.deleteMany({ career: id });

    res.json({ success: true, message: 'Career deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. CAREER SKILL MANAGEMENT (CRUD)
// ==========================================

const getCareerSkills = async (req, res, next) => {
  try {
    const careerSkills = await CareerSkill.find()
      .populate('career', 'title category')
      .populate('skill', 'name category');
    res.json({ success: true, count: careerSkills.length, careerSkills });
  } catch (error) {
    next(error);
  }
};

const createCareerSkill = async (req, res, next) => {
  try {
    const { career, skill, requiredLevel, priority } = req.body;
    if (!career || !skill || requiredLevel === undefined) {
      return res.status(400).json({ success: false, message: 'Career, Skill, and Required Level are required' });
    }

    if (!validateObjectId(career, res, 'Career') || !validateObjectId(skill, res, 'Skill')) return;

    const careerSkill = await CareerSkill.create({
      career,
      skill,
      requiredLevel: Number(requiredLevel),
      priority: (priority || 'medium').toLowerCase()
    });

    const populated = await CareerSkill.findById(careerSkill._id)
      .populate('career', 'title')
      .populate('skill', 'name category');

    res.status(201).json({ success: true, message: 'Career skill mapping created', careerSkill: populated });
  } catch (error) {
    next(error);
  }
};

const updateCareerSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'CareerSkill')) return;

    const careerSkill = await CareerSkill.findById(id);
    if (!careerSkill) return res.status(404).json({ success: false, message: 'Career skill mapping not found' });

    const { requiredLevel, priority } = req.body;
    if (requiredLevel !== undefined) careerSkill.requiredLevel = Number(requiredLevel);
    if (priority) careerSkill.priority = priority.toLowerCase();

    await careerSkill.save();

    const populated = await CareerSkill.findById(id)
      .populate('career', 'title')
      .populate('skill', 'name category');

    res.json({ success: true, message: 'Career skill mapping updated', careerSkill: populated });
  } catch (error) {
    next(error);
  }
};

const deleteCareerSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'CareerSkill')) return;

    const careerSkill = await CareerSkill.findByIdAndDelete(id);
    if (!careerSkill) return res.status(404).json({ success: false, message: 'Career skill mapping not found' });

    res.json({ success: true, message: 'Career skill mapping deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. ROADMAP MANAGEMENT (VIEW & DELETE)
// ==========================================

const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find()
      .populate('user', 'name email')
      .populate('career', 'title')
      .populate('steps.skill', 'name category');
    res.json({ success: true, count: roadmaps.length, roadmaps });
  } catch (error) {
    next(error);
  }
};

const deleteRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id, res, 'Roadmap')) return;

    const roadmap = await Roadmap.findByIdAndDelete(id);
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    res.json({ success: true, message: 'Roadmap deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Export all handlers
module.exports = {
  getAdminStats,
  // Users
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Skills
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  // Careers
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  // CareerSkills
  getCareerSkills,
  createCareerSkill,
  updateCareerSkill,
  deleteCareerSkill,
  // Roadmaps
  getRoadmaps,
  deleteRoadmap
};
