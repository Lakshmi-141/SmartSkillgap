const { getPersonalizedRecommendations } = require('../services/recommendationService');

// @desc    Get personalized resource and project recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const result = await getPersonalizedRecommendations(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
