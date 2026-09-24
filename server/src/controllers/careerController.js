const mongoose = require('mongoose');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Helper to format/populate career with its required skills
const formatCareerWithSkills = async (careerDoc) => {
  const careerObj = careerDoc.toObject ? careerDoc.toObject() : careerDoc;
  const careerSkills = await CareerSkill.find({ career: careerObj._id }).populate('skill');
  careerObj.requiredSkills = careerSkills.map(cs => ({
    _id: cs._id,
    skill: cs.skill,
    requiredLevel: cs.requiredLevel,
    priority: cs.priority
  }));
  return careerObj;
};

// @desc    Get all available careers
// @route   GET /api/careers
// @access  Public
const getAllCareers = async (req, res, next) => {
  try {
    const careers = await Career.find().sort({ category: 1, title: 1 });
    
    // Attach populated career skills to each career
    const formattedCareers = await Promise.all(
      careers.map(c => formatCareerWithSkills(c))
    );

    res.status(200).json({
      success: true,
      count: formattedCareers.length,
      careers: formattedCareers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single career details by ID
// @route   GET /api/careers/:id
// @access  Public
const getCareerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Career ID format' });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found' });
    }

    const formattedCareer = await formatCareerWithSkills(career);

    res.status(200).json({
      success: true,
      career: formattedCareer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new career (Admin only)
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res, next) => {
  try {
    const { title, description, category, demand, salaryRange, icon } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Career title is required' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Career description is required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Career.findOne({ $or: [{ title: title.trim() }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Career with this title or slug already exists' });
    }

    const validDemands = ['Low', 'Medium', 'High', 'Very High', 'Critical'];
    const assignedDemand = validDemands.includes(demand) ? demand : 'High';

    const career = await Career.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      category: category && typeof category === 'string' ? category.trim() : 'Software Engineering',
      demand: assignedDemand,
      salaryRange: salaryRange && typeof salaryRange === 'string' ? salaryRange.trim() : '$85,000 - $135,000 / year',
      icon: icon || 'Briefcase'
    });

    const formattedCareer = await formatCareerWithSkills(career);

    res.status(201).json({
      success: true,
      message: 'Career created successfully',
      career: formattedCareer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update career details (Admin only)
// @route   PUT /api/careers/:id
// @access  Private/Admin
const updateCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Career ID format' });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    const { title, description, category, demand, salaryRange, icon } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Career title cannot be empty' });
      }
      career.title = title.trim();
      career.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Career description cannot be empty' });
      }
      career.description = description.trim();
    }

    if (category !== undefined) {
      career.category = typeof category === 'string' ? category.trim() : career.category;
    }

    if (demand !== undefined) {
      const validDemands = ['Low', 'Medium', 'High', 'Very High', 'Critical'];
      if (!validDemands.includes(demand)) {
        return res.status(400).json({ success: false, message: 'Invalid demand value' });
      }
      career.demand = demand;
    }

    if (salaryRange !== undefined) {
      career.salaryRange = typeof salaryRange === 'string' ? salaryRange.trim() : career.salaryRange;
    }

    if (icon !== undefined) {
      career.icon = typeof icon === 'string' ? icon.trim() : career.icon;
    }

    await career.save();

    const formattedCareer = await formatCareerWithSkills(career);

    res.status(200).json({
      success: true,
      message: 'Career updated successfully',
      career: formattedCareer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete career (Admin only - handles dependent record cleanup)
// @route   DELETE /api/careers/:id
// @access  Private/Admin
const deleteCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Career ID format' });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    // Dependent record cleanup: Delete associated CareerSkill requirements
    await CareerSkill.deleteMany({ career: id });

    // Reset users targeting this career
    await User.updateMany({ targetCareer: id }, { targetCareer: null });

    await career.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Career path and associated requirements deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Select target career for student
// @route   POST /api/careers/select-target
// @access  Private
const selectTargetCareer = async (req, res, next) => {
  try {
    const { careerId } = req.body;

    if (!careerId || !mongoose.Types.ObjectId.isValid(careerId)) {
      return res.status(400).json({ success: false, message: 'Valid Career ID is required' });
    }

    const career = await Career.findById(careerId);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found' });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    user.targetCareer = careerId;
    await user.save();

    const updatedUser = await User.findById(userId).populate('targetCareer');

    res.status(200).json({
      success: true,
      message: `Target career set to ${career.title}`,
      user: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================
// CAREER SKILLS (REQUIREMENTS) CONTROLLER ACTIONS
// ==============================================================

// @desc    Get skills required for a specific career
// @route   GET /api/careers/:id/skills
// @access  Public
const getCareerSkills = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Career ID format' });
    }

    const careerSkills = await CareerSkill.find({ career: id }).populate('skill');

    res.status(200).json({
      success: true,
      skills: careerSkills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a required skill requirement to a career (Admin only)
// @route   POST /api/careers/:id/skills
// @access  Private/Admin
const addCareerSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { skillId, requiredLevel, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Career ID format' });
    }

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ success: false, message: 'Valid Skill ID is required' });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found' });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const level = Number(requiredLevel);
    if (!Number.isInteger(level) || level < 0 || level > 4) {
      return res.status(400).json({ success: false, message: 'Required level must be an integer between 0 and 4' });
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const normPriority = typeof priority === 'string' ? priority.toLowerCase().trim() : '';
    if (!validPriorities.includes(normPriority)) {
      return res.status(400).json({ success: false, message: 'Priority must be one of: low, medium, high, critical' });
    }

    let careerSkill = await CareerSkill.findOne({ career: id, skill: skillId });

    if (careerSkill) {
      careerSkill.requiredLevel = level;
      careerSkill.priority = normPriority;
      await careerSkill.save();
    } else {
      careerSkill = await CareerSkill.create({
        career: id,
        skill: skillId,
        requiredLevel: level,
        priority: normPriority
      });
    }

    const populated = await CareerSkill.findById(careerSkill._id).populate('skill');

    res.status(201).json({
      success: true,
      message: 'Career skill requirement saved successfully',
      careerSkill: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a CareerSkill record by CareerSkill ID (Admin only)
// @route   PUT /api/career-skills/:id
// @access  Private/Admin
const updateCareerSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requiredLevel, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid CareerSkill ID format' });
    }

    const careerSkill = await CareerSkill.findById(id);
    if (!careerSkill) {
      return res.status(404).json({ success: false, message: 'Career skill requirement record not found' });
    }

    if (requiredLevel !== undefined) {
      const level = Number(requiredLevel);
      if (!Number.isInteger(level) || level < 0 || level > 4) {
        return res.status(400).json({ success: false, message: 'Required level must be an integer between 0 and 4' });
      }
      careerSkill.requiredLevel = level;
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      const normPriority = typeof priority === 'string' ? priority.toLowerCase().trim() : '';
      if (!validPriorities.includes(normPriority)) {
        return res.status(400).json({ success: false, message: 'Priority must be one of: low, medium, high, critical' });
      }
      careerSkill.priority = normPriority;
    }

    await careerSkill.save();

    const populated = await CareerSkill.findById(id).populate('skill');

    res.status(200).json({
      success: true,
      message: 'Career skill requirement updated successfully',
      careerSkill: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a CareerSkill record by CareerSkill ID (Admin only)
// @route   DELETE /api/career-skills/:id
// @access  Private/Admin
const deleteCareerSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid CareerSkill ID format' });
    }

    const careerSkill = await CareerSkill.findById(id);
    if (!careerSkill) {
      return res.status(404).json({ success: false, message: 'Career skill requirement record not found' });
    }

    await careerSkill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Career skill requirement removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  selectTargetCareer,
  getCareerSkills,
  addCareerSkill,
  updateCareerSkill,
  deleteCareerSkill
};
