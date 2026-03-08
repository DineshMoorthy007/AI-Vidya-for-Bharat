import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

/**
 * Custom error class for application errors with status codes
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a validation error (400)
 */
export function createValidationError(message: string, details?: unknown): AppError {
  return new AppError(400, message, 'VALIDATION_ERROR', details);
}

/**
 * Creates a not found error (404)
 */
export function createNotFoundError(message: string = 'Resource not found'): AppError {
  return new AppError(404, message, 'NOT_FOUND');
}

/**
 * Creates a server error (500)
 */
export function createServerError(message: string = 'Internal server error', details?: unknown): AppError {
  return new AppError(500, message, 'SERVER_ERROR', details);
}

/**
 * Global error handling middleware
 * 
 * Handles all errors thrown in the application and formats them consistently.
 * 
 * Requirements: Error.1, Error.3, Error.4
 * 
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param _next - Express next function (unused but required for Express error handler signature)
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Determine if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production';

  // Default to 500 if not an AppError
  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    error: 'Internal server error'
  };

  if (err instanceof AppError) {
    // Handle known application errors
    statusCode = err.statusCode;
    errorResponse = {
      error: err.message,
      code: err.code
    };

    // Include details only in development mode
    if (!isProduction && err.details) {
      errorResponse.details = err.details;
    }
  } else {
    // Handle unexpected errors
    // Log the full error for debugging
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // In development, include error details
    if (!isProduction) {
      errorResponse = {
        error: err.message || 'Internal server error',
        details: {
          stack: err.stack,
          name: err.name
        }
      };
    }
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler for undefined routes
 * 
 * This middleware catches all requests that don't match any defined routes.
 * 
 * @param req - Express request
 * @param res - Express response
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND'
  };
  
  res.status(404).json(errorResponse);
}
