const express = require('express');
const doctorsRepo = require('../repositories/doctorsRepository');
const slotsRepo = require('../repositories/slotsRepository');
const validators = require('../services/validators');
const T = require('../services/responseTemplates');

function createAvailabilityRouter(db) {
  const r = express.Router();

  r.get('/:doctorId', (req, res) => {
    const doctor = doctorsRepo.getDoctorById(db, req.params.doctorId);
    if (!doctor) {
      return res.status(404).json({ error: T.FALLBACK });
    }

    const from = new Date().toISOString().slice(0, 10);
    const { date } = req.query;

    if (date != null && String(date).trim() !== '') {
      const d = String(date).trim();
      if (!validators.isValidIsoDate(d)) {
        return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD.' });
      }
      const slots = slotsRepo.listAvailableSlotsForDoctorDate(db, doctor.id, d);
      return res.json({
        doctorId: doctor.id,
        date: d,
        slots,
      });
    }

    const dates = slotsRepo.listAvailableDatesForDoctor(db, doctor.id, from, 14);
    res.json({
      doctorId: doctor.id,
      dates,
    });
  });

  return r;
}

module.exports = { createAvailabilityRouter };
