function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = Number.isInteger(error.status) ? error.status : 500;
  let message = error.message;

  if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyPattern || {})[0] || 'value';
    message = `${field} already exists`;
  }

  if (error.name === 'CastError') {
    status = 400;
    message = `Invalid ${error.path}`;
  }

  const isServerError = status >= 500;

  if (isServerError) {
    console.error(error);
  }

  return res.status(status).json({
    error: isServerError ? 'Internal Server Error' : error.name || 'Request Error',
    message: isServerError ? 'An unexpected error occurred' : message,
  });
}

module.exports = { notFoundHandler, errorHandler };
