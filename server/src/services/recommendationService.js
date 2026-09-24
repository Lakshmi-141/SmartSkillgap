const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Project = require('../models/Project');
const { calculateSkillGap } = require('./skillGapService');

/**
 * Generates personalized resource and project recommendations for an authenticated user.
 * Strictly uses database user state (target career, skill gaps, user skills, completed projects).
 */
const getPersonalizedRecommendations = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID format');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).populate('targetCareer');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Calculate Skill Gap Analysis for user
  const gapAnalysis = await calculateSkillGap(userId);
  const careerTitle = gapAnalysis.career ? gapAnalysis.career.title : 'Selected Career';
  const skillsAnalysis = gapAnalysis.skills || [];

  // Filter skills that have a gap (>0) or are not yet completed
  const gapSkillsMap = new Map();
  skillsAnalysis.forEach(s => {
    if (s.skill && s.skill._id && (s.gap > 0 || s.status !== 'COMPLETED')) {
      gapSkillsMap.set(s.skill._id.toString(), s);
    }
  });

  const gapSkillIds = Array.from(gapSkillsMap.keys());

  // 2. Identify User Completed Project IDs to exclude
  const completedProjectIds = (user.projectProgress || [])
    .filter(p => p.status === 'completed')
    .map(p => p.project.toString());

  // 3. Recommended Resources
  let resourceQuery = {};
  if (gapSkillIds.length > 0) {
    resourceQuery.skill = { $in: gapSkillIds };
  }

  const candidateResources = await Resource.find(resourceQuery)
    .populate('skill', 'name category description')
    .limit(20);

  const recommendedResources = candidateResources.map(resObj => {
    const sId = resObj.skill ? resObj.skill._id.toString() : null;
    const gapInfo = sId ? gapSkillsMap.get(sId) : null;

    let reason = `Recommended learning resource for ${resObj.skill ? resObj.skill.name : 'skill building'}`;
    if (gapInfo) {
      reason = `Addresses your ${gapInfo.status} (${gapInfo.gap} level gap) in ${gapInfo.skill.name} for ${careerTitle}`;
    } else if (gapAnalysis.hasTargetCareer) {
      reason = `High-value resource aligned with your target career in ${careerTitle}`;
    }

    return {
      resource: resObj,
      reason
    };
  });

  // Sort resources: gap skills first
  recommendedResources.sort((a, b) => {
    const aHasGap = gapSkillsMap.has(a.resource.skill ? a.resource.skill._id.toString() : '');
    const bHasGap = gapSkillsMap.has(b.resource.skill ? b.resource.skill._id.toString() : '');
    if (aHasGap && !bHasGap) return -1;
    if (!aHasGap && bHasGap) return 1;
    return 0;
  });

  // 4. Recommended Projects
  let projectQuery = { _id: { $nin: completedProjectIds } };
  if (gapSkillIds.length > 0) {
    projectQuery.$or = [
      { requiredSkills: { $in: gapSkillIds } },
      { skillsGained: { $in: gapSkillIds } }
    ];
  }

  let candidateProjects = await Project.find(projectQuery)
    .populate('requiredSkills', 'name category')
    .populate('skillsGained', 'name category')
    .limit(20);

  // If no projects matched gap query specifically, fallback to all uncompleted projects
  if (candidateProjects.length === 0) {
    candidateProjects = await Project.find({ _id: { $nin: completedProjectIds } })
      .populate('requiredSkills', 'name category')
      .populate('skillsGained', 'name category')
      .limit(10);
  }

  const recommendedProjects = candidateProjects.map(projObj => {
    // Find matching gap skills in requiredSkills or skillsGained
    const matchedGapSkills = [];
    const allProjSkills = [...(projObj.requiredSkills || []), ...(projObj.skillsGained || [])];

    allProjSkills.forEach(s => {
      const sId = s._id.toString();
      if (gapSkillsMap.has(sId)) {
        matchedGapSkills.push(gapSkillsMap.get(sId).skill.name);
      }
    });

    const uniqueMatchedNames = [...new Set(matchedGapSkills)];

    let reason = `Recommended practical project for portfolio development in ${careerTitle}`;
    if (uniqueMatchedNames.length > 0) {
      reason = `Hands-on project to practice and close skill gaps in ${uniqueMatchedNames.join(', ')} for ${careerTitle}`;
    }

    return {
      project: projObj,
      reason
    };
  });

  return {
    success: true,
    hasTargetCareer: gapAnalysis.hasTargetCareer,
    targetCareer: gapAnalysis.career,
    recommendedResources: recommendedResources.slice(0, 10),
    recommendedProjects: recommendedProjects.slice(0, 10)
  };
};

module.exports = { getPersonalizedRecommendations };
