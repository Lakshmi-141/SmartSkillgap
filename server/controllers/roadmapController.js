const User = require('../models/User');
const CareerPath = require('../models/CareerPath');

const getRoadmap = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('targetCareer');

    if (!user.targetCareer) {
      return res.json({
        success: true,
        hasTargetCareer: false,
        message: 'No target career selected',
        roadmap: []
      });
    }

    const career = await CareerPath.findById(user.targetCareer._id)
      .populate('roadmapSteps.skill');

    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path details not found' });
    }

    const userProgressMap = {};
    user.roadmapProgress.forEach(p => {
      userProgressMap[p.stepId] = p.completed;
    });

    const roadmapStepsWithProgress = career.roadmapSteps
      .sort((a, b) => a.order - b.order)
      .map(step => {
        const isCompleted = !!userProgressMap[step.stepId];
        return {
          stepId: step.stepId,
          title: step.title,
          description: step.description,
          order: step.order,
          estimatedHours: step.estimatedHours,
          targetLevel: step.targetLevel,
          skill: step.skill,
          completed: isCompleted
        };
      });

    const totalSteps = roadmapStepsWithProgress.length;
    const completedSteps = roadmapStepsWithProgress.filter(s => s.completed).length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    res.json({
      success: true,
      hasTargetCareer: true,
      careerTitle: career.title,
      totalSteps,
      completedSteps,
      progressPercentage,
      roadmap: roadmapStepsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

const toggleRoadmapStep = async (req, res, next) => {
  try {
    const { stepId } = req.body;

    if (!stepId) {
      return res.status(400).json({ success: false, message: 'stepId is required' });
    }

    const user = await User.findById(req.user.id);
    const existingIndex = user.roadmapProgress.findIndex(p => p.stepId === stepId);

    if (existingIndex > -1) {
      user.roadmapProgress[existingIndex].completed = !user.roadmapProgress[existingIndex].completed;
      user.roadmapProgress[existingIndex].completedAt = user.roadmapProgress[existingIndex].completed ? new Date() : null;
    } else {
      user.roadmapProgress.push({
        stepId,
        completed: true,
        completedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Roadmap progress updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRoadmap, toggleRoadmapStep };
