function listFaqs(db) {
  try {
    return db
      .prepare('SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC, id ASC')
      .all();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[faqs] listFaqs failed (run migrations / seed?):', e.message);
    return [];
  }
}

function getFaqById(db, id) {
  const n = parseInt(id, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return db.prepare('SELECT id, question, answer, sort_order FROM faqs WHERE id = ?').get(n);
}

module.exports = {
  listFaqs,
  getFaqById,
};
