/**
 * Idempotent seed: doctors/slots when empty; FAQs when empty.
 * Runtime answers must come from DB, not invented at query time.
 */
function seedDoctorsIfEmpty(db) {
  const count = db.prepare('SELECT COUNT(*) AS c FROM doctors').get().c;
  if (count > 0) return;

  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialization, years_experience, consultation_fee_amount)
    VALUES (?, ?, ?, ?)
  `);

  const doctors = [
    ['Dr. Ana Sharma', 'Cardiology', 12, 150],
    ['Dr. Ben Okonkwo', 'Dermatology', 8, 120],
    ['Dr. Chen Wei', 'General Medicine', 15, 90],
  ];

  const insertSlot = db.prepare(`
    INSERT INTO time_slots (doctor_id, slot_date, slot_time, status)
    VALUES (?, ?, ?, 'available')
  `);

  const today = new Date();
  const dates = [];
  for (let d = 0; d < 14; d += 1) {
    const x = new Date(today);
    x.setDate(x.getDate() + d);
    const iso = x.toISOString().slice(0, 10);
    dates.push(iso);
  }

  const times = ['09:00', '10:00', '11:00', '14:00', '15:00'];

  const tx = db.transaction(() => {
    for (const row of doctors) {
      const info = insertDoctor.run(...row);
      const doctorId = info.lastInsertRowid;
      for (const slotDate of dates) {
        for (const slotTime of times) {
          insertSlot.run(doctorId, slotDate, slotTime);
        }
      }
    }
  });

  tx();
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('[seed] inserted demo doctors and time slots');
  }
}

function seedFaqsIfEmpty(db) {
  let count = 0;
  try {
    count = db.prepare('SELECT COUNT(*) AS c FROM faqs').get().c;
  } catch {
    return;
  }
  if (count > 0) return;

  const insert = db.prepare(
    'INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)',
  );

  const rows = [
    [
      'What are your clinic hours?',
      'Our clinic is open Monday–Friday 9:00–17:00 and Saturday 9:00–13:00. We are closed on Sundays and public holidays.',
      1,
    ],
    [
      'How do I book an appointment?',
      'In this chat, type “book appointment” and follow the steps to choose a doctor, date, and time. You can also use the clinic phone line listed on your referral paperwork.',
      2,
    ],
    [
      'What should I bring to my visit?',
      'Bring a valid photo ID, your insurance or payment information, a list of current medications, and any recent test results related to your visit.',
      3,
    ],
    [
      'How do I cancel or reschedule?',
      'Call the clinic at least 24 hours before your appointment. You can also ask here for doctor availability and book a new slot with “book appointment”.',
      4,
    ],
    [
      'Do you accept walk-ins?',
      'We prioritize scheduled appointments. Same-day visits may be available for urgent issues; ask at reception or check availability here with “list doctors”.',
      5,
    ],
  ];

  const tx = db.transaction(() => {
    for (const [q, a, order] of rows) {
      insert.run(q, a, order);
    }
  });
  tx();

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('[seed] inserted FAQ entries');
  }
}

function seed(db) {
  seedDoctorsIfEmpty(db);
  seedFaqsIfEmpty(db);
}

module.exports = { seed, seedDoctorsIfEmpty, seedFaqsIfEmpty };
