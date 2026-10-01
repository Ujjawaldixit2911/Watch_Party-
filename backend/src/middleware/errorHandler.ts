import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors[0]?.message || 'Invalid input data',
        details: err.errors,
      },
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 ? 'An internal server error occurred' : err.message;

  console.error('[Server Error]', err);

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
  });
}
