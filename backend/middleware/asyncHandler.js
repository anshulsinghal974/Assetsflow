/**
 * asyncHandler — wraps an async route handler so that any thrown error
 * is automatically forwarded to Express's centralized error handler.
 * Eliminates the need for try/catch in every controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
