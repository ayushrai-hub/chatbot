# Codebase guide

Folder-by-folder map for the doctor appointment chatbot (React + Express + sql.js).

## Repository layout

```
chatbot/
├── public/                 # Static assets (index.html, icons, manifest)
├── src/                    # Create React App frontend
│   ├── app/
│   │   └── App.jsx         # Root layout: Header + ChatContainer
│   ├── components/
│   │   ├── chat/           # ChatContainer, MessageBubble
│   │   └── layout/         # Header
│   ├── config/
│   │   └── index.js        # REACT_APP_API_URL resolution
│   ├── hooks/
│   │   └── useChatScroll.js
│   ├── services/
│   │   ├── chatApi.js      # POST /user, sessionStorage, error helpers
│   │   └── chatApi.test.js
│   ├── styles/
│   │   └── global.css
│   ├── index.js            # Entry
│   └── setupTests.js
├── server/                 # Express API (separate package.json)
│   ├── db/
│   │   ├── database.js     # openDatabase, save, path from SQLITE_PATH
│   │   ├── sqlJsAdapter.js # sql.js init + persist
│   │   ├── migrate.js      # run SQL migrations
│   │   ├── seed.js         # demo doctors, slots, FAQs
│   │   └── migrations/     # 001_initial.sql, 002_faqs.sql
│   ├── repositories/     # Thin SQL access (doctors, slots, appointments, sessions, faqs)
│   ├── routes/             # doctors, availability, bookAppointment, user (chat)
│   ├── services/
│   │   ├── chatHandler.js  # Intent + booking state machine
│   │   ├── responseTemplates.js
│   │   ├── validators.js
│   │   └── bookingService.js
│   ├── __tests__/          # Jest + supertest
│   ├── app.js              # createApp(db)
│   ├── bootstrap.js        # startServer: db + migrate + seed + listen
│   ├── index.js            # PORT + startServer
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── Dockerfile              # Multi-stage: build CRA + nginx
├── nginx.conf
├── setup.sh                # Optional docker helper
├── .env.example
├── package.json            # Root: CRA scripts, proxy, postinstall → server deps
├── README.md
├── ARCHITECTURE.md
├── API_DOCS.md             # HTTP reference
├── CONTRIBUTING.md
├── CHANGELOG.md
└── openmemory.md           # Project index (OpenMemory)
```

## Frontend (`src/`)

| Module | Responsibility |
|--------|----------------|
| `App.jsx` | Composes chrome and chat surface. |
| `ChatContainer.jsx` | Messages state, send flow, loading/error UI, scroll hook. |
| `MessageBubble.jsx` | Renders one user/bot line. |
| `Header.jsx` | Title / branding. |
| `chatApi.js` | Axios instance, `sendChatMessage`, `normalizeBotReply`, `getChatErrorMessage`. |
| `config/index.js` | Frozen `apiUrl` from env. |

## Backend (`server/`)

| Module | Responsibility |
|--------|----------------|
| `app.js` | Express app: CORS, JSON, `/health`, mount routers, error middleware. |
| `routes/user.js` | `POST /user` → `handleChatMessage`. |
| `routes/doctors.js` | `GET /`, `GET /:id`. |
| `routes/availability.js` | `GET /:doctorId` with optional `?date=`. |
| `routes/bookAppointment.js` | `POST /` validated booking. |
| `services/chatHandler.js` | Session states, intents, FAQ + booking dialogue. |
| `services/responseTemplates.js` | All user-visible strings; unknown data → `Information not available.` |
| `repositories/*.js` | Parameterized queries; no business prose. |
| `appointmentsRepository.js` | Transactional book. |

## Tests

- **Server**: `npm run test:server` — `server/__tests__/api.test.js`, `validators.test.js`.
- **Client**: `CI=true npm test -- --watchAll=false` — `App.test.jsx`, `chatApi.test.js`.

## Docs index

- **Run & env**: [README.md](README.md)
- **HTTP API**: [API_DOCS.md](API_DOCS.md)
- **Design**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
