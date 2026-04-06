/**
 * Doctor appointment chatbot API — controlled responses from SQLite data only.
 */
const { startServer } = require('./bootstrap');

const parsedPort = parseInt(process.env.PORT, 10);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5050;

startServer(PORT).catch((err) => {
  console.error(err);
  process.exit(1);
});
