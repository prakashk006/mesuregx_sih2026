function errorHandler(err, req, res, next) {
  console.error('[MESUREGX ERROR]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.errorCode || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred. Please try again.';

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
}

module.exports = errorHandler;
