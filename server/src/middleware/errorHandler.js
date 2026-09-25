const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err.stack);

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate ${field} value entered. Please use another value.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid ID format`;
  }

  // Handle JSON SyntaxError / body-parser malformed JSON errors
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400 || 'body' in err)) {
    statusCode = 400;
    message = 'Invalid JSON payload received in request body';
  }


  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
