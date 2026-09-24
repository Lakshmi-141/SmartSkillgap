const Skill = require('../models/Skill');
const User = require('../models/User');
const mongoose = require('mongoose');

const getAllSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json({
      success: true,
      skills
    });
  } catch (error) {
    next(error);
  }
};

const getUserSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('skills.skill');
    res.json({
      success: true,
      skills: user.skills
    });
  } catch (error) {
    next(error);
  }
};

const updateUserSkill = async (req, res, next) => {
  try {
    const { skillId, currentLevel } = req.body;

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ success: false, message: 'Valid Skill ID is required' });
    }

    const level = Number(currentLevel);
    if (isNaN(level) || level < 0 || level > 4) {
      return res.status(400).json({ success: false, message: 'Proficiency level must be between 0 and 4' });
    }

    const skillExists = await Skill.findById(skillId);
    if (!skillExists) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const user = await User.findById(req.user.id);

    const existingSkillIndex = user.skills.findIndex(
      s => s.skill.toString() === skillId
    );

    if (existingSkillIndex > -1) {
      user.skills[existingSkillIndex].currentLevel = level;
      user.skills[existingSkillIndex].source = 'self';
      user.skills[existingSkillIndex].updatedAt = new Date();
    } else {
      user.skills.push({
        skill: skillId,
        currentLevel: level,
        source: 'self',
        updatedAt: new Date()
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('skills.skill');

    res.json({
      success: true,
      message: 'Skill updated successfully',
      skills: updatedUser.skills
    });
  } catch (error) {
    next(error);
  }
};

const removeUserSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ success: false, message: 'Valid Skill ID is required' });
    }

    const user = await User.findById(req.user.id);
    user.skills = user.skills.filter(s => s.skill.toString() !== skillId);
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('skills.skill');

    res.json({
      success: true,
      message: 'Skill removed from profile',
      skills: updatedUser.skills
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getUserSkills,
  updateUserSkill,
  removeUserSkill
};
