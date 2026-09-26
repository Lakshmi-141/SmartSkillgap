const User = require('../models/User');
const Career = require('../models/Career');
const Skill = require('../models/Skill');
const SkillGap = require('../models/SkillGap');
const Roadmap = require('../models/Roadmap');
const Assessment = require('../models/Assessment');
const Resource = require('../models/Resource');
const Project = require('../models/Project');

// @desc    Get all registered users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const safeUsers = users.map(u => u.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform aggregate statistics (Admin only)
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getPlatformStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalCareers,
      totalSkills,
      totalAssessments,
      totalResources,
      totalProjects,
      totalSkillGapAnalyses,
      totalRoadmaps,
      adminCount,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['student', 'USER'] } }),
      Career.countDocuments(),
      Skill.countDocuments(),
      Assessment.countDocuments(),
      Resource.countDocuments(),
      Project.countDocuments(),
      SkillGap.countDocuments(),
      Roadmap.countDocuments(),
      User.countDocuments({ role: { $in: ['admin', 'ADMIN'] } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password')
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        totalStudents,
        totalCareers,
        totalSkills,
        totalAssessments,
        totalResources,
        totalProjects,
        totalSkillGapAnalyses,
        totalRoadmaps,
        roleDistribution: {
          admin: adminCount,
          student: totalStudents
        },
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get master skills catalog (Admin only)
// @route   GET /api/admin/skills
// @access  Private/Admin
const getCatalogSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new master catalog skill (Admin only)
// @route   POST /api/admin/skills
// @access  Private/Admin
const createCatalogSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const existingSkill = await Skill.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: `Skill "${name}" already exists in catalog`
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category && category.trim() ? category.trim() : 'General',
      description: description ? description.trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Master skill added to catalog successfully',
      skill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a master catalog skill (Admin only)
// @route   PUT /api/admin/skills/:id
// @access  Private/Admin
const updateCatalogSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Catalog skill not found'
      });
    }

    if (name && name.trim()) skill.name = name.trim();
    if (category && category.trim()) skill.category = category.trim();
    if (description !== undefined) skill.description = description.trim();

    await skill.save();

    return res.status(200).json({
      success: true,
      message: 'Catalog skill updated successfully',
      skill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a master catalog skill (Admin only)
// @route   DELETE /api/admin/skills/:id
// @access  Private/Admin
const deleteCatalogSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Catalog skill not found'
      });
    }

    await Skill.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Master skill "${skill.name}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getPlatformStatistics,
  getCatalogSkills,
  createCatalogSkill,
  updateCatalogSkill,
  deleteCatalogSkill
};
