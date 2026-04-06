const { openDatabase, saveDatabaseSync } = require('./db/database');
const { migrate } = require('./db/migrate');
const { seed } = require('./db/seed');
const { createApp } = require('./app');

async function startServer(port) {
  const db = await openDatabase();
  migrate(db);
  seed(db);

  const app = createApp(db);

  const server = app.listen(port, () => {
    console.log(`Chatbot API listening on http://localhost:${port}`);
    console.log(`Health check: GET http://localhost:${port}/health (expect chatEngine: faq-appointments-sqljs)`);
    console.log(
      'POST /user uses the FAQ + appointment handler. If the UI shows “Demo API”, stop any other process on this port and restart.',
    );
  });

  const shutdown = () => {
    try {
      saveDatabaseSync();
    } catch (e) {
      console.error(e);
    }
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { startServer };
