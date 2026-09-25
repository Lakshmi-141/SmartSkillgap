const User = require('../models/User');
const SkillGap = require('../models/SkillGap');
const Roadmap = require('../models/Roadmap');
const Career = require('../models/Career');
const seedCareersData = require('../utils/seedCareersData');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const {
      name,
      education,
      college,
      degree,
      graduationYear,
      experienceLevel,
      interests,
      targetCareer
    } = req.body;

    if (name !== undefined) user.name = String(name).trim();
    if (education !== undefined) user.education = String(education).trim();
    if (college !== undefined) user.college = String(college).trim();
    if (degree !== undefined) user.degree = String(degree).trim();
    if (graduationYear !== undefined) user.graduationYear = String(graduationYear).trim();
    if (experienceLevel !== undefined) user.experienceLevel = String(experienceLevel).trim();
    if (interests !== undefined && Array.isArray(interests)) user.interests = interests;
    if (targetCareer !== undefined) {
      user.targetCareer = String(targetCareer).trim();
      user.targetRole = String(targetCareer).trim();
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated real dashboard summary for student dashboard
// @route   GET /api/users/dashboard-summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // 1. Fetch Skill Gap Analysis (or compute if missing)
    let skillGapDoc = await SkillGap.findOne({ user: userId });
    let matchPercentage = skillGapDoc ? skillGapDoc.matchPercentage : 0;
    let matchingSkillsCount = skillGapDoc ? skillGapDoc.matchingSkills.length : 0;
    let skillsToImproveCount = skillGapDoc ? skillGapDoc.skillsToImprove.length : 0;
    let missingSkillsCount = skillGapDoc ? skillGapDoc.missingSkills.length : 0;

    // 2. Fetch Roadmap Progress
    let roadmapDoc = await Roadmap.findOne({ user: userId });
    let roadmapProgress = roadmapDoc ? roadmapDoc.overallProgress : 0;
    let phases = roadmapDoc ? roadmapDoc.phases : [];

    // Identify active current learning phase
    let currentPhase = phases.find(p => p.status === 'In Progress') ||
                       phases.find(p => p.status === 'Not Started') ||
                       (phases.length > 0 ? phases[phases.length - 1] : null);

    // 3. Build Recent Activity Log from real user timestamps
    const activities = [];

    if (user.createdAt) {
      activities.push({
        id: 'act-1',
        title: 'Account Created',
        description: `Welcome to SmartSkillGap as ${user.name}`,
        timestamp: user.createdAt,
        type: 'auth'
      });
    }

    if (user.updatedAt && user.updatedAt > user.createdAt) {
      activities.push({
        id: 'act-2',
        title: 'Target Career Goal Set',
        description: `Selected target career: ${user.targetCareer || 'Full Stack Web Developer'}`,
        timestamp: user.updatedAt,
        type: 'career'
      });
    }

    if (user.skills && user.skills.length > 0) {
      const lastSkill = user.skills[user.skills.length - 1];
      activities.push({
        id: 'act-3',
        title: `Skill Added: ${lastSkill.name}`,
        description: `Proficiency set to ${lastSkill.proficiency}`,
        timestamp: lastSkill.updatedAt || new Date(),
        type: 'skill'
      });
    }

    if (skillGapDoc && skillGapDoc.updatedAt) {
      activities.push({
        id: 'act-4',
        title: 'Skill Gap Report Updated',
        description: `Calculated ${matchPercentage}% preparedness match for ${user.targetCareer}`,
        timestamp: skillGapDoc.updatedAt,
        type: 'analysis'
      });
    }

    if (roadmapDoc && roadmapDoc.updatedAt) {
      activities.push({
        id: 'act-5',
        title: 'Roadmap Milestone Progress',
        description: `Overall completion reached ${roadmapProgress}%`,
        timestamp: roadmapDoc.updatedAt,
        type: 'roadmap'
      });
    }

    // Sort recent activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      summary: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          targetCareer: user.targetCareer || 'Full Stack Web Developer',
          experienceLevel: user.experienceLevel,
          totalSkillsCount: user.skills ? user.skills.length : 0
        },
        skillGap: {
          matchPercentage,
          matchingSkillsCount,
          skillsToImproveCount,
          missingSkillsCount,
          totalRequiredSkillsCount: matchingSkillsCount + skillsToImproveCount + missingSkillsCount,
          topMissingSkills: skillGapDoc ? skillGapDoc.missingSkills.slice(0, 4) : []
        },
        roadmap: {
          progress: roadmapProgress,
          totalPhases: phases.length,
          completedPhasesCount: phases.filter(p => p.status === 'Completed').length,
          currentPhase: currentPhase ? {
            phaseNumber: currentPhase.phaseNumber,
            title: currentPhase.title,
            status: currentPhase.status,
            estimatedTime: currentPhase.estimatedTime
          } : null
        },
        recentActivity: activities.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getDashboardSummary
};
