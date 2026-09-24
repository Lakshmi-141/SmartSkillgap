const mongoose = require('mongoose');
const User = require('../models/User');
const Career = require('../models/Career');
const AssessmentResult = require('../models/AssessmentResult');
const Roadmap = require('../models/Roadmap');
const Project = require('../models/Project');
const { calculateSkillGap } = require('./skillGapService');

const DISCLAIMER_TEXT = "This is an indicative platform-generated readiness metric and does not guarantee employment.";

/**
 * Calculates overall career readiness percentage strictly server-side.
 * Weighted breakdown:
 * - Skill Completion = 40%
 * - Assessment Performance = 20%
 * - Roadmap Completion = 20%
 * - Project Completion = 20%
 */
const calculateCareerReadiness = async (userId) => {
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

  if (!user.targetCareer) {
    return {
      success: true,
      hasTargetCareer: false,
      readinessScore: 0,
      readinessLevel: 'Not Started',
      disclaimer: DISCLAIMER_TEXT,
      breakdown: {
        skillCompletion: 0,
        assessmentPerformance: 0,
        roadmapCompletion: 0,
        projectCompletion: 0,
        weights: {
          skillCompletion: '40%',
          assessmentPerformance: '20%',
          roadmapCompletion: '20%',
          projectCompletion: '20%'
        }
      },
      stats: {
        totalRequiredSkills: 0,
        completedSkills: 0,
        assessmentsTaken: 0,
        roadmapStepsCompleted: 0,
        totalRoadmapSteps: 0,
        projectsCompleted: 0,
        totalProjects: 0
      },
      message: 'No target career selected'
    };
  }

  const careerId = user.targetCareer._id;
  const career = await Career.findById(careerId);
  if (!career) {
    const error = new Error('Target career not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Skill Completion Score (Weight: 40%)
  const gapAnalysis = await calculateSkillGap(userId, careerId);
  const skillsList = gapAnalysis.skills || [];

  let totalReqSum = 0;
  let totalEarnedSum = 0;
  let completedSkillsCount = 0;

  skillsList.forEach(item => {
    const req = item.requiredLevel || 0;
    const cur = item.currentLevel || 0;
    totalReqSum += req;
    totalEarnedSum += Math.min(cur, req);
    if (item.status === 'COMPLETED' || cur >= req) {
      completedSkillsCount++;
    }
  });

  const skillCompletionPercent = totalReqSum > 0
    ? Math.min(100, Math.round((totalEarnedSum / totalReqSum) * 100))
    : 100;
  const weightedSkillScore = skillCompletionPercent * 0.40;

  // 2. Assessment Performance Score (Weight: 20%)
  const assessmentResults = await AssessmentResult.find({ user: userId });
  let assessmentPerfPercent = 0;
  if (assessmentResults.length > 0) {
    const sumScores = assessmentResults.reduce((acc, curr) => {
      const pct = curr.percentage !== undefined ? curr.percentage : (curr.scorePercentage || 0);
      return acc + pct;
    }, 0);
    assessmentPerfPercent = Math.min(100, Math.round(sumScores / assessmentResults.length));
  }
  const weightedAssessmentScore = assessmentPerfPercent * 0.20;

  // 3. Roadmap Milestone Completion (Weight: 20%)
  let roadmapCompletionPercent = 0;
  let completedRoadmapSteps = 0;
  let totalRoadmapSteps = 0;

  const userRoadmap = await Roadmap.findOne({ user: userId, career: careerId });
  if (userRoadmap && Array.isArray(userRoadmap.steps) && userRoadmap.steps.length > 0) {
    totalRoadmapSteps = userRoadmap.steps.length;
    let sumStepProgress = 0;
    userRoadmap.steps.forEach(step => {
      sumStepProgress += step.progress || 0;
      if (step.status === 'COMPLETED' || step.progress === 100) {
        completedRoadmapSteps++;
      }
    });
    roadmapCompletionPercent = Math.min(100, Math.round(sumStepProgress / totalRoadmapSteps));
  } else {
    totalRoadmapSteps = skillsList.length;
    completedRoadmapSteps = completedSkillsCount;
    roadmapCompletionPercent = totalRoadmapSteps > 0 ? Math.round((completedRoadmapSteps / totalRoadmapSteps) * 100) : 0;
  }
  const weightedRoadmapScore = roadmapCompletionPercent * 0.20;

  // 4. Project Completion Score (Weight: 20%)
  const allProjects = await Project.find();
  const completedProjectIds = new Set(
    (user.projectProgress || [])
      .filter(p => p.status === 'completed')
      .map(p => p.project.toString())
  );

  const completedProjectsCount = completedProjectIds.size;
  const totalProjectsCount = allProjects.length > 0 ? allProjects.length : 5;
  const projectCompletionPercent = totalProjectsCount > 0
    ? Math.min(100, Math.round((completedProjectsCount / totalProjectsCount) * 100))
    : 0;
  const weightedProjectScore = projectCompletionPercent * 0.20;

  // Overall Readiness Score Calculation
  const readinessScore = Math.min(
    100,
    Math.max(0, Math.round(weightedSkillScore + weightedAssessmentScore + weightedRoadmapScore + weightedProjectScore))
  );

  let readinessLevel = 'Beginner / Needs Preparation';
  if (readinessScore >= 85) {
    readinessLevel = 'Job Ready / Highly Competitive';
  } else if (readinessScore >= 65) {
    readinessLevel = 'Advanced Preparedness';
  } else if (readinessScore >= 45) {
    readinessLevel = 'Intermediate Progress';
  }

  return {
    success: true,
    hasTargetCareer: true,
    career: {
      _id: career._id,
      title: career.title,
      category: career.category
    },
    readinessScore,
    readinessLevel,
    disclaimer: DISCLAIMER_TEXT,
    breakdown: {
      skillCompletion: skillCompletionPercent,
      assessmentPerformance: assessmentPerfPercent,
      roadmapCompletion: roadmapCompletionPercent,
      projectCompletion: projectCompletionPercent,
      weights: {
        skillCompletion: '40%',
        assessmentPerformance: '20%',
        roadmapCompletion: '20%',
        projectCompletion: '20%'
      }
    },
    stats: {
      totalRequiredSkills: skillsList.length,
      completedSkills: completedSkillsCount,
      assessmentsTaken: assessmentResults.length,
      roadmapStepsCompleted: completedRoadmapSteps,
      totalRoadmapSteps,
      projectsCompleted: completedProjectsCount,
      totalProjects: totalProjectsCount
    }
  };
};

module.exports = {
  calculateCareerReadiness,
  DISCLAIMER_TEXT
};
