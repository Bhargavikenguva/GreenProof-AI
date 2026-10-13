export function errorHandler(err, req, res, next) {
  console.error('API Error:', err.message || err);

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size limit exceeded. Max 10MB for images, 15MB for documents.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // File filter errors
  if (err.message && (err.message.includes('Invalid image format') || err.message.includes('Invalid document format'))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback safe error message
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
}
