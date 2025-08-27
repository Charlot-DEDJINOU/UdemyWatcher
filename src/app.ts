import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { apiLimiter, scrapingLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import keywordsRouter from './routes/keywords';
import coursesRouter from './routes/courses';
import scraperRouter from './routes/scraper';

export const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use('/api/', apiLimiter);
  app.use('/api/scraper/trigger', scrapingLimiter);

  // Documentation Swagger
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'UdemyWatcher API Documentation'
  }));

  // Routes principales
  app.use('/api/keywords', keywordsRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/scraper', scraperRouter);

  // Route de santé
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Route racine
  app.get('/', (req, res) => {
    res.json({
      message: '🎓 UdemyWatcher API',
      version: '1.0.0',
      documentation: '/docs',
      health: '/health'
    });
  });

  // Gestionnaires d'erreur
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};