// Centralized error handler — keep controllers throwing/passing errors to
// `next(err)` where useful; anything uncaught lands here instead of
// crashing the process or leaking a stack trace to the client.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
