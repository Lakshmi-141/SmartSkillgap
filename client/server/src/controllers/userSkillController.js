const mongoose = require('mongoose');
const UserSkill = require('../models/UserSkill');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Helper to validate integer between 0 and 4
const isValidProficiency = (val) => {
  if (val === undefined || val === null || val === '') return false;
  const num = Number(val);
  return Number.isInteger(num) && num >= 0 && num <= 4;
};

// @desc    Get current user's skills
// @route   GET /api/user-skills
// @access  Private
const getUserSkills = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userSkills = await UserSkill.find({ user: userId }).populate('skill');

    res.status(200).json({
      success: true,
      skills: userSkills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new skill to user profile or update if exists
// @route   POST /api/user-skills
// @access  Private
const addUserSkill = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const targetSkillId = req.body.skillId || req.body.skill;
    const { proficiency, source } = req.body;

    // Validate ObjectId for skill
    if (!targetSkillId || !mongoose.Types.ObjectId.isValid(targetSkillId)) {
      return res.status(400).json({ success: false, message: 'Valid skill ID is required' });
    }

    // Validate skill exists in master database
    const skillExists = await Skill.findById(targetSkillId);
    if (!skillExists) {
      return res.status(404).json({ success: false, message: 'Master skill not found' });
    }

    // Validate proficiency range 0-4
    if (!isValidProficiency(proficiency)) {
      return res.status(400).json({ success: false, message: 'Proficiency level must be an integer between 0 and 4' });
    }

    const profNum = Number(proficiency);

    // ALWAYS use req.user.id - never trust user / userId from req.body
    let userSkill = await UserSkill.findOne({ user: userId, skill: targetSkillId });

    if (userSkill) {
      userSkill.proficiency = profNum;
      userSkill.source = source && ['self', 'assessment', 'project', 'admin'].includes(source) ? source : 'self';
      await userSkill.save();
    } else {
      userSkill = await UserSkill.create({
        user: userId,
        skill: targetSkillId,
        proficiency: profNum,
        source: source && ['self', 'assessment', 'project', 'admin'].includes(source) ? source : 'self'
      });
    }

    const populatedUserSkill = await UserSkill.findById(userSkill._id).populate('skill');

    res.status(201).json({
      success: true,
      message: 'Skill proficiency saved successfully',
      userSkill: populatedUserSkill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing user skill proficiency by UserSkill ID or Skill ID
// @route   PUT /api/user-skills/:id
// @access  Private
const updateUserSkill = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { proficiency, source } = req.body;

    // Validate ID parameter ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID format' });
    }

    // Validate proficiency range 0-4
    if (!isValidProficiency(proficiency)) {
      return res.status(400).json({ success: false, message: 'Proficiency level must be an integer between 0 and 4' });
    }

    // Try finding by UserSkill document ID first
    let userSkill = await UserSkill.findById(id);

    // If not found by UserSkill ID, check if id is a Master Skill ID for this user
    if (!userSkill) {
      userSkill = await UserSkill.findOne({ user: userId, skill: id });
    }

    // IDOR Protection: Check ownership!
    if (!userSkill || userSkill.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Skill record not found or access denied' });
    }

    userSkill.proficiency = Number(proficiency);
    if (source && ['self', 'assessment', 'project', 'admin'].includes(source)) {
      userSkill.source = source;
    }

    await userSkill.save();

    const populatedUserSkill = await UserSkill.findById(userSkill._id).populate('skill');

    res.status(200).json({
      success: true,
      message: 'User skill updated successfully',
      userSkill: populatedUserSkill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill from user's profile with IDOR protection
// @route   DELETE /api/user-skills/:id
// @access  Private
const deleteUserSkill = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    // Validate ID parameter ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID format' });
    }

    // Try finding by UserSkill document ID first
    let userSkill = await UserSkill.findById(id);

    // If not found by UserSkill ID, check if id is a Master Skill ID for this user
    if (!userSkill) {
      userSkill = await UserSkill.findOne({ user: userId, skill: id });
    }

    // IDOR Protection: Check ownership!
    if (!userSkill || userSkill.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Skill record not found or access denied' });
    }

    await userSkill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill
};
