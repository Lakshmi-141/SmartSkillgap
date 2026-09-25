const User = require('../models/User');
const Career = require('../models/Career');
const SkillGap = require('../models/SkillGap');
const seedCareersData = require('../utils/seedCareersData');

// Helper to calculate deterministic skill gap logic
const performSkillGapAnalysis = async (userId, targetCareerTitle) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const careerTitle = targetCareerTitle || user.targetCareer || user.targetRole || 'Full Stack Developer';
  
  // Find career in DB or fallback to seed data
  let career = await Career.findOne({ title: new RegExp(`^${careerTitle.trim()}$`, 'i') });
  if (!career) {
    // If database empty or title mismatch, pick default seed career
    const seedMatch = seedCareersData.find(c => c.title.toLowerCase() === careerTitle.toLowerCase()) || seedCareersData[0];
    career = await Career.create(seedMatch);
  }

  const userSkills = user.skills || [];
  const requiredSkills = career.requiredSkills || [];

  const matchingSkills = [];
  const skillsToImprove = [];
  const missingSkills = [];

  // Deterministic categorization
  requiredSkills.forEach((reqSkill) => {
    const userMatch = userSkills.find(
      (us) => us.name.toLowerCase().trim() === reqSkill.name.toLowerCase().trim()
    );

    if (userMatch) {
      const prof = userMatch.proficiency || 'Beginner';
      if (['Intermediate', 'Advanced', 'Expert'].includes(prof)) {
        matchingSkills.push({
          name: reqSkill.name,
          category: reqSkill.category || 'Technical',
          proficiency: prof,
          importance: reqSkill.importance || 'Required'
        });
      } else {
        // Beginner level -> needs improvement
        skillsToImprove.push({
          name: reqSkill.name,
          category: reqSkill.category || 'Technical',
          proficiency: prof,
          importance: reqSkill.importance || 'Required'
        });
      }
    } else {
      // Not present in user profile -> Missing
      missingSkills.push({
        name: reqSkill.name,
        category: reqSkill.category || 'Technical',
        proficiency: 'None',
        importance: reqSkill.importance || 'Required'
      });
    }
  });

  const totalRequired = requiredSkills.length || 1;
  // Calculate deterministic score: full weight for matching, 0.5 for beginner skills to improve
  const matchPercentage = Math.round(
    ((matchingSkills.length + (skillsToImprove.length * 0.5)) / totalRequired) * 100
  );

  const clampedPercentage = Math.min(Math.max(matchPercentage, 0), 100);

  // Persist analysis to MongoDB
  let skillGapDoc = await SkillGap.findOne({ user: userId });
  if (skillGapDoc) {
    skillGapDoc.targetCareer = career.title;
    skillGapDoc.matchPercentage = clampedPercentage;
    skillGapDoc.matchingSkills = matchingSkills;
    skillGapDoc.skillsToImprove = skillsToImprove;
    skillGapDoc.missingSkills = missingSkills;
    skillGapDoc.totalRequiredSkillsCount = requiredSkills.length;
    await skillGapDoc.save();
  } else {
    skillGapDoc = await SkillGap.create({
      user: userId,
      targetCareer: career.title,
      matchPercentage: clampedPercentage,
      matchingSkills,
      skillsToImprove,
      missingSkills,
      totalRequiredSkillsCount: requiredSkills.length
    });
  }

  return {
    targetCareer: career.title,
    matchPercentage: clampedPercentage,
    totalRequiredSkillsCount: requiredSkills.length,
    matchingSkills,
    skillsToImprove,
    missingSkills,
    analyzedAt: skillGapDoc.updatedAt || skillGapDoc.createdAt
  };
};

// @desc    Analyze user's skill gap against target career
// @route   POST /api/skill-gap/analyze
// @access  Private
const analyzeSkillGap = async (req, res, next) => {
  try {
    const { careerTitle } = req.body;
    const analysis = await performSkillGapAnalysis(req.user._id, careerTitle);

    return res.status(200).json({
      success: true,
      message: 'Skill gap analysis generated successfully',
      analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's latest skill gap analysis
// @route   GET /api/skill-gap/:userId
// @access  Private
const getSkillGapByUserId = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    let skillGapDoc = await SkillGap.findOne({ user: targetUserId });
    
    // If no analysis exists yet, compute it now
    if (!skillGapDoc) {
      const analysis = await performSkillGapAnalysis(targetUserId);
      return res.status(200).json({
        success: true,
        analysis
      });
    }

    return res.status(200).json({
      success: true,
      analysis: {
        targetCareer: skillGapDoc.targetCareer,
        matchPercentage: skillGapDoc.matchPercentage,
        totalRequiredSkillsCount: skillGapDoc.totalRequiredSkillsCount,
        matchingSkills: skillGapDoc.matchingSkills,
        skillsToImprove: skillGapDoc.skillsToImprove,
        missingSkills: skillGapDoc.missingSkills,
        analyzedAt: skillGapDoc.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeSkillGap,
  getSkillGapByUserId
};
