import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  createValidationError,
  createNotFoundError,
  createServerError,
  errorHandler,
  notFoundHandler
} from './errorHandler';
import { ErrorResponse } from '../types';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      path: '/api/test',
      method: 'GET'
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock
    };
    
    mockNext = jest.fn();
    
    // Store original NODE_ENV
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AppError class', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(400, 'Test error', 'TEST_CODE', { field: 'test' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError without optional properties', () => {
      const error = new AppError(500, 'Server error');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('Error factory functions', () => {
    it('should create validation error (400)', () => {
      const error = createValidationError('Invalid input', { field: 'topic' });
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'topic' });
    });

    it('should create not found error (404)', () => {
      const error = createNotFoundError('Course not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Course not found');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create not found error with default message', () => {
      const error = createNotFoundError();
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create server error (500)', () => {
      const error = createServerError('Database connection failed', { db: 'sqlite' });
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.details).toEqual({ db: 'sqlite' });
    });

    it('should create server error with default message', () => {
      const error = createServerError();
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('SERVER_ERROR');
    });
  });

  describe('errorHandler middleware', () => {
    describe('Validation errors (400)', () => {
      it('should handle validation error correctly', () => {
        const error = createValidationError('Topic must be at least 3 characters');
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Topic must be at least 3 characters',
          code: 'VALIDATION_ERROR'
        });
      });

      it('should include details in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = createValidationError('Invalid language', { provided: 'fr', allowed: ['en', 'hi'] });
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Invalid language',
          code: 'VALIDATION_ERROR',
          details: { provided: 'fr', allowed: ['en', 'hi'] }
        });
      });

      it('should sanitize details in production mode', () => {
        process.env.NODE_ENV = 'production';
        const error = createValidationError('Invalid input', { sensitive: 'data' });
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Invalid input',
          code: 'VALIDATION_ERROR'
        });
      });
    });

    describe('Not found errors (404)', () => {
      it('should handle not found error correctly', () => {
        const error = createNotFoundError('Course not found');
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Course not found',
          code: 'NOT_FOUND'
        });
      });
    });

    describe('Server errors (500)', () => {
      it('should handle server error correctly', () => {
        const error = createServerError('Course generation failed');
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Course generation failed',
          code: 'SERVER_ERROR'
        });
      });

      it('should include details in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = createServerError('AI service failed', { provider: 'bedrock', attempt: 3 });
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'AI service failed',
          code: 'SERVER_ERROR',
          details: { provider: 'bedrock', attempt: 3 }
        });
      });

      it('should sanitize details in production mode', () => {
        process.env.NODE_ENV = 'production';
        const error = createServerError('Database error', { connectionString: 'secret' });
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Database error',
          code: 'SERVER_ERROR'
        });
      });
    });

    describe('Unexpected errors', () => {
      it('should handle generic Error in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Unexpected error occurred');
        error.stack = 'Error stack trace';
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Unexpected error occurred',
          details: {
            stack: 'Error stack trace',
            name: 'Error'
          }
        });
        
        consoleErrorSpy.mockRestore();
      });

      it('should sanitize generic Error in production mode', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error('Database connection string: secret123');
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Internal server error'
        });
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle error without message', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error();
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Internal server error'
        });
        
        consoleErrorSpy.mockRestore();
      });
    });

    describe('Error logging', () => {
      it('should log unexpected errors with full context', () => {
        const error = new Error('Test error');
        error.stack = 'Stack trace';
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', expect.objectContaining({
          message: 'Test error',
          stack: 'Stack trace',
          path: '/api/test',
          method: 'GET',
          timestamp: expect.any(String)
        }));
        
        consoleErrorSpy.mockRestore();
      });

      it('should not log AppError (already handled)', () => {
        const error = createValidationError('Test validation error');
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('notFoundHandler middleware', () => {
    it('should return 404 for undefined routes', () => {
      const req = {
        ...mockRequest,
        path: '/api/unknown',
        method: 'GET'
      } as Request;
      
      notFoundHandler(req, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Route GET /api/unknown not found',
        code: 'NOT_FOUND'
      });
    });

    it('should handle POST requests to undefined routes', () => {
      const req = {
        ...mockRequest,
        path: '/api/invalid',
        method: 'POST'
      } as Request;
      
      notFoundHandler(req, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Route POST /api/invalid not found',
        code: 'NOT_FOUND'
      });
    });
  });

  describe('Error response format consistency', () => {
    it('should always return ErrorResponse structure', () => {
      const testCases = [
        createValidationError('Validation failed'),
        createNotFoundError('Not found'),
        createServerError('Server error'),
        new Error('Unexpected error')
      ];

      testCases.forEach((error) => {
        jsonMock.mockClear();
        statusMock.mockClear();
        
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        
        const response = jsonMock.mock.calls[0][0] as ErrorResponse;
        expect(response).toHaveProperty('error');
        expect(typeof response.error).toBe('string');
        expect(response.error.length).toBeGreaterThan(0);
      });
    });
  });
});
