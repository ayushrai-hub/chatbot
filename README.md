# Doctor appointment chatbot

React UI + Express API with **SQLite (sql.js)**. The chatbot does **not** call external LLMs: every reply is built from **fixed templates** and **database rows** only. Unknown data returns **“Information not available.”**

## How to run (quick)

| Goal | Command |
|------|---------|
| **Local UI + API** | Terminal 1: `npm run server` → Terminal 2: `npm start` → open [http://localhost:3000](http://localhost:3000) |
| **Docker (prod-like)** | `./setup.sh` → open [http://localhost:8080](http://localhost:8080) |
| **API tests** | `npm run test:server` |
| **Frontend tests** | `CI=true npm test -- --watchAll=false` |

## Prerequisites

- **Node.js 18+** (sql.js is WASM; no native SQLite compile step).
- **npm** (root `npm install` installs the React app and runs `postinstall` for `server/`).

## Local development (step by step)

1. **Clone and install**

   ```bash
   git clone https://github.com/ayushrai-hub/chatbot.git
   cd chatbot
   npm install
   ```

2. **Environment**

   - Copy `.env.example` to `.env` if you want to override anything.
   - For the **React dev server**, leave `REACT_APP_API_URL` **unset** so the app uses the same origin and Create React App **proxies** API paths to `http://localhost:5050` (see `package.json` → `"proxy"`).
   - Optional: `SQLITE_PATH` — SQLite file path for the API (default: `server/data/appointments.db` when the server runs with cwd `server/`).

3. **Start the API** (from repo root)

   ```bash
   npm run server
   ```

   Listens on **port 5050** by default (`PORT` overrides). On first start it applies SQL migrations, seeds demo doctors and slots, and creates the DB file under `server/data/` if needed.

4. **Start the UI** (second terminal)

   ```bash
   npm start
   ```

   Opens [http://localhost:3000](http://localhost:3000).

5. **If you see “Network Error”**

   Start the API first, or change the port with `PORT=5051 npm run server` and set the same origin in `package.json` → `"proxy"`.

## Docker (production simulation)

- **Web**: nginx + static React build on **8080**
- **API**: Node on the internal network; SQLite persisted in volume **`api_data`** (`SQLITE_PATH=/app/data/appointments.db`)
- **Same-origin API**: nginx proxies `/user`, `/health`, `/doctors`, `/availability/…`, `/book-appointment` to the API

```bash
./setup.sh
# or: docker compose up -d --build
```

Stop: `docker compose down`

## Chat usage (rule-based, no hallucinations)

The UI sends `POST /user` with `{ "msg": "...", "sessionId": "..." }` (session id is stored in `sessionStorage` for multi-step flows).

### FAQ flow (primary)

1. Type **`menu`**, **`help`**, **`hi`**, or **`faq`** — the bot lists **numbered questions** from the `faqs` table in the database.
2. Reply with **`1`**, **`2`**, … — the bot answers with **only the stored answer** for that row (plus a short fixed line telling you how to pick another question).
3. Type **`menu`** again anytime to see the FAQ list.

Unknown messages default to showing the **FAQ list** (so the bot stays on controlled content).

### Doctor / booking (still available)

- `list doctors` — names and IDs from the database
- `details 1` — profile for doctor id `1`
- `availability 1` — upcoming dates with free slots for doctor `1`
- `book appointment` — guided booking (doctor → date → slot → name → phone)
- `cancel` — aborts booking and shows the FAQ menu again

FAQ copy lives in `server/db/seed.js` (initial rows) and can be edited in the database. Templates are in `server/services/responseTemplates.js`; routing is in `server/services/chatHandler.js`.

## REST API (for integrations)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness |
| `GET` | `/doctors` | List doctors |
| `GET` | `/doctors/:id` | One doctor |
| `GET` | `/availability/:doctorId` | Distinct available dates (next 14 days) |
| `GET` | `/availability/:doctorId?date=YYYY-MM-DD` | Available time slots that day |
| `POST` | `/book-appointment` | JSON body: `doctorId`, `slotId`, `patientName`, `patientPhone` |
| `POST` | `/user` | Chat: `{ msg, sessionId? }` → `{ reply, sessionId }` |

Booking uses a **transaction**: slot is updated to `booked` only if it was `available`, then an appointment row is inserted (prevents double booking under concurrency within SQLite’s transaction rules).

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `PORT` | server | API port (default `5050`) |
| `SQLITE_PATH` | server | DB file path or `:memory:` |
| `REACT_APP_API_URL` | frontend build | API origin; empty = same origin (Docker/nginx) |
| `NODE_ENV` | server | `production` / `development` / `test` |

**No third-party API keys** are required for the bundled demo backend.

## Testing

```bash
npm run test:server     # API: integration + validators
CI=true npm test -- --watchAll=false   # React
```

## Project layout (high level)

```
server/
  db/           # migrations, sql.js adapter, migrate + seed
  repositories/  # doctors, slots, appointments, chat sessions
  routes/       # Express routers
  services/     # chat handler, validators, templates, booking
  __tests__/    # Jest
src/            # React app
```

## Building for production (static UI only)

```bash
npm run build
```

Set `REACT_APP_API_URL` during build if the UI and API are on different origins; otherwise use same-origin reverse proxy (as in Docker).

## Troubleshooting

- **UI shows “You said … Demo API …”**: the browser is talking to an **old Node process** (or another app) on the API port, not this repo’s server. **Stop** whatever is using the port (`lsof -i :5050` on macOS), then run **`npm run server`** again from the repo root. Confirm with:
  `curl -s http://localhost:5050/health | grep chatEngine` — you should see **`faq-appointments-sqljs`**.
- **Port in use**: use another `PORT` and update CRA `proxy` in development.
- **macOS AirPlay on 5000**: this project defaults the API to **5050** to avoid that conflict.
- **Dev file watcher errors**: the dev script sets `WATCHPACK_POLLING=true`.

## Contributing / license

See [CONTRIBUTING.md](CONTRIBUTING.md). License: see repository `LICENSE` if present.

## Authors

- Ayush Rai — [@ayushrai](https://github.com/ayushrai)
