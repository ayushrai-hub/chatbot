const express = require('express');
const doctorsRepo = require('../repositories/doctorsRepository');
const T = require('../services/responseTemplates');

function createDoctorsRouter(db) {
  const r = express.Router();

  r.get('/', (_req, res) => {
    const doctors = doctorsRepo.listDoctors(db);
    res.json({ doctors });
  });

  r.get('/:id', (req, res) => {
    const d = doctorsRepo.getDoctorById(db, req.params.id);
    if (!d) {
      return res.status(404).json({ error: T.FALLBACK });
    }
    res.json({ doctor: d });
  });

  return r;
}

module.exports = { createDoctorsRouter };
