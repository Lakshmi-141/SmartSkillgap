const User = require('../models/User');
const SkillGap = require('../models/SkillGap');
const Roadmap = require('../models/Roadmap');
const AssessmentResult = require('../models/AssessmentResult');
const UserProjectProgress = require('../models/UserProjectProgress');

// @desc    Get overall student progress & calculate indicative career readiness percentage strictly on backend
// @route   GET /api/progress/readiness
// @access  Private
const getCareerReadiness = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Skill Completion Score (40% Weight)
    const skillGapDoc = await SkillGap.findOne({ user: userId });
    const skillCompletionScore = skillGapDoc ? skillGapDoc.matchPercentage : 0;

    // 2. Assessment Performance Score (20% Weight)
    const assessmentResults = await AssessmentResult.find({ user: userId });
    let assessmentScore = 0;
    if (assessmentResults.length > 0) {
      const totalPct = assessmentResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      assessmentScore = Math.round(totalPct / assessmentResults.length);
    }

    // 3. Roadmap Completion Score (20% Weight)
    const roadmapDoc = await Roadmap.findOne({ user: userId });
    const roadmapScore = roadmapDoc ? (roadmapDoc.overallProgress || 0) : 0;

    // 4. Project Completion Score (20% Weight)
    const projectProgresses = await UserProjectProgress.find({ user: userId });
    let projectScore = 0;
    if (projectProgresses.length > 0) {
      const completedCount = projectProgresses.filter(p => p.status === 'COMPLETED').length;
      const inProgressCount = projectProgresses.filter(p => p.status === 'IN_PROGRESS').length;
      projectScore = Math.round(((completedCount + (inProgressCount * 0.5)) / projectProgresses.length) * 100);
    }

    // Calculate weighted readiness percentage on backend
    const careerReadinessPercentage = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (skillCompletionScore * 0.4) +
          (assessmentScore * 0.2) +
          (roadmapScore * 0.2) +
          (projectScore * 0.2)
        )
      )
    );

    const user = await User.findById(userId).select('targetCareer targetRole');

    return res.status(200).json({
      success: true,
      targetCareer: user?.targetCareer || user?.targetRole || 'Full Stack Web Developer',
      careerReadinessPercentage,
      disclaimer: 'This is an indicative platform-generated readiness metric and does not guarantee employment.',
      breakdown: {
        skillCompletion: {
          percentage: skillCompletionScore,
          weight: 40,
          weightedContribution: Math.round(skillCompletionScore * 0.4)
        },
        assessmentPerformance: {
          percentage: assessmentScore,
          weight: 20,
          weightedContribution: Math.round(assessmentScore * 0.2),
          assessmentsTakenCount: assessmentResults.length
        },
        roadmapCompletion: {
          percentage: roadmapScore,
          weight: 20,
          weightedContribution: Math.round(roadmapScore * 0.2)
        },
        projectCompletion: {
          percentage: projectScore,
          weight: 20,
          weightedContribution: Math.round(projectScore * 0.2),
          totalProjectsTracked: projectProgresses.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCareerReadiness
};
