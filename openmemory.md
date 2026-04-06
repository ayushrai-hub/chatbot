## Overview

Doctor appointment **chatbot** with React UI and Express API. Persistence is **SQLite via sql.js** (WASM, no native addon). Chat replies are **template + DB only** (no LLM).

## Architecture

- **Frontend**: `src/` — `chatApi.js` posts to `/user` with `sessionId` in `sessionStorage` for booking steps.
- **Backend**: `server/` — `createApp(db)` mounts `/doctors`, `/availability`, `/book-appointment`, `/user`.
- **Data**: tables `doctors`, `time_slots`, `appointments`, `chat_sessions`; migrations in `server/db/migrations/`; idempotent seed in `server/db/seed.js`.
- **Docker**: `web` (nginx) proxies API paths to `api`; volume `api_data` holds `appointments.db`.

## Components

- **`server/services/chatHandler.js`**: intent + booking state machine → `responseTemplates` + repos.
- **`server/services/responseTemplates.js`**: all user-visible chat strings; unknown → `Information not available.`
- **`server/repositories/appointmentsRepository.js`**: `BEGIN IMMEDIATE` transaction; lock slot then insert appointment.

## Patterns

- **Controlled responses**: no generative text; only structured fields from SQL rows.
- **Atomic booking**: `UPDATE … WHERE status='available'` then `INSERT`; conflict → 409 / chat fallback.

## User Defined Namespaces

- [Leave blank - user populates]
