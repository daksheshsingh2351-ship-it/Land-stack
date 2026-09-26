/**
 * Centralized error handling middleware.
 * Must be registered AFTER all routes.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Do not expose internal error messages in production for 500 errors
  const message = (isProduction && statusCode === 500) 
    ? 'Internal server error' 
    : (err.message || 'Internal server error');

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches requests that didn't match any route.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export { errorHandler, notFoundHandler };
