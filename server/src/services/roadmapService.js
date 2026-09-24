const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const Career = require('../models/Career');
const { calculateSkillGap } = require('./skillGapService');

/**
 * Generate a personalized career roadmap for a user and target career.
 * Prioritizes high-gap and high-priority skills, honoring prerequisites if present.
 */
const generateRoadmap = async (userId, careerId = null) => {
  // 1. Validate user
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

  // 2. Resolve target career
  let targetCareerId = careerId;
  if (targetCareerId) {
    if (!mongoose.Types.ObjectId.isValid(targetCareerId)) {
      const error = new Error('Invalid career ID format');
      error.statusCode = 400;
      throw error;
    }
  } else if (user.targetCareer) {
    targetCareerId = user.targetCareer._id;
  }

  if (!targetCareerId) {
    const error = new Error('No target career selected');
    error.statusCode = 400;
    throw error;
  }

  const career = await Career.findById(targetCareerId);
  if (!career) {
    const error = new Error('Target career not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Calculate skill gap analysis
  const gapAnalysis = await calculateSkillGap(userId, career._id);
  const skillsList = gapAnalysis.skills || [];

  // 4. Sort skills based on prerequisites, priority, and gap
  const priorityWeight = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  // Helper map for quick skill lookup
  const skillMap = new Map();
  skillsList.forEach(item => {
    if (item.skill && item.skill._id) {
      skillMap.set(item.skill._id.toString(), item);
    }
  });

  // Sort logic: Check prerequisites first, then priority (desc), then gap (desc)
  const sortedSkills = [...skillsList].sort((a, b) => {
    const aId = a.skill._id ? a.skill._id.toString() : '';
    const bId = b.skill._id ? b.skill._id.toString() : '';

    // Check if a is a prerequisite of b
    if (b.skill.prerequisites && Array.isArray(b.skill.prerequisites)) {
      if (b.skill.prerequisites.some(prereq => prereq.toString() === aId)) {
        return -1; // a comes before b
      }
    }
    // Check if b is a prerequisite of a
    if (a.skill.prerequisites && Array.isArray(a.skill.prerequisites)) {
      if (a.skill.prerequisites.some(prereq => prereq.toString() === bId)) {
        return 1; // b comes before a
      }
    }

    const prioA = priorityWeight[(a.priority || 'MEDIUM').toUpperCase()] || 2;
    const prioB = priorityWeight[(b.priority || 'MEDIUM').toUpperCase()] || 2;

    if (prioB !== prioA) {
      return prioB - prioA; // Higher priority first
    }

    return b.gap - a.gap; // Higher gap first
  });

  // 5. Check if roadmap already exists to retain step progress if re-generating
  let existingRoadmap = await Roadmap.findOne({ user: userId, career: career._id });
  const existingStepsMap = new Map();
  if (existingRoadmap && Array.isArray(existingRoadmap.steps)) {
    existingRoadmap.steps.forEach(step => {
      if (step.skill) {
        existingStepsMap.set(step.skill.toString(), step);
      }
    });
  }

  // 6. Build personalized roadmap steps
  const steps = sortedSkills.map((item, index) => {
    const skillIdStr = item.skill._id.toString();
    const existingStep = existingStepsMap.get(skillIdStr);

    let status = 'NOT_STARTED';
    let progress = 0;
    let completedAt = null;
    const normPriority = (item.priority || 'MEDIUM').toUpperCase();

    if (existingStep) {
      // Retain existing step progress & status if set by user
      status = (existingStep.status || 'NOT_STARTED').toUpperCase();
      progress = existingStep.progress !== undefined ? existingStep.progress : 0;
      completedAt = existingStep.completedAt || null;
    } else {
      // Derive initial status from skill gap
      if (item.gap === 0 || item.currentLevel >= item.requiredLevel) {
        status = 'COMPLETED';
        progress = 100;
        completedAt = new Date();
      } else if (item.currentLevel > 0) {
        status = 'IN_PROGRESS';
        progress = Math.min(99, Math.max(1, Math.round((item.currentLevel / item.requiredLevel) * 100)));
        completedAt = null;
      } else {
        status = 'NOT_STARTED';
        progress = 0;
        completedAt = null;
      }
    }

    return {
      skill: item.skill._id,
      title: `Master ${item.skill.name}`,
      description: item.skill.description || `Bridge your skill gap in ${item.skill.name} for ${career.title}.`,
      order: index + 1,
      priority: normPriority,
      status,
      progress,
      completedAt
    };
  });

  // 7. Save or Update Roadmap in DB
  if (existingRoadmap) {
    existingRoadmap.steps = steps;
    existingRoadmap.generatedAt = new Date();
    await existingRoadmap.save();
  } else {
    existingRoadmap = await Roadmap.create({
      user: userId,
      career: career._id,
      steps,
      generatedAt: new Date()
    });
  }

  // Return populated roadmap
  const populatedRoadmap = await Roadmap.findById(existingRoadmap._id)
    .populate('steps.skill', 'name category description icon')
    .populate('career', 'title category description demand salaryRange');

  return populatedRoadmap;
};

/**
 * Get roadmap for a specific career for the authenticated user.
 */
const getRoadmapByCareer = async (userId, careerId) => {
  if (!mongoose.Types.ObjectId.isValid(careerId)) {
    const error = new Error('Invalid career ID format');
    error.statusCode = 400;
    throw error;
  }

  const career = await Career.findById(careerId);
  if (!career) {
    const error = new Error('Career not found');
    error.statusCode = 404;
    throw error;
  }

  let roadmap = await Roadmap.findOne({ user: userId, career: careerId })
    .populate('steps.skill', 'name category description icon')
    .populate('career', 'title category description demand salaryRange');

  if (!roadmap) {
    roadmap = await generateRoadmap(userId, careerId);
  }

  return roadmap;
};

/**
 * Get the current user's target career roadmap.
 */
const getUserRoadmap = async (userId) => {
  const user = await User.findById(userId).populate('targetCareer');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.targetCareer) {
    return {
      hasTargetCareer: false,
      message: 'No target career selected',
      roadmap: null
    };
  }

  const careerId = user.targetCareer._id;
  let roadmap = await Roadmap.findOne({ user: userId, career: careerId })
    .populate('steps.skill', 'name category description icon')
    .populate('career', 'title category description demand salaryRange');

  if (!roadmap) {
    roadmap = await generateRoadmap(userId, careerId);
  }

  return {
    hasTargetCareer: true,
    roadmap
  };
};

/**
 * Update step progress or status for a user's roadmap step.
 * Strictly prevents IDOR and mass assignment.
 */
const updateStepProgress = async (userId, stepId, updateData) => {
  // 1. Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(stepId)) {
    const error = new Error('Invalid step ID format');
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate step ownership & fetch roadmap (IDOR Prevention)
  const roadmap = await Roadmap.findOne({
    user: userId,
    'steps._id': stepId
  });

  if (!roadmap) {
    const error = new Error('Roadmap step not found or unauthorized access');
    error.statusCode = 404;
    throw error;
  }

  const step = roadmap.steps.id(stepId);
  if (!step) {
    const error = new Error('Roadmap step not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Strict mass-assignment protection: extract only status & progress
  const { status, progress } = updateData;

  // Process progress update if provided
  if (progress !== undefined && progress !== null) {
    const numProgress = Number(progress);
    if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
      const error = new Error('Progress must be a number between 0 and 100');
      error.statusCode = 400;
      throw error;
    }

    step.progress = numProgress;

    if (numProgress === 100) {
      step.status = 'COMPLETED';
      step.completedAt = new Date(); // Server sets completedAt! Never trust frontend.
    } else if (numProgress === 0) {
      step.status = 'NOT_STARTED';
      step.completedAt = null;
    } else {
      step.status = 'IN_PROGRESS';
      step.completedAt = null;
    }
  }

  // Process status update if provided
  if (status !== undefined && status !== null) {
    const normStatus = String(status).toUpperCase();
    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(normStatus)) {
      const error = new Error(`Invalid status value. Must be one of ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    step.status = normStatus;

    if (normStatus === 'COMPLETED') {
      step.progress = 100;
      if (!step.completedAt) step.completedAt = new Date();
    } else if (normStatus === 'NOT_STARTED') {
      step.progress = 0;
      step.completedAt = null;
    } else if (normStatus === 'IN_PROGRESS') {
      step.completedAt = null;
      if (step.progress === 0 || step.progress === 100) {
        step.progress = 50;
      }
    }
  }

  await roadmap.save();

  // Return updated roadmap populated
  const updatedRoadmap = await Roadmap.findById(roadmap._id)
    .populate('steps.skill', 'name category description icon')
    .populate('career', 'title category description demand salaryRange');

  const updatedStep = updatedRoadmap.steps.id(stepId);

  return {
    success: true,
    message: 'Roadmap step updated successfully',
    step: updatedStep,
    roadmap: updatedRoadmap
  };
};

module.exports = {
  generateRoadmap,
  getRoadmapByCareer,
  getUserRoadmap,
  updateStepProgress
};
