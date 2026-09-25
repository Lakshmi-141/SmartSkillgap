const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_smart_skillgap_2026';
  const expire = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id }, secret, {
    expiresIn: expire
  });
};

module.exports = generateToken;
