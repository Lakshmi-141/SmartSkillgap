const { calculateCareerReadiness } = require('../services/readinessService');

// @desc    Get comprehensive career readiness percentage
// @route   GET /api/readiness
// @access  Private
const getCareerReadiness = async (req, res, next) => {
  try {
    const result = await calculateCareerReadiness(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCareerReadiness };
