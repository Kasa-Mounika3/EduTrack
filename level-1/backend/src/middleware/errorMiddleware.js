const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';

  // Mongoose throws this when an id is not a valid MongoDB ObjectId.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid student id';
  }

  // MongoDB duplicate key error, commonly caused by duplicate email.
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Student email already exists';
  }

  // Mongoose validation errors, such as missing required fields.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
