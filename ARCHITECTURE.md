# Architecture

Doctor appointment **chatbot**: React SPA + Express API. The bot does **not** call external LLMs. Every user-visible line comes from **fixed templates** (`server/services/responseTemplates.js`) and **SQLite rows** (doctors, slots, FAQs, sessions, appointments), via **sql.js** (WASM).

## High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Browser                                                          │
│  React (CRA)                                                     │
│    Header + ChatContainer → axios → POST /user, sessionStorage   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP (same origin in Docker; CRA proxy in dev)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ Express (server/)                                                │
│  CORS + JSON → Routers: /doctors, /availability, /book-appointment│
│  POST /user → chatHandler (state machine + repos)                 │
│  Global error handler → 500 JSON                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ sql.js SQLite in process                                         │
│  migrations → seed; persist to file (SQLITE_PATH) or :memory:    │
└─────────────────────────────────────────────────────────────────┘
```

## Execution flow

1. **`server/index.js`** — reads `PORT`, calls `bootstrap.startServer`.
2. **`server/bootstrap.js`** — `openDatabase()` → `migrate()` → `seed()` → `createApp(db)` → `listen`; on SIGINT/SIGTERM saves DB and exits.
3. **`server/db/database.js`** — single DB instance; `SQLITE_PATH` or default `server/data/appointments.db` (path resolved from server cwd).
4. **`server/app.js`** — mounts routers and `registerUserChatRoute` for top-level `POST /user`.

## Chat engine

- **`server/services/chatHandler.js`** — finite states: `idle`, `faq_pick`, `booking_*`. Parses intents (keywords, numbers, doctor names). Persists flow in `chat_sessions` via **`server/repositories/sessionsRepository.js`**.
- **`server/services/bookingService.js`** — delegates to **`appointmentsRepository.bookAppointmentAtomic`**.
- **`appointmentsRepository`** — single transaction: `UPDATE time_slots … WHERE status='available'` then `INSERT appointments`; conflict → `SLOT_UNAVAILABLE`.

## Frontend

- **`src/index.js`** — React 18 root.
- **`src/app/App.jsx`** — `Header` + `ChatContainer`.
- **`src/components/chat/ChatContainer.jsx`** — message list, input, loading/errors; calls **`src/services/chatApi.js`**.
- **`src/services/chatApi.js`** — axios client: `REACT_APP_API_URL` or empty (CRA `proxy` to :5050); stores `sessionId` in `sessionStorage`.

## Docker / production shape

- **`docker-compose.yml`** — `api` (Node, volume `api_data` for SQLite) + `web` (nginx serving static build, proxies `/user`, `/health`, `/doctors`, `/availability`, `/book-appointment` to API).
- **`nginx.conf`** — same-origin browser → one host:port.

## Key design decisions

| Decision | Rationale |
|----------|-----------|
| sql.js, not better-sqlite3 | No native compile; works in constrained CI/sandboxes. |
| No LLM | Predictable, auditable healthcare-adjacent copy; no API keys. |
| `POST /user` at app root | Avoids accidental mounting under a different handler (“demo echo”). |
| Atomic slot update + insert | Prevents double booking under concurrent requests within SQLite transaction rules. |
| Session UUID in body + storage | Multi-step booking without cookies; explicit client round-trips. |

## Data flow (chat message)

```
User input → ChatContainer → sendChatMessage({ msg, sessionId? })
  → POST /user → handleChatMessage(db, sessionId, msg)
  → read/update session row → repos (doctors, slots, faqs) → template strings
  → { reply, sessionId } → UI
```

## Security notes (summary)

- React escapes message text (no `dangerouslySetInnerHTML` in normal flow).
- Validate booking inputs in REST and chat paths (`validators.js`).
- CORS is permissive (`origin: true`); tighten behind a known hostname in production if needed.
- Do not commit `.env` or real DB files; see `.gitignore` and `.env.example`.

## Related documentation

- [API_DOCS.md](API_DOCS.md) — endpoints and payloads
- [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md) — folder-by-folder map
- [README.md](README.md) — setup and operations
