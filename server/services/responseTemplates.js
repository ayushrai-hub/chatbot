/**
 * Controlled copy only — every user-visible chat line is assembled here from data or fixed strings.
 * No free-form generation; unknown data → FALLBACK.
 */
const FALLBACK = 'Information not available.';

/** Numbered FAQ list from DB rows (question text only in the list). */
function formatFaqMenu(faqs) {
  if (!faqs || faqs.length === 0) return FALLBACK;
  const n = faqs.length;
  const lines = faqs.map((f, i) => `${i + 1}. ${f.question}`);
  return [
    `Choose a question by typing its number (1–${n}):`,
    ...lines,
    '',
    'Other commands: list doctors · details 1 · availability 1 · book appointment',
    'Type menu to see FAQ choices again.',
  ].join('\n');
}

/**
 * FAQ reply: first part is only the stored `answer` from the database; trailing line is fixed navigation copy.
 */
function faqAnswerOnlyWithCount(row, totalFaqs) {
  if (!row || row.answer == null || String(row.answer).trim() === '') return FALLBACK;
  const t = Math.max(1, parseInt(totalFaqs, 10) || 1);
  return `${String(row.answer).trim()}\n\n---\nType another number (1–${t}) or menu for the list.`;
}

/** @deprecated Prefer formatFaqMenu([]) or avoid empty FAQ table */
function helpMenu() {
  return [
    'Type menu to see FAQ questions, or: list doctors · book appointment.',
  ].join('\n');
}

function formatDoctorLine(d) {
  if (!d) return FALLBACK;
  return `${d.id}. ${d.name} — ${d.specialization}`;
}

function formatDoctorDetails(d) {
  if (!d) return FALLBACK;
  return [
    `Name: ${d.name}`,
    `Specialization: ${d.specialization}`,
    `Experience: ${d.years_experience} years`,
    `Consultation fee: ${d.consultation_fee_amount} (clinic currency units)`,
  ].join('\n');
}

function formatDoctorList(doctors) {
  if (!doctors || doctors.length === 0) return FALLBACK;
  const lines = doctors.map(formatDoctorLine);
  return ['Doctors:', ...lines].join('\n');
}

function formatAvailabilityDates(dates) {
  if (!dates || dates.length === 0) return FALLBACK;
  return ['Dates with available slots:', ...dates.map((d) => `- ${d}`)].join('\n');
}

function formatSlots(slots) {
  if (!slots || slots.length === 0) return FALLBACK;
  const lines = slots.map((s) => `${s.id}. ${s.slot_time}`);
  return ['Available times (reply with the number):', ...lines].join('\n');
}

function bookingAskDoctor(doctors) {
  if (!doctors || doctors.length === 0) return FALLBACK;
  return [
    'Booking: choose a doctor (reply with the number or full name).',
    ...doctors.map(formatDoctorLine),
  ].join('\n');
}

function bookingAskDate(dates) {
  if (!dates || dates.length === 0) return FALLBACK;
  return [
    'Choose a date (YYYY-MM-DD) from the list below:',
    ...dates.map((d) => `- ${d}`),
  ].join('\n');
}

function bookingAskName() {
  return 'Enter the patient full name (at least 2 characters).';
}

function bookingAskPhone() {
  return 'Enter a phone number (8–15 digits, optional leading +).';
}

function bookingConfirmed({ doctorName, date, time, patientName, appointmentId }) {
  if (!doctorName || !date || !time || !patientName || !appointmentId) return FALLBACK;
  return [
    'Booking confirmed.',
    `Appointment ID: ${appointmentId}`,
    `Doctor: ${doctorName}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Patient: ${patientName}`,
  ].join('\n');
}

function invalidInput() {
  return 'That input is not valid for this step. Please follow the prompt.';
}

function slotTakenOrInvalid() {
  return 'That time slot is no longer available. Say "book appointment" to start again.';
}

module.exports = {
  FALLBACK,
  formatFaqMenu,
  faqAnswerOnlyWithCount,
  helpMenu,
  formatDoctorLine,
  formatDoctorDetails,
  formatDoctorList,
  formatAvailabilityDates,
  formatSlots,
  bookingAskDoctor,
  bookingAskDate,
  bookingAskName,
  bookingAskPhone,
  bookingConfirmed,
  invalidInput,
  slotTakenOrInvalid,
};
