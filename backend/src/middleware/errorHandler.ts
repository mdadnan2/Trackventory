import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message }
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation error', details: err.errors }
    });
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      error: { message: `A package with this name already exists. If you previously deleted a package with this name, please use a different name or contact support.` }
    });
  }

  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
};
