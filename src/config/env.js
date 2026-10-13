const requiredVariables = ['MONGODB_URI', 'JWT_SECRET', 'SUPER_ADMIN_SIGNUP_KEY'];

function readPositiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

function loadConfig() {
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';

  if (process.env.JWT_SECRET.length < 32 || process.env.SUPER_ADMIN_SIGNUP_KEY.length < 32) {
    throw new Error('JWT_SECRET and SUPER_ADMIN_SIGNUP_KEY must be at least 32 characters');
  }

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port: readPositiveInteger('PORT', 3000),
    mongoUri: process.env.MONGODB_URI,
    corsOrigins: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    rateLimitWindowMs: readPositiveInteger('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    rateLimitMax: readPositiveInteger('RATE_LIMIT_MAX', 100),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    superAdminSignupKey: process.env.SUPER_ADMIN_SIGNUP_KEY,
    scannerBaseUrl: (process.env.SCANNER_BASE_URL || 'http://localhost:3000/scan').replace(/\/$/, ''),
  });
}

module.exports = { loadConfig };
