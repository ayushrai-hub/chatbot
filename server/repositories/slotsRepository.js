function listAvailableDatesForDoctor(db, doctorId, fromDate, limitDays = 14) {
  const did = parseInt(doctorId, 10);
  if (!Number.isFinite(did) || did < 1) return [];
  const rows = db
    .prepare(
      `SELECT DISTINCT slot_date FROM time_slots
       WHERE doctor_id = ? AND status = 'available' AND slot_date >= ?
       ORDER BY slot_date ASC
       LIMIT ?`,
    )
    .all(did, fromDate, limitDays);
  return rows.map((r) => r.slot_date);
}

function listAvailableSlotsForDoctorDate(db, doctorId, slotDate) {
  const did = parseInt(doctorId, 10);
  if (!Number.isFinite(did) || did < 1) return [];
  return db
    .prepare(
      `SELECT id, slot_time FROM time_slots
       WHERE doctor_id = ? AND slot_date = ? AND status = 'available'
       ORDER BY slot_time`,
    )
    .all(did, slotDate);
}

function getSlotById(db, slotId) {
  const sid = parseInt(slotId, 10);
  if (!Number.isFinite(sid) || sid < 1) return null;
  return db
    .prepare(
      `SELECT id, doctor_id, slot_date, slot_time, status FROM time_slots WHERE id = ?`,
    )
    .get(sid);
}

module.exports = {
  listAvailableDatesForDoctor,
  listAvailableSlotsForDoctorDate,
  getSlotById,
};
