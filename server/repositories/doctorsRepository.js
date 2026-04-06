function listDoctors(db) {
  return db
    .prepare(
      `SELECT id, name, specialization, years_experience, consultation_fee_amount, created_at
       FROM doctors ORDER BY id`,
    )
    .all();
}

function getDoctorById(db, id) {
  const n = parseInt(id, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return db
    .prepare(
      `SELECT id, name, specialization, years_experience, consultation_fee_amount, created_at
       FROM doctors WHERE id = ?`,
    )
    .get(n);
}

function findDoctorByNameLoose(db, nameFragment) {
  const q = String(nameFragment || '').trim().toLowerCase();
  if (!q) return null;
  const rows = db.prepare('SELECT id, name FROM doctors').all();
  const exact = rows.find((r) => r.name.toLowerCase() === q);
  if (exact) return getDoctorById(db, exact.id);
  const partial = rows.find((r) => r.name.toLowerCase().includes(q));
  if (partial) return getDoctorById(db, partial.id);
  return null;
}

module.exports = {
  listDoctors,
  getDoctorById,
  findDoctorByNameLoose,
};
