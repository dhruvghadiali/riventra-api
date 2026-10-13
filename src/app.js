const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { rateLimit } = require('express-rate-limit');
const healthRouter = require('./routes/health');
const { buildAuthRouter } = require('./routes/auth');
const { buildSuperAdminRouter } = require('./routes/super-admin');
const { buildCompanyRouter } = require('./routes/company');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');
const { sanitizeRequest } = require('./middleware/sanitize-request');

function createApp(config) {
  const app = express();

  app.disable('x-powered-by');

  if (config.isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin is not allowed by CORS');
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600,
  }));
  app.use(rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }));
  app.use(express.json({ limit: '100kb', strict: true }));
  app.use(express.urlencoded({ extended: false, limit: '100kb', parameterLimit: 100 }));
  app.use(hpp());
  app.use(sanitizeRequest);

  app.get('/', (req, res) => {
    res.status(200).json({ name: 'Riventra API', status: 'running' });
  });
  app.use('/health', healthRouter);
  app.use('/api/auth', buildAuthRouter(config));
  app.use('/api/super-admin', buildSuperAdminRouter(config));
  app.use('/api/company', buildCompanyRouter(config));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
