const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
