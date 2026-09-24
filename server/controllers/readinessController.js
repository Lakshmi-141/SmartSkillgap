const User = require('../models/User');
const CareerPath = require('../models/CareerPath');
const AssessmentResult = require('../models/AssessmentResult');
const Project = require('../models/Project');

const getCareerReadiness = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('targetCareer')
      .populate('skills.skill');

    const disclaimer = "This is an indicative platform-generated readiness metric and does not guarantee employment.";

    if (!user.targetCareer) {
      return res.json({
        success: true,
        hasTargetCareer: false,
        readinessScore: 0,
        readinessLevel: 'Not Started',
        disclaimer,
        breakdown: {
          skillsScore: 0,
          assessmentScore: 0,
          roadmapScore: 0,
          projectScore: 0
        },
        message: 'Select a target career to view your personalized career readiness score.'
      });
    }

    const career = await CareerPath.findById(user.targetCareer._id)
      .populate('requiredSkills.skill');

    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found' });
    }

    const userSkillMap = {};
    user.skills.forEach(s => {
      if (s.skill && s.skill._id) {
        userSkillMap[s.skill._id.toString()] = s.currentLevel;
      }
    });

    let totalRequiredSum = 0;
    let totalAchievedSum = 0;

    career.requiredSkills.forEach(reqSkill => {
      const skillId = reqSkill.skill._id.toString();
      const reqLevel = reqSkill.requiredLevel;
      const currLevel = userSkillMap[skillId] !== undefined ? userSkillMap[skillId] : 0;

      totalRequiredSum += reqLevel;
      totalAchievedSum += Math.min(currLevel, reqLevel);
    });

    const skillsScorePercent = totalRequiredSum > 0 
      ? (totalAchievedSum / totalRequiredSum) * 100 
      : 0;
    const weightedSkillsScore = Math.round((skillsScorePercent * 0.40));

    const assessmentResults = await AssessmentResult.find({ user: user._id });
    let assessmentScorePercent = 0;
    if (assessmentResults.length > 0) {
      const totalScore = assessmentResults.reduce((acc, curr) => acc + curr.scorePercentage, 0);
      assessmentScorePercent = totalScore / assessmentResults.length;
    }
    const weightedAssessmentScore = Math.round((assessmentScorePercent * 0.20));

    const totalRoadmapSteps = career.roadmapSteps.length;
    const completedRoadmapSteps = user.roadmapProgress.filter(p => p.completed).length;
    const roadmapScorePercent = totalRoadmapSteps > 0 ? (completedRoadmapSteps / totalRoadmapSteps) * 100 : 0;
    const weightedRoadmapScore = Math.round((roadmapScorePercent * 0.20));

    const careerProjects = await Project.find({ careerPath: career._id });
    const totalProjects = careerProjects.length;
    const userCompletedProjectIds = new Set(
      user.projectProgress.filter(p => p.status === 'completed').map(p => p.project.toString())
    );
    const completedProjectsCount = careerProjects.filter(p => userCompletedProjectIds.has(p._id.toString())).length;
    const projectScorePercent = totalProjects > 0 ? (completedProjectsCount / totalProjects) * 100 : 0;
    const weightedProjectScore = Math.round((projectScorePercent * 0.20));

    const overallReadinessScore = Math.min(
      100,
      weightedSkillsScore + weightedAssessmentScore + weightedRoadmapScore + weightedProjectScore
    );

    let readinessLevel = 'Beginner / Needs Preparation';
    if (overallReadinessScore >= 85) {
      readinessLevel = 'Job Ready / Highly Competitive';
    } else if (overallReadinessScore >= 65) {
      readinessLevel = 'Advanced Preparedness';
    } else if (overallReadinessScore >= 45) {
      readinessLevel = 'Intermediate Progress';
    }

    res.json({
      success: true,
      hasTargetCareer: true,
      careerTitle: career.title,
      readinessScore: overallReadinessScore,
      readinessLevel,
      disclaimer,
      breakdown: {
        skillsScore: Math.round(skillsScorePercent),
        assessmentScore: Math.round(assessmentScorePercent),
        roadmapScore: Math.round(roadmapScorePercent),
        projectScore: Math.round(projectScorePercent),
        weights: {
          skills: '40%',
          assessment: '20%',
          roadmap: '20%',
          projects: '20%'
        }
      },
      stats: {
        skillsMet: `${career.requiredSkills.filter(r => (userSkillMap[r.skill._id.toString()] || 0) >= r.requiredLevel).length} / ${career.requiredSkills.length}`,
        assessmentsTaken: assessmentResults.length,
        roadmapCompleted: `${completedRoadmapSteps} / ${totalRoadmapSteps}`,
        projectsCompleted: `${completedProjectsCount} / ${totalProjects}`
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCareerReadiness };
