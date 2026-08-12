import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('API Error: %o', err);

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
      error: 'VALIDATION_ERROR',
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
      error: err.name,
    });
  }

  return res.status(500).json({
    success: false,
    data: null,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    error: 'INTERNAL_SERVER_ERROR',
  });
};
