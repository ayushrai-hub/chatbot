const DEFAULT_CONTEXT = {};

function getSession(db, sessionId) {
  const row = db.prepare('SELECT * FROM chat_sessions WHERE session_id = ?').get(sessionId);
  if (!row) return null;
  let context = DEFAULT_CONTEXT;
  try {
    context = JSON.parse(row.context_json || '{}');
  } catch {
    context = {};
  }
  return {
    sessionId: row.session_id,
    flowState: row.flow_state,
    context,
  };
}

function upsertSession(db, sessionId, flowState, context) {
  const json = JSON.stringify(context && typeof context === 'object' ? context : {});
  db.prepare(
    `INSERT INTO chat_sessions (session_id, flow_state, context_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(session_id) DO UPDATE SET
       flow_state = excluded.flow_state,
       context_json = excluded.context_json,
       updated_at = datetime('now')`,
  ).run(sessionId, flowState, json);
}

function deleteSession(db, sessionId) {
  db.prepare('DELETE FROM chat_sessions WHERE session_id = ?').run(sessionId);
}

module.exports = {
  getSession,
  upsertSession,
  deleteSession,
};
