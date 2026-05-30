// Wraps async controller functions so Express can send errors to errorMiddleware.
const asyncHandler = (controller) => (req, res, next) => {
  Promise.resolve(controller(req, res, next)).catch(next);
};

module.exports = asyncHandler;
