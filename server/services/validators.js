const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(s) {
  if (!ISO_DATE.test(String(s || '').trim())) return false;
  const d = new Date(`${s}T12:00:00.000Z`);
  return !Number.isNaN(d.getTime());
}

function isDateInBookingWindow(isoDate, maxDaysAhead = 60) {
  if (!isValidIsoDate(isoDate)) return false;
  const target = new Date(`${isoDate}T12:00:00.000Z`);
  const now = new Date();
  const start = new Date(now.toISOString().slice(0, 10) + 'T12:00:00.000Z');
  if (target < start) return false;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + maxDaysAhead);
  return target <= end;
}

/** E.164-friendly: optional +, then 8–15 digits */
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

function normalizePhone(raw) {
  return String(raw || '').replace(/[\s().-]/g, '');
}

function isValidPhone(raw) {
  const p = normalizePhone(raw);
  return PHONE_RE.test(p);
}

function isValidPatientName(name) {
  const t = String(name || '').trim();
  return t.length >= 2 && t.length <= 120;
}

function isValidSessionId(id) {
  if (id == null || typeof id !== 'string') return false;
  const t = id.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t);
}

module.exports = {
  isValidIsoDate,
  isDateInBookingWindow,
  isValidPhone,
  normalizePhone,
  isValidPatientName,
  isValidSessionId,
};
