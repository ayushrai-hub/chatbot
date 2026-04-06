const express = require('express');
const cors = require('cors');
const { createDoctorsRouter } = require('./routes/doctors');
const { createAvailabilityRouter } = require('./routes/availability');
const { createBookAppointmentRouter } = require('./routes/bookAppointment');
const { registerUserChatRoute } = require('./routes/user');

/**
 * @param {object} db — database wrapper from db/sqlJsAdapter (prepare/exec/transaction)
 */
function createApp(db) {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'chatbot-api',
      chatEngine: 'faq-appointments-sqljs',
      postUser: 'POST /user runs handleChatMessage (not a demo echo)',
    });
  });

  app.use('/doctors', createDoctorsRouter(db));
  app.use('/availability', createAvailabilityRouter(db));
  app.use('/book-appointment', createBookAppointmentRouter(db));
  registerUserChatRoute(app, db);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
