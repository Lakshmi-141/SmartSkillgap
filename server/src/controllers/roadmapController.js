const roadmapService = require('../services/roadmapService');

// @desc    Get user's personalized career roadmap for active target career
// @route   GET /api/roadmaps/my-roadmap or GET /api/roadmap
// @access  Private
const getMyRoadmap = async (req, res, next) => {
  try {
    const result = await roadmapService.getUserRoadmap(req.user.id);
    
    if (!result.hasTargetCareer) {
      return res.json({
        success: true,
        hasTargetCareer: false,
        message: 'No target career selected',
        roadmap: null
      });
    }

    res.json({
      success: true,
      hasTargetCareer: true,
      roadmap: result.roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get roadmap for a specific career ID
// @route   GET /api/roadmaps/:careerId
// @access  Private
const getRoadmapByCareer = async (req, res, next) => {
  try {
    const { careerId } = req.params;
    const roadmap = await roadmapService.getRoadmapByCareer(req.user.id, careerId);
    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate / Regenerate personalized career roadmap
// @route   POST /api/roadmaps/generate
// @access  Private
const generateRoadmap = async (req, res, next) => {
  try {
    const { careerId } = req.body;
    const roadmap = await roadmapService.generateRoadmap(req.user.id, careerId);
    res.json({
      success: true,
      message: 'Personalized career roadmap generated successfully',
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress or status of a roadmap step
// @route   PUT /api/roadmaps/:stepId
// @access  Private
const updateStepProgress = async (req, res, next) => {
  try {
    const { stepId } = req.params;
    const result = await roadmapService.updateStepProgress(req.user.id, stepId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle completion status of a roadmap step (legacy support)
// @route   POST /api/roadmap/toggle-step
// @access  Private
const toggleRoadmapStep = async (req, res, next) => {
  try {
    const { stepId } = req.body;
    if (!stepId) {
      return res.status(400).json({ success: false, message: 'stepId is required' });
    }

    const userRoadmapResult = await roadmapService.getUserRoadmap(req.user.id);
    if (!userRoadmapResult.roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const step = userRoadmapResult.roadmap.steps.id(stepId);
    if (!step) {
      return res.status(404).json({ success: false, message: 'Roadmap step not found' });
    }

    const newStatus = (step.status === 'COMPLETED' || step.status === 'completed') ? 'NOT_STARTED' : 'COMPLETED';
    const result = await roadmapService.updateStepProgress(req.user.id, stepId, { status: newStatus });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRoadmap,
  getRoadmapByCareer,
  generateRoadmap,
  updateStepProgress,
  toggleRoadmapStep,
  getRoadmap: getMyRoadmap
};
