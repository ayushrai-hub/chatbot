const { handleChatMessage } = require('../services/chatHandler');

/**
 * Registers POST /user on the Express app (top-level route — not nested Router)
 * so the chat handler is always the real FAQ + appointment engine.
 */
function registerUserChatRoute(app, db) {
  app.post('/user', (req, res) => {
    const msg = req.body?.msg;
    const sessionId = req.body?.sessionId;

    if (msg == null || String(msg).trim() === '') {
      return res.status(400).json({ error: 'msg is required' });
    }

    try {
      const out = handleChatMessage(db, sessionId, msg);
      res.json({ reply: out.reply, sessionId: out.sessionId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[chat]', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

module.exports = { registerUserChatRoute };
