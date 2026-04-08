# HTTP API reference

Base URL depends on deployment:

- **Local dev (CRA proxy)**: same origin as the UI (e.g. `http://localhost:3000`); `/user` and other paths are forwarded to `http://localhost:5050`.
- **Local API direct**: `http://localhost:5050`
- **Docker (nginx)**: `http://localhost:8080` (same origin for UI + API)

All JSON bodies use `Content-Type: application/json` unless noted.

---

## Health

### `GET /health`

Liveness and build identity.

**Response** `200`

```json
{
  "ok": true,
  "service": "chatbot-api",
  "chatEngine": "faq-appointments-sqljs",
  "postUser": "POST /user runs handleChatMessage (not a demo echo)"
}
```

---

## Doctors

### `GET /doctors`

List all doctors (ordered by `id`).

**Response** `200`

```json
{
  "doctors": [
    {
      "id": 1,
      "name": "Dr. …",
      "specialization": "…",
      "years_experience": 10,
      "consultation_fee_amount": 150,
      "created_at": "…"
    }
  ]
}
```

### `GET /doctors/:id`

Single doctor by numeric id.

**Response** `200`

```json
{
  "doctor": { "id": 1, "name": "…", "…": "…" }
}
```

**Response** `404` — unknown id

```json
{ "error": "Information not available." }
```

---

## Availability

### `GET /availability/:doctorId`

Without `date`: returns distinct **available** slot dates for the doctor, from **today** (UTC calendar date) through **14 days** ahead.

**Response** `200`

```json
{
  "doctorId": 1,
  "dates": ["2026-04-08", "2026-04-09"]
}
```

**Response** `404` — unknown doctor

```json
{ "error": "Information not available." }
```

### `GET /availability/:doctorId?date=YYYY-MM-DD`

Returns available time slots for that doctor on the given date.

**Query**

| Name   | Required | Description        |
|--------|----------|--------------------|
| `date` | Yes      | ISO date `YYYY-MM-DD` |

**Response** `200`

```json
{
  "doctorId": 1,
  "date": "2026-04-08",
  "slots": [
    { "id": 12, "slot_date": "2026-04-08", "slot_time": "09:00", "status": "available" }
  ]
}
```

**Response** `400` — invalid date format

```json
{ "error": "Invalid date. Use YYYY-MM-DD." }
```

---

## Book appointment (REST)

Atomic booking: slot is moved to `booked` only if it was `available`, then an appointment row is inserted (transaction).

### `POST /book-appointment`

**Body**

| Field           | Type   | Rules |
|-----------------|--------|--------|
| `doctorId`      | number | Positive integer |
| `slotId`        | number | Positive integer |
| `patientName`   | string | Trimmed, 2–120 chars |
| `patientPhone`  | string | E.164-friendly after normalization (see below) |

**Response** `201`

```json
{
  "appointmentId": 1,
  "doctorId": 1,
  "slotId": 12,
  "date": "2026-04-08",
  "time": "09:00",
  "patientName": "Jane Doe",
  "status": "confirmed"
}
```

**Errors**

| Status | When |
|--------|------|
| `400`  | Missing/invalid `doctorId`, `slotId`, name, or phone |
| `404`  | Doctor or slot missing, or slot not for that doctor |
| `409`  | Slot not available or lost a race (`Slot is no longer available.`) |
| `500`  | Unexpected server error |

Phone normalization strips spaces, `(`, `)`, `.`, `-`. Validation uses optional leading `+` and **8–15** digits (`[1-9]` first digit), per `server/services/validators.js`.

---

## Chat (rule-based, no LLM)

### `POST /user`

Runs `handleChatMessage`: FAQ menu, doctor listing, availability text, and **multi-step booking** with server-side session state.

**Body**

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| `msg`        | string | Yes      | Non-empty after trim |
| `sessionId`  | string | No       | UUID v4 from prior response; omit on first message |

**Response** `200`

```json
{
  "reply": "…multiline text from templates + DB…",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** `400`

```json
{ "error": "msg is required" }
```

**Response** `500`

```json
{ "error": "Internal server error" }
```

### Session behavior

- Invalid or unknown `sessionId` is replaced with a **new** UUID; state starts fresh.
- Booking flow states: doctor → date → slot id → name → phone; `cancel` resets to FAQ menu when mid-flow.
- Replies are **only** from `responseTemplates` + repository data; unknown facts use the string `Information not available.` where applicable.

---

## CORS

The API uses `cors` with `origin: true` and `credentials: true` (reflects request origin). For strict production origins, put a reverse proxy in front and/or tighten CORS in `server/app.js` to match your deployment.

---

## Related docs

- [README.md](README.md) — run, env vars, Docker
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design
- [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md) — module map
