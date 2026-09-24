const mongoose = require('mongoose');
const Career = require('./Career');

// Export Career model as CareerPath for backward compatibility with existing code
module.exports = mongoose.models.Career || Career;
