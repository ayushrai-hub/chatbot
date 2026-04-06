/**
 * Atomic booking: lock slot + insert appointment in one transaction.
 */
function bookAppointmentAtomic(db, { doctorId, slotId, patientName, patientPhone }) {
  const tx = db.transaction(() => {
    const lock = db
      .prepare(
        `UPDATE time_slots SET status = 'booked'
         WHERE id = ? AND doctor_id = ? AND status = 'available'`,
      )
      .run(slotId, doctorId);

    if (lock.changes !== 1) {
      const err = new Error('SLOT_UNAVAILABLE');
      err.code = 'SLOT_UNAVAILABLE';
      throw err;
    }

    const ins = db
      .prepare(
        `INSERT INTO appointments (doctor_id, slot_id, patient_name, patient_phone, status)
         VALUES (?, ?, ?, ?, 'confirmed')`,
      )
      .run(doctorId, slotId, patientName, patientPhone);

    return ins.lastInsertRowid;
  });

  return tx();
}

module.exports = {
  bookAppointmentAtomic,
};
