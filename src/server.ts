import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';

// Connect to MongoDB
connectDatabase()
  .then(() => {
    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  })
  .catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Promise Rejection:', error);
  // Do not exit the process in production
  if (config.nodeEnv !== 'production') {
    process.exit(1);
  }
});