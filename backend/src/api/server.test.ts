import { createServer, registerErrorHandlers } from './server';
import { createValidationError, createNotFoundError, createServerError } from './errorHandler';
import request from 'supertest';

describe('Express Server Setup', () => {
  let app: ReturnType<typeof createServer>;

  beforeEach(() => {
    app = createServer();
  });

  it('should create an Express app', () => {
    expect(app).toBeDefined();
  });

  it('should parse JSON body', async () => {
    app.post('/test', (req, res) => {
      res.json({ received: req.body });
    });

    const response = await request(app)
      .post('/test')
      .send({ message: 'hello' })
      .expect(200);

    expect(response.body.received).toEqual({ message: 'hello' });
  });

  it('should have CORS headers', async () => {
    app.get('/test', (_req, res) => {
      res.json({ ok: true });
    });

    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should log requests', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    app.get('/test', (_req, res) => {
      res.json({ ok: true });
    });

    await request(app).get('/test');

    expect(consoleSpy).toHaveBeenCalled();
    const logCalls = consoleSpy.mock.calls.map(call => call[0]);
    const hasRequestLog = logCalls.some(log => 
      typeof log === 'string' && log.includes('GET') && log.includes('/test')
    );
    
    expect(hasRequestLog).toBe(true);
    
    consoleSpy.mockRestore();
  });
});

describe('Error Handling Integration', () => {
  let app: ReturnType<typeof createServer>;

  beforeEach(() => {
    app = createServer();
  });

  describe('Validation errors (400)', () => {
    it('should handle validation errors thrown in routes', async () => {
      app.post('/test', (_req, _res, next) => {
        next(createValidationError('Topic must be at least 3 characters'));
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Topic must be at least 3 characters',
        code: 'VALIDATION_ERROR'
      });
    });

    it('should include details in development mode', async () => {
      process.env.NODE_ENV = 'development';
      
      app.post('/test', (_req, _res, next) => {
        next(createValidationError('Invalid language', { provided: 'fr', allowed: ['en', 'hi'] }));
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid language',
        code: 'VALIDATION_ERROR',
        details: { provided: 'fr', allowed: ['en', 'hi'] }
      });
    });
  });

  describe('Not found errors (404)', () => {
    it('should handle not found errors thrown in routes', async () => {
      app.get('/test/:id', (_req, _res, next) => {
        next(createNotFoundError('Course not found'));
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .get('/test/123')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Course not found',
        code: 'NOT_FOUND'
      });
    });

    it('should handle undefined routes', async () => {
      registerErrorHandlers(app);

      const response = await request(app)
        .get('/api/undefined-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route GET /api/undefined-route not found',
        code: 'NOT_FOUND'
      });
    });
  });

  describe('Server errors (500)', () => {
    it('should handle server errors thrown in routes', async () => {
      app.post('/test', (_req, _res, next) => {
        next(createServerError('Course generation failed'));
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .post('/test')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Course generation failed',
        code: 'SERVER_ERROR'
      });
    });

    it('should handle unexpected errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      app.get('/test', () => {
        throw new Error('Unexpected error');
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should sanitize errors in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      app.get('/test', () => {
        throw new Error('Database connection string: secret123');
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error'
      });
      expect(response.body).not.toHaveProperty('details');
      expect(response.body).not.toHaveProperty('stack');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Async error handling', () => {
    it('should handle errors in async route handlers', async () => {
      app.get('/test', async (_req, _res, next) => {
        try {
          throw createServerError('Async operation failed');
        } catch (error) {
          next(error);
        }
      });
      
      registerErrorHandlers(app);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Async operation failed',
        code: 'SERVER_ERROR'
      });
    });
  });
});
