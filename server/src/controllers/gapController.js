const { calculateSkillGap } = require('../services/skillGapService');

// @desc    Get skill gap analysis for authenticated user
// @route   GET /api/skill-gap or GET /api/gap-analysis
// @access  Private
const getSkillGap = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerId } = req.query;

    const result = await calculateSkillGap(userId, careerId);

    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Analyze skill gap for authenticated user against target career (Strictly Server-Side)
// @route   POST /api/skill-gap/analyze or POST /api/gap-analysis/analyze
// @access  Private
const analyzeSkillGap = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    // CRITICAL SECURITY: Ignore any fake current skills sent in req.body!
    const { careerId } = req.body;

    const result = await calculateSkillGap(userId, careerId);

    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getGapAnalysis: getSkillGap,
  getSkillGap,
  analyzeSkillGap
};
