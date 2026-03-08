/**
 * Main Server Entry Point
 * Orchestrates the startup sequence for the Backend Core
 * 
 * Requirements: Config.1, Non-Functional.1, Non-Functional.2, Non-Functional.3
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize and start the server
 */
async function startServer(): Promise<void> {
  try {
    const [{ configManager }, { database }, { createServer, registerErrorHandlers }, { createRouter }] = await Promise.all([
      import('./config/config'),
      import('./database/database'),
      import('./api/server'),
      import('./api/routes'),
    ]);

    console.log('Starting Backend Core...');
    console.log('AWS Region:', process.env.AWS_REGION);

    // Step 1: Initialize Config Manager and validate environment
    console.log('Validating configuration...');
    configManager.validate();
    const PORT = process.env.PORT || 5000;
    const nodeEnv = configManager.get('NODE_ENV');
    console.log(`Environment: ${nodeEnv}`);

    // Step 2: Initialize Database Layer
    console.log('Initializing database...');
    await database.initialize();
    console.log('Database initialized successfully');

    // Step 3: Initialize services with dependencies
    // Services are already initialized as singletons and use the database instance
    console.log('Services initialized');

    // Step 4: Create Express server and register routes
    console.log('Setting up Express server...');
    const app = createServer();
    
    // Register API routes
    const router = createRouter();
    app.use(router);
    
    // Register error handlers (must be after routes)
    registerErrorHandlers(app);

    // Step 5: Start Express server on configured port
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`✓ Backend Core is running on port ${PORT}`);
      console.log(`✓ API available at ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api`);
    });

    // Step 6: Add graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      // Close HTTP server
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connections
        try {
          await database.close();
          console.log('Database connections closed');
          console.log('Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('Error during database shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
