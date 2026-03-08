import express, { Express, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import { errorHandler, notFoundHandler } from './errorHandler';

/**
 * Creates and configures the Express application
 * 
 * Requirements: Non-Functional.1, Non-Functional.2
 */
export function createServer(): Express {
  const app = express();
  const allowedOrigins = [
    'http://localhost:3000',
    'https://ai-vidya-for-bharat.vercel.app',
  ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header) and allowed browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Return false instead of throwing so disallowed origins are blocked
      // without triggering a server 500 response.
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  };

  // Configure CORS for frontend integration
  app.use(cors(corsOptions));

  // Handle browser preflight requests explicitly.
  app.options('*', cors(corsOptions));

  // Configure JSON body parser
  app.use(express.json());

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'Backend running' });
  });

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
    });
    
    next();
  });

  return app;
}

/**
 * Registers error handling middleware
 * 
 * This should be called after all routes are registered.
 * 
 * Requirements: Error.1, Error.3, Error.4
 * 
 * @param app - Express application instance
 */
export function registerErrorHandlers(app: Express): void {
  // 404 handler for undefined routes (must be after all route definitions)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);
}
