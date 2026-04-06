const crypto = require('crypto');
const doctorsRepo = require('../repositories/doctorsRepository');
const slotsRepo = require('../repositories/slotsRepository');
const faqsRepo = require('../repositories/faqsRepository');
const sessionsRepo = require('../repositories/sessionsRepository');
const { bookAppointment } = require('./bookingService');
const validators = require('./validators');
const T = require('./responseTemplates');

const FLOW = {
  IDLE: 'idle',
  FAQ_PICK: 'faq_pick',
  BOOKING_DOCTOR: 'booking_doctor',
  BOOKING_DATE: 'booking_date',
  BOOKING_SLOT: 'booking_slot',
  BOOKING_NAME: 'booking_name',
  BOOKING_PHONE: 'booking_phone',
};

const BOOKING_STATES = new Set([
  FLOW.BOOKING_DOCTOR,
  FLOW.BOOKING_DATE,
  FLOW.BOOKING_SLOT,
  FLOW.BOOKING_NAME,
  FLOW.BOOKING_PHONE,
]);

function newSessionId() {
  return crypto.randomUUID();
}

function todayIsoUtc() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeMsg(msg) {
  return String(msg || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseLeadingId(text) {
  const m = String(text).match(/^(?:details|info|doctor|availability|avail|book|slot)\s+(\d+)\s*$/i);
  if (m) return parseInt(m[1], 10);
  const m2 = String(text).match(/^(\d+)$/);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

function detectIdleIntent(db, msgLower) {
  if (
    /^(hi|hello|hey|help|menu|start)\b/i.test(msgLower) ||
    msgLower === '?' ||
    /^faq$/i.test(msgLower) ||
    /^questions?$/i.test(msgLower)
  ) {
    return { type: 'faq_menu' };
  }
  if (/\b(list|show|all)\s+doctors\b/i.test(msgLower) || msgLower === 'doctors' || msgLower === 'list doctors') {
    return { type: 'list_doctors' };
  }
  if (/\bbook\b/i.test(msgLower) || /\bappointment\b/i.test(msgLower) || /\bschedule\b/i.test(msgLower)) {
    if (/\bbook\s+appointment\b/i.test(msgLower) || /\bappointment\b/i.test(msgLower)) {
      return { type: 'start_booking' };
    }
    if (msgLower === 'book' || /^book\s+/i.test(msgLower)) {
      return { type: 'start_booking' };
    }
  }

  const det = msgLower.match(/(?:^|\s)(details|info)\s+(\d+)/i);
  if (det) return { type: 'doctor_detail', doctorId: parseInt(det[2], 10) };

  const av = msgLower.match(/availability\s+(\d+)/i);
  if (av) return { type: 'availability', doctorId: parseInt(av[1], 10) };

  const av2 = msgLower.match(/avail\s+(\d+)/i);
  if (av2) return { type: 'availability', doctorId: parseInt(av2[1], 10) };

  const byName = doctorsRepo.findDoctorByNameLoose(db, msgLower);
  if (byName && msgLower.length > 2) {
    return { type: 'doctor_detail_id', doctor: byName };
  }

  return { type: 'faq_menu' };
}

function handleIdle(db, msg) {
  const msgLower = normalizeMsg(msg).toLowerCase();
  const intent = detectIdleIntent(db, msgLower);

  switch (intent.type) {
    case 'faq_menu': {
      const list = faqsRepo.listFaqs(db);
      return { reply: T.formatFaqMenu(list), enterFaqPick: true };
    }
    case 'list_doctors': {
      const doctors = doctorsRepo.listDoctors(db);
      return { reply: T.formatDoctorList(doctors), enterFaqPick: false };
    }
    case 'doctor_detail': {
      const d = doctorsRepo.getDoctorById(db, intent.doctorId);
      return { reply: T.formatDoctorDetails(d), enterFaqPick: false };
    }
    case 'doctor_detail_id':
      return { reply: T.formatDoctorDetails(intent.doctor), enterFaqPick: false };
    case 'availability': {
      const d = doctorsRepo.getDoctorById(db, intent.doctorId);
      if (!d) return { reply: T.FALLBACK, enterFaqPick: false };
      const dates = slotsRepo.listAvailableDatesForDoctor(db, d.id, todayIsoUtc(), 14);
      const header = `${T.formatDoctorDetails(d)}\n\n`;
      return { reply: header + T.formatAvailabilityDates(dates), enterFaqPick: false };
    }
    case 'start_booking':
      return null;
    default: {
      const list = faqsRepo.listFaqs(db);
      return { reply: T.formatFaqMenu(list), enterFaqPick: true };
    }
  }
}

function resolveDoctorChoice(db, text, doctors) {
  const trimmed = normalizeMsg(text);
  const idGuess = parseLeadingId(trimmed);
  if (idGuess != null) {
    const byId = doctorsRepo.getDoctorById(db, idGuess);
    if (byId) return byId;
    const byIndex = doctors[idGuess - 1];
    if (byIndex) return doctorsRepo.getDoctorById(db, byIndex.id);
  }
  return doctorsRepo.findDoctorByNameLoose(db, trimmed);
}

function handleChatMessage(db, sessionIdIn, msg) {
  const msgNorm = normalizeMsg(msg);
  if (!msgNorm) {
    return { reply: T.invalidInput(), sessionId: sessionIdIn || newSessionId() };
  }

  let sessionId = validators.isValidSessionId(sessionIdIn) ? sessionIdIn.trim() : newSessionId();
  let session = sessionsRepo.getSession(db, sessionId);
  if (!session) {
    sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
    session = { sessionId, flowState: FLOW.IDLE, context: {} };
  }

  let { flowState, context } = session;

  if (/^cancel$/i.test(msgNorm) && flowState !== FLOW.IDLE) {
    sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
    const list = faqsRepo.listFaqs(db);
    const prefix = BOOKING_STATES.has(flowState) ? 'Booking cancelled.\n\n' : '';
    return { reply: prefix + T.formatFaqMenu(list), sessionId };
  }

  const bookingCue =
    /\bbook\b/i.test(msgNorm) ||
    /\bappointment\b/i.test(msgNorm) ||
    /^start\s+booking$/i.test(msgNorm);

  if (flowState === FLOW.FAQ_PICK) {
    if (bookingCue) {
      const doctors = doctorsRepo.listDoctors(db);
      sessionsRepo.upsertSession(db, sessionId, FLOW.BOOKING_DOCTOR, {});
      return { reply: T.bookingAskDoctor(doctors), sessionId };
    }
    if (/^(menu|help|questions|faq|start)$/i.test(msgNorm)) {
      const list = faqsRepo.listFaqs(db);
      return { reply: T.formatFaqMenu(list), sessionId };
    }
    const onlyNumFaq = msgNorm.match(/^(\d+)$/);
    if (onlyNumFaq) {
      const n = parseInt(onlyNumFaq[1], 10);
      const faqs = faqsRepo.listFaqs(db);
      if (faqs.length && n >= 1 && n <= faqs.length) {
        return { reply: T.faqAnswerOnlyWithCount(faqs[n - 1], faqs.length), sessionId };
      }
    }
    const idleTry = handleIdle(db, msgNorm);
    if (idleTry && idleTry.enterFaqPick === false) {
      sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
      return { reply: idleTry.reply, sessionId };
    }
    const list = faqsRepo.listFaqs(db);
    return { reply: T.invalidInput() + '\n\n' + T.formatFaqMenu(list), sessionId };
  }

  if (flowState === FLOW.IDLE) {
    if (bookingCue) {
      const doctors = doctorsRepo.listDoctors(db);
      sessionsRepo.upsertSession(db, sessionId, FLOW.BOOKING_DOCTOR, {});
      return { reply: T.bookingAskDoctor(doctors), sessionId };
    }

    const onlyNum = msgNorm.match(/^(\d+)$/);
    if (onlyNum) {
      const n = parseInt(onlyNum[1], 10);
      const faqs = faqsRepo.listFaqs(db);
      if (faqs.length && n >= 1 && n <= faqs.length) {
        sessionsRepo.upsertSession(db, sessionId, FLOW.FAQ_PICK, {});
        return { reply: T.faqAnswerOnlyWithCount(faqs[n - 1], faqs.length), sessionId };
      }
    }

    const idleReply = handleIdle(db, msgNorm);
    if (idleReply) {
      if (idleReply.enterFaqPick) {
        sessionsRepo.upsertSession(db, sessionId, FLOW.FAQ_PICK, {});
      } else {
        sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
      }
      return { reply: idleReply.reply, sessionId };
    }
  }

  if (flowState === FLOW.BOOKING_DOCTOR) {
    const doctors = doctorsRepo.listDoctors(db);
    const chosen = resolveDoctorChoice(db, msgNorm, doctors);
    if (!chosen) {
      return { reply: T.invalidInput() + '\n\n' + T.bookingAskDoctor(doctors), sessionId };
    }
    const dates = slotsRepo.listAvailableDatesForDoctor(db, chosen.id, todayIsoUtc(), 14);
    if (!dates.length) {
      sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
      return { reply: T.FALLBACK, sessionId };
    }
    sessionsRepo.upsertSession(db, sessionId, FLOW.BOOKING_DATE, {
      doctorId: chosen.id,
    });
    return {
      reply: `Selected: ${chosen.name}\n\n${T.bookingAskDate(dates)}`,
      sessionId,
    };
  }

  if (flowState === FLOW.BOOKING_DATE) {
    const dateStr = msgNorm.trim();
    if (!validators.isDateInBookingWindow(dateStr)) {
      const dates = slotsRepo.listAvailableDatesForDoctor(db, context.doctorId, todayIsoUtc(), 14);
      return {
        reply: T.invalidInput() + '\n\n' + T.bookingAskDate(dates),
        sessionId,
      };
    }
    const allowed = slotsRepo.listAvailableDatesForDoctor(db, context.doctorId, todayIsoUtc(), 14);
    if (!allowed.includes(dateStr)) {
      return {
        reply: T.invalidInput() + '\n\n' + T.bookingAskDate(allowed),
        sessionId,
      };
    }
    const slots = slotsRepo.listAvailableSlotsForDoctorDate(db, context.doctorId, dateStr);
    if (!slots.length) {
      sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
      return { reply: T.FALLBACK, sessionId };
    }
    sessionsRepo.upsertSession(db, sessionId, FLOW.BOOKING_SLOT, {
      ...context,
      slotDate: dateStr,
    });
    return { reply: T.formatSlots(slots), sessionId };
  }

  if (flowState === FLOW.BOOKING_SLOT) {
    const sid = parseInt(msgNorm, 10);
    const slots = slotsRepo.listAvailableSlotsForDoctorDate(db, context.doctorId, context.slotDate);
    const picked = slots.find((s) => s.id === sid);
    if (!picked) {
      return {
        reply: T.invalidInput() + '\n\n' + T.formatSlots(slots),
        sessionId,
      };
    }
    sessionsRepo.upsertSession(db, sessionId, FLOW.BOOKING_NAME, {
      ...context,
      slotId: picked.id,
    });
    return { reply: T.bookingAskName(), sessionId };
  }

  if (flowState === FLOW.BOOKING_NAME) {
    if (!validators.isValidPatientName(msgNorm)) {
      return { reply: T.invalidInput() + '\n\n' + T.bookingAskName(), sessionId };
    }
    sessionsRepo.upsertSession(db, sessionId, FLOW.BOOKING_PHONE, {
      ...context,
      patientName: msgNorm.trim(),
    });
    return { reply: T.bookingAskPhone(), sessionId };
  }

  if (flowState === FLOW.BOOKING_PHONE) {
    if (!validators.isValidPhone(msgNorm)) {
      return { reply: T.invalidInput() + '\n\n' + T.bookingAskPhone(), sessionId };
    }
    const phone = validators.normalizePhone(msgNorm);
    const doctor = doctorsRepo.getDoctorById(db, context.doctorId);
    const slot = slotsRepo.getSlotById(db, context.slotId);
    if (!doctor || !slot || slot.doctor_id !== doctor.id) {
      sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
      return { reply: T.FALLBACK, sessionId };
    }

    try {
      const appointmentId = bookAppointment(db, {
        doctorId: doctor.id,
        slotId: slot.id,
        patientName: context.patientName,
        patientPhone: phone,
      });
      sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
      return {
        reply: T.bookingConfirmed({
          doctorName: doctor.name,
          date: slot.slot_date,
          time: slot.slot_time,
          patientName: context.patientName,
          appointmentId,
        }),
        sessionId,
      };
    } catch (e) {
      if (e && e.code === 'SLOT_UNAVAILABLE') {
        sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
        return { reply: T.slotTakenOrInvalid(), sessionId };
      }
      throw e;
    }
  }

  sessionsRepo.upsertSession(db, sessionId, FLOW.IDLE, {});
  const list = faqsRepo.listFaqs(db);
  return { reply: T.formatFaqMenu(list), sessionId };
}

module.exports = {
  handleChatMessage,
  newSessionId,
  FLOW,
};
