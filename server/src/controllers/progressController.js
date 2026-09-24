const mongoose = require('mongoose');
const { calculateCareerReadiness } = require('../services/readinessService');
const { updateStepProgress } = require('../services/roadmapService');

// @desc    Get user overall progress tracking and career readiness
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res, next) => {
  try {
    const result = await calculateCareerReadiness(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh or calculate progress metrics. Ignores fake client-submitted scores.
// @route   POST /api/progress
// @access  Private
const refreshProgress = async (req, res, next) => {
  try {
    // SECURITY: Completely ignore any client-submitted readiness values in req.body!
    // Server strictly calculates readiness metrics from DB.
    const result = await calculateCareerReadiness(req.user.id);
    res.json({
      ...result,
      message: 'Progress metrics calculated and synchronized server-side'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress for a specific roadmap step
// @route   PUT /api/progress/:roadmapStepId
// @access  Private
const updateProgressStep = async (req, res, next) => {
  try {
    const { roadmapStepId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roadmapStepId)) {
      return res.status(400).json({ success: false, message: 'Invalid roadmap step ID format' });
    }

    const result = await updateStepProgress(req.user.id, roadmapStepId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgress,
  refreshProgress,
  updateProgressStep
};
