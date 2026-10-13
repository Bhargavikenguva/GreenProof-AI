export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      req.body = parsed.data;
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body format',
      });
    }
  };
}
