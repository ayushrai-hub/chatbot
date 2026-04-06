const { bookAppointmentAtomic } = require('../repositories/appointmentsRepository');

function bookAppointment(db, payload) {
  return bookAppointmentAtomic(db, payload);
}

module.exports = { bookAppointment };
