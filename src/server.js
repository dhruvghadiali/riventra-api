require('dotenv').config();

const { createApp } = require('./app');
const { loadConfig } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

async function startServer() {
  const config = loadConfig();
  await connectDatabase(config.mongoUri);

  const app = createApp(config);
  const server = app.listen(config.port, () => {
    console.log(`Riventra API listening on port ${config.port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
