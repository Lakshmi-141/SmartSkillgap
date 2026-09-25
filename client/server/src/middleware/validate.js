const mongoose = require('mongoose');

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: `Invalid format for ${paramName}` });
    }
    next();
  };
};

module.exports = { validateObjectId };
