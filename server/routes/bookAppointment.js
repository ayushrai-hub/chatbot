const express = require('express');
const doctorsRepo = require('../repositories/doctorsRepository');
const slotsRepo = require('../repositories/slotsRepository');
const { bookAppointment } = require('../services/bookingService');
const validators = require('../services/validators');
const T = require('../services/responseTemplates');

function createBookAppointmentRouter(db) {
  const r = express.Router();

  r.post('/', (req, res) => {
    const { doctorId, slotId, patientName, patientPhone } = req.body || {};

    const did = parseInt(doctorId, 10);
    const sid = parseInt(slotId, 10);
    if (!Number.isFinite(did) || did < 1 || !Number.isFinite(sid) || sid < 1) {
      return res.status(400).json({ error: 'doctorId and slotId must be positive integers.' });
    }
    if (!validators.isValidPatientName(patientName)) {
      return res.status(400).json({ error: 'patientName must be 2–120 characters.' });
    }
    if (!validators.isValidPhone(patientPhone)) {
      return res.status(400).json({ error: 'patientPhone format is invalid.' });
    }

    const doctor = doctorsRepo.getDoctorById(db, did);
    if (!doctor) {
      return res.status(404).json({ error: T.FALLBACK });
    }

    const slot = slotsRepo.getSlotById(db, sid);
    if (!slot || slot.doctor_id !== doctor.id) {
      return res.status(404).json({ error: T.FALLBACK });
    }
    if (slot.status !== 'available') {
      return res.status(409).json({ error: 'Slot is not available.' });
    }

    const phone = validators.normalizePhone(patientPhone);

    try {
      const appointmentId = bookAppointment(db, {
        doctorId: doctor.id,
        slotId: slot.id,
        patientName: String(patientName).trim(),
        patientPhone: phone,
      });

      res.status(201).json({
        appointmentId,
        doctorId: doctor.id,
        slotId: slot.id,
        date: slot.slot_date,
        time: slot.slot_time,
        patientName: String(patientName).trim(),
        status: 'confirmed',
      });
    } catch (e) {
      if (e && e.code === 'SLOT_UNAVAILABLE') {
        return res.status(409).json({ error: 'Slot is no longer available.' });
      }
      throw e;
    }
  });

  return r;
}

module.exports = { createBookAppointmentRouter };
