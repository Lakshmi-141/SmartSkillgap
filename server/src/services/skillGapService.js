const mongoose = require('mongoose');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');

/**
 * Calculates skill gap analysis for a given user against a target career.
 * 
 * SECURITY RULES:
 * 1. Current user skills are strictly fetched from MongoDB using userId (never trusted from frontend).
 * 2. Target career is fetched from database profile or validated career ID.
 * 3. Client-submitted scores, skill levels, or custom skills arrays are completely ignored.
 */
const calculateSkillGap = async (userId, targetCareerId = null) => {
  // 1. Fetch user from DB
  const user = await User.findById(userId).populate('targetCareer');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Resolve Target Career
  let career = null;
  if (targetCareerId) {
    if (!mongoose.Types.ObjectId.isValid(targetCareerId)) {
      const error = new Error('Invalid career ID format');
      error.statusCode = 400;
      throw error;
    }
    career = await Career.findById(targetCareerId);
    if (!career) {
      const error = new Error('Career not found');
      error.statusCode = 404;
      throw error;
    }
  } else if (user.targetCareer) {
    career = user.targetCareer;
  }

  // Handle case where user has no target career set
  if (!career) {
    return {
      success: true,
      hasTargetCareer: false,
      career: null,
      skills: [],
      overallSkillCoverage: 0,
      summary: {
        totalRequired: 0,
        completedCount: 0,
        lowGapCount: 0,
        mediumGapCount: 0,
        highGapCount: 0,
        overallSkillCoverage: 0
      },
      message: 'No target career selected'
    };
  }

  // 3. Fetch Career Required Skills
  const careerSkills = await CareerSkill.find({ career: career._id })
    .populate('skill', 'name category description icon');

  // 4. Fetch Authenticated User Skills from DB (Strictly Server-Side!)
  const userSkillsFromDB = await UserSkill.find({ user: userId })
    .populate('skill', 'name category');

  // Map user skill levels: skillId -> proficiency
  const userSkillMap = {};
  userSkillsFromDB.forEach(us => {
    if (us.skill) {
      const sId = us.skill._id ? us.skill._id.toString() : us.skill.toString();
      userSkillMap[sId] = us.proficiency !== undefined ? us.proficiency : 0;
    }
  });

  // Fallback for user document embedded skills array if any exist
  if (Array.isArray(user.skills)) {
    user.skills.forEach(s => {
      if (s.skill) {
        const sId = s.skill._id ? s.skill._id.toString() : s.skill.toString();
        if (userSkillMap[sId] === undefined) {
          userSkillMap[sId] = s.currentLevel !== undefined ? s.currentLevel : 0;
        }
      }
    });
  }

  // 5. Calculate Gap and Status for each Career Skill
  let sumEarned = 0;
  let sumRequired = 0;

  const calculatedSkillGaps = careerSkills.map(cs => {
    const skillObj = cs.skill;
    const skillIdStr = skillObj._id.toString();
    const currentLevel = userSkillMap[skillIdStr] !== undefined ? userSkillMap[skillIdStr] : 0;
    const requiredLevel = cs.requiredLevel;
    const priority = cs.priority || 'medium';

    // Formula: gap = requiredLevel - currentLevel
    const rawGap = requiredLevel - currentLevel;
    const gap = Math.max(0, rawGap);

    let status = 'COMPLETED';
    if (currentLevel >= requiredLevel) {
      status = 'COMPLETED';
    } else if (gap === 1) {
      status = 'LOW_GAP';
    } else if (gap === 2) {
      status = 'MEDIUM_GAP';
    } else if (gap >= 3) {
      status = 'HIGH_GAP';
    }

    sumEarned += Math.min(currentLevel, requiredLevel);
    sumRequired += requiredLevel;

    return {
      skill: {
        _id: skillObj._id,
        name: skillObj.name,
        category: skillObj.category,
        description: skillObj.description
      },
      currentLevel,
      requiredLevel,
      gap,
      status,
      priority
    };
  });

  // 6. Calculate overallSkillCoverage Server-Side (0-100%)
  const overallSkillCoverage = sumRequired > 0 
    ? Math.min(100, Math.round((sumEarned / sumRequired) * 100))
    : 100;

  // 7. Sort skills by: 1. Priority (critical > high > medium > low), 2. Gap (descending)
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  calculatedSkillGaps.sort((a, b) => {
    const priorityA = priorityOrder[a.priority?.toLowerCase()] || 0;
    const priorityB = priorityOrder[b.priority?.toLowerCase()] || 0;

    if (priorityB !== priorityA) {
      return priorityB - priorityA; // Higher priority first
    }
    return b.gap - a.gap; // Higher gap first
  });

  const completedCount = calculatedSkillGaps.filter(s => s.status === 'COMPLETED').length;
  const lowGapCount = calculatedSkillGaps.filter(s => s.status === 'LOW_GAP').length;
  const mediumGapCount = calculatedSkillGaps.filter(s => s.status === 'MEDIUM_GAP').length;
  const highGapCount = calculatedSkillGaps.filter(s => s.status === 'HIGH_GAP').length;

  return {
    success: true,
    hasTargetCareer: true,
    career: {
      _id: career._id,
      title: career.title,
      description: career.description,
      category: career.category,
      demand: career.demand,
      salaryRange: career.salaryRange
    },
    skills: calculatedSkillGaps,
    overallSkillCoverage,
    summary: {
      totalRequired: calculatedSkillGaps.length,
      completedCount,
      lowGapCount,
      mediumGapCount,
      highGapCount,
      overallSkillCoverage
    }
  };
};

module.exports = { calculateSkillGap };
