-- Doctor appointment system — normalized schema (SQLite)
-- schema_migrations is created by migrate.js before this file runs.

CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  years_experience INTEGER NOT NULL CHECK (years_experience >= 0),
  consultation_fee_amount INTEGER NOT NULL CHECK (consultation_fee_amount >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL,
  slot_date TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'booked')),
  UNIQUE (doctor_id, slot_date, slot_time),
  FOREIGN KEY (doctor_id) REFERENCES doctors (id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL,
  slot_id INTEGER NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors (id),
  FOREIGN KEY (slot_id) REFERENCES time_slots (id)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  session_id TEXT PRIMARY KEY,
  flow_state TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_time_slots_doctor_date ON time_slots (doctor_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_doctor_status ON time_slots (doctor_id, status);
