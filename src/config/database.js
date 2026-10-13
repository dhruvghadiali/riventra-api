const mongoose = require('mongoose');

async function connectDatabase(mongoUri) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });

  await mongoose.connection.db.collection('app_metadata').updateOne(
    { key: 'database_initialized' },
    { $setOnInsert: { key: 'database_initialized', createdAt: new Date() } },
    { upsert: true },
  );

  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
