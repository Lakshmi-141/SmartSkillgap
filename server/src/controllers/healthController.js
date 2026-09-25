const healthService = require('../services/healthService');

const getHealth = (req, res) => {
  const healthData = healthService.checkHealthStatus();
  return res.status(200).json(healthData);
};

module.exports = {
  getHealth
};
