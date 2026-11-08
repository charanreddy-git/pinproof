# PinProof

**Property verification without the travel.** PinProof connects property owners,
buyers, and NRI families with local inspectors who visit a pinned location, capture
GPS-verified photos, and send back proof — so you can check a property from anywhere.

Built for the Indian market: Google Maps links, ₹ pricing, plot and under-construction
visits, and mobile-first flows that work on a phone.

**Live demo:** https://track-proof.vercel.app — choose **Continue as Requester** or **Continue as Inspector**. The demo uses shared accounts; phone OTP is disabled. Vercel hosts the frontend and API, with private proof photos persisted in Neon. See the current-deployment section in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## What it does

1. A **requester** drops a Google Maps link or pin, adds instructions, and requests a visit.
2. A nearby **inspector** accepts the request and heads to the site.
3. The requester follows the inspector live on a map.
4. The inspector can submit proof only when their GPS is within **100 metres** of the pin.
5. The requester reviews the photos and marks the visit complete.

### Roles

| Role | What they can do |
|------|------------------|
| `USER` (requester) | Create visits, track an inspector live, review evidence, complete a visit |
| `CAPTAIN` (inspector) | Browse open visits, accept and start one, share live location, upload evidence |

> The API and database keep the internal role and route name `CAPTAIN` / `/captain`
> for compatibility. Every user-facing label says **inspector**.

### Visit statuses

| Status | What the requester sees |
|--------|-------------------------|
| `OPEN` | New request — waiting for an inspector |
| `ACCEPTED` | Inspector assigned |
| `IN_PROGRESS` | On the way — live location available |
| `SUBMITTED` | Proof ready to review |
| `COMPLETED` | Completed |

---

## Features

- Phone-first OTP sign-in — no password, verified mobile number, Rapido/Uber-style flow
- Fast2SMS delivery with Quick SMS, DLT, and DLT Manual routes
- Optional one-click demo mode for local testing (development only, server-enforced)
- Google Maps link parsing (including shortened links) with a tap-to-place map fallback
- "Use my current location" shortcut
- Mobile-first request flow with quick-add inspection checklists
- Live inspector tracking over authenticated HTTP polling
- Server-enforced 100 m proximity check using the Haversine formula
- Photo evidence (JPG/PNG, 5 MB max), stored locally and served from `/uploads`
- GPS coordinates, accuracy, capture time, and submission time stored with each proof
- Role-protected dashboards and task-level access control
- Nearby visit discovery: inspectors see open requests within 7 km of their current location
- Responsive marketing site, pricing section, and inspector signup
- Route-aware page titles and accessible focus/tap states

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query |
| Typography | Mukta + Karma, self-hosted through Fontsource |
| Maps | Leaflet + React Leaflet, OpenStreetMap tiles |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Live updates | HTTP polling over REST |
| Auth | Mobile OTP + JWT (Bearer token); Fast2SMS, Twilio, or webhook delivery |
| Uploads | Multer, local `server/uploads` directory |

Mukta (Ek Type, Mumbai) carries body copy and UI labels; Karma (Indian Type
Foundry) carries display headings. Both are multi-script families with
Devanagari and Latin support, chosen for open counters and comfortable reading on
budget Android screens. Fonts are bundled, not fetched from Google Fonts.

### Architecture

```
React client (Vite :5173)
   │  REST /api (polling for live updates)
   ▼
Express API (:3001)
   │  Prisma
   ▼
PostgreSQL
   │
   └── evidence files → server/uploads → served at /uploads
```

The client talks to same-origin `/api` and `/uploads` paths in development;
Vite proxies them to the API. Set `VITE_API_URL` for a separately hosted API.

---

## Project structure

```
pinproof/
├── client/
│   ├── src/
│   │   ├── components/      # UI primitives, layout, map, task components
│   │   ├── contexts/        # Auth + toast providers
│   │   ├── hooks/           # Polling and data hooks
│   │   ├── layouts/         # Auth and dashboard shells
│   │   ├── pages/           # Public, auth, user, and inspector pages
│   │   └── services/        # REST API wrappers
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── validators/
├── .env.example
└── README.md
```

---

## Local setup

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- PostgreSQL 14+ (local, Neon, Supabase, or any hosted Postgres)

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp .env.example server/.env
```

Edit `server/.env`:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — a random string of at least 32 characters
- `CLIENT_URL` — the client origin (`http://localhost:5173` in development)
- `SMS_PROVIDER` — `console` for local development, or `fast2sms` / `twilio` / `webhook` for production
- `FAST2SMS_API_KEY` — Fast2SMS Dev API key when `SMS_PROVIDER=fast2sms`

Generate a secret:

```bash
openssl rand -base64 48
```

The client needs no `.env` file for local development. For a hosted API, create
`client/.env`:

```env
VITE_API_URL="https://api.example.com/api"
```

### 3. Prepare the database

```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` applies the checked-in migrations in `server/prisma/migrations`.
Use `npx prisma migrate dev --name <change>` while developing a schema change; it
creates a new migration and applies it locally.

### 4. Run both apps

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open <http://localhost:5173>. The API health check is at
<http://localhost:3001/api/health>.

#### Local login troubleshooting

- **Database unreachable at `127.0.0.1:5432`:** start PostgreSQL and confirm that
  `DATABASE_URL` in `server/.env` points to an existing database and login role.
  For a Homebrew PostgreSQL 18 installation, run `brew services start postgresql@18`.
  If the binaries are missing, install them with `brew install postgresql@18` first.
  Then run `npx prisma migrate deploy` and `npm run prisma:seed` from `server/`.
  Demo login also requires PostgreSQL.
- **Service unavailable:** keep `npm run dev` running in both `server/` and
  `client/`. Check `/api/health` on port 3001 directly and through port 5173.
  Database outages return JSON with status 503; empty or non-JSON proxy responses
  now show a readable client error instead of a JSON parsing exception.

Regression checks: `npm test` in `server/`, and `npm test` in `client/`
(the client test runner requires Node 22.6+). Run `npm run build` in both folders
and `npm run lint` in `client/` for type, build, and lint checks.

### 5. Sign in with a phone number

Auth is mobile-first: there are no passwords. With `SMS_PROVIDER=console` (the
default outside production), the 6-digit code is printed to the API log and shown
in a "Local test code" box on the login screen. Production never returns
the code to the browser.

On a fresh database, use the **Book a visit** or **Earn as inspector** signup
link to create an account with any valid mobile number. To load the repeatable
demo data:

```bash
cd server
npm run prisma:seed
```

| Role | Mobile number | Name |
|------|---------------|------|
| Requester | `+91 98765 43210` | Demo Requester |
| Inspector | `+91 98765 43211` | Demo Inspector |

The seed also creates one open visit at Indiranagar, Bengaluru. It refuses to run
when `NODE_ENV=production`.

### 6. Demo mode (optional, local only)

For quicker demos, set this in `server/.env` and restart the API:

```env
AUTH_MODE="demo"
```

The login and signup pages then show a **Try the demo** panel with one-tap access
as either side of a visit — no OTP required. A floating **Demo** toolbar also
appears on authenticated pages so you can switch roles or reset the data without
signing out.

Demo login uses the seeded accounts above. The reset endpoint deletes demo visits
and restores four prepared Bengaluru visits:

| Status | Visit | What it lets you test |
|--------|-------|-----------------------|
| `OPEN` | Vacant plot check — Whitefield | Inspector accepting a request |
| `ACCEPTED` | Construction progress — Sarjapur | Starting a visit and live location |
| `SUBMITTED` | 2BHK rental check — Indiranagar | Reviewing proof and completing a visit |
| `COMPLETED` | Shop shutter check — Jayanagar | Browsing past visits and completed proof |

The submitted visit includes an illustrative sample proof image at
`/uploads/demo-proof.svg`, so the full review flow works offline from the camera.

**Safety:** demo mode is always disabled when `NODE_ENV=production`. The server
reports `"mode": "otp"` and returns `403` from the demo endpoints in production,
regardless of `AUTH_MODE`. Demo mode never bypasses task, evidence, or location
authorization rules.

### Build for production

```bash
cd server && npm run build
cd ../client && npm run build
```

The server emits to `server/dist`; the client emits static files to `client/dist`.
Serve `client/dist` from any static host and point `VITE_API_URL` at the API.
Make sure `CLIENT_URL` on the server matches the deployed client origin so CORS
requests succeed.

For a complete deployment walkthrough (Cloudflare Pages + Render + Neon + Fast2SMS),
see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Environment variables

| Variable | Location | Required | Description |
|----------|----------|----------|-------------|
| `DATABASE_URL` | `server/.env` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | `server/.env` | Yes | Signing secret, 32+ characters |
| `JWT_EXPIRES_IN` | `server/.env` | No | Token lifetime (default `7d`) |
| `AUTH_MODE` | `server/.env` | No | `otp` (default) or `demo`; demo is rejected when `NODE_ENV=production` |
| `SMS_PROVIDER` | `server/.env` | No | `console` (development), `fast2sms`, `twilio`, or `webhook` |
| `OTP_SECRET` | `server/.env` | No | OTP HMAC secret; defaults to `JWT_SECRET` |
| `OTP_TTL_SECONDS` | `server/.env` | No | Code lifetime (default `300`) |
| `OTP_RESEND_SECONDS` | `server/.env` | No | Per-number resend cooldown (default `30`) |
| `OTP_MAX_SENDS_PER_HOUR` | `server/.env` | No | Per-number hourly send cap (default `5`) |
| `FAST2SMS_API_KEY` | `server/.env` | For Fast2SMS | Dev API key from the Fast2SMS dashboard |
| `FAST2SMS_ROUTE` | `server/.env` | No | `q` (default), `dlt`, or `dlt_manual` |
| `FAST2SMS_SENDER_ID` | `server/.env` | For DLT routes | DLT-approved 3–6 character sender ID |
| `FAST2SMS_MESSAGE_ID` | `server/.env` | For `dlt` | Numeric DLT Message ID |
| `FAST2SMS_VARIABLES_VALUES` | `server/.env` | No | Values for `{#var#}`; `{code}` becomes the OTP (default `{code}`) |
| `FAST2SMS_MESSAGE_TEMPLATE` | `server/.env` | For `dlt_manual` | Full DLT-approved message; `{code}` becomes the OTP |
| `FAST2SMS_TEMPLATE_ID` | `server/.env` | No | DLT content template ID for `dlt_manual` |
| `FAST2SMS_ENTITY_ID` | `server/.env` | No | DLT principal entity ID for `dlt_manual` |
| `TWILIO_ACCOUNT_SID` | `server/.env` | For Twilio | Twilio account SID (optional provider) |
| `TWILIO_AUTH_TOKEN` | `server/.env` | For Twilio | Twilio auth token (optional provider) |
| `TWILIO_FROM_NUMBER` | `server/.env` | For Twilio | Sender number (optional provider) |
| `TWILIO_MESSAGING_SERVICE_SID` | `server/.env` | For Twilio | Alternative to `TWILIO_FROM_NUMBER` |
| `SMS_WEBHOOK_URL` | `server/.env` | For webhook | Receives `{ phone, code, message }` |
| `SMS_WEBHOOK_TOKEN` | `server/.env` | No | Bearer token for the SMS webhook |
| `PORT` | `server/.env` | No | API port (default `3001`) |
| `NODE_ENV` | `server/.env` | No | `development` or `production` |
| `CLIENT_URL` | `server/.env` | No | Allowed client origin (default `http://localhost:5173`) |
| `VITE_API_URL` | `client/.env` | No | API base including `/api` (default `/api`) |

---

## SMS delivery with Fast2SMS

`SMS_PROVIDER=fast2sms` uses the [Fast2SMS Bulk V2 API](https://docs.fast2sms.com/reference/quick-sms-post).
The API key is sent in the `Authorization` header. Fast2SMS accepts Indian
10-digit mobile numbers, so `+91` is stripped before sending.

| Route | Sends | Required configuration |
|---|---|---|
| `q` (Quick SMS) | The OTP message as plain text | `FAST2SMS_API_KEY` |
| `dlt` | An approved DLT template by Message ID | `FAST2SMS_API_KEY`, `FAST2SMS_SENDER_ID`, `FAST2SMS_MESSAGE_ID` |
| `dlt_manual` | The full approved DLT message | `FAST2SMS_API_KEY`, `FAST2SMS_SENDER_ID`, `FAST2SMS_MESSAGE_TEMPLATE` |

Quick SMS example:

```env
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your-api-key
FAST2SMS_ROUTE=q
```

DLT example:

```env
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your-api-key
FAST2SMS_ROUTE=dlt
FAST2SMS_SENDER_ID=PINPRF
FAST2SMS_MESSAGE_ID=123456
FAST2SMS_VARIABLES_VALUES={code}
```

- `{code}` is replaced with the generated OTP in `FAST2SMS_VARIABLES_VALUES`
  and `FAST2SMS_MESSAGE_TEMPLATE`.
- DLT and DLT Manual routes require DLT registration and an approved template.
- Quick SMS may require account approval. Check the Fast2SMS dashboard.
- OTP generation and verification stay in this app; the Fast2SMS OTP API is not used.

---

## API

All task routes require `Authorization: Bearer <token>`.

### Auth

Auth is phone-first. The same request endpoint handles both sign-in and signup, so
it never reveals whether a phone number already has an account.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/auth/mode` | Public | Returns `otp` or `demo` plus demo account labels |
| `POST` | `/api/auth/otp/request` | Public | Send a 6-digit code to a mobile number |
| `POST` | `/api/auth/otp/verify` | Public | Verify the code and receive a JWT |
| `POST` | `/api/auth/demo` | Demo only | One-tap login as `USER` or `CAPTAIN` |
| `POST` | `/api/auth/demo/reset` | Demo only | Delete demo visits and restore the four prepared ones |

Demo endpoints return `403` in production and are rate-limited in development.

**Request a code**

```json
{ "phone": "+919876543210" }
```

Local development response (the `devOtp` field is never returned in production):

```json
{
  "success": true,
  "data": { "expiresIn": 300, "resendAfter": 30, "devOtp": "123456" }
}
```

**Verify a phone number**

```json
{ "phone": "+919876543210", "code": "123456" }
```

If the number already has an account, the response is `{ user, token, isNew: false }`.

If it is a new number, the code is validated but not consumed, and the response
asks for a profile instead of creating the account:

```json
{ "requiresProfile": true, "phone": "+919876543210" }
```

Collect the name, then submit the same code again with `name` and `role`
(`USER` or `CAPTAIN`):

```json
{
  "phone": "+919876543210",
  "code": "123456",
  "name": "Ananya Rao",
  "role": "USER"
}
```

The account is created only on this second request and the response is
`{ user, token, isNew: true }`. The code stays valid until its normal expiry. Send
the token as `Authorization: Bearer <token>`.

OTP policy: 6 digits, 5-minute expiry, 30-second resend cooldown, 5 attempts per
code, and 5 sends per number per hour. Codes are HMAC-hashed at rest, are single
use, and expired records are rejected. In-memory IP rate limits also apply to the
request and verify endpoints.

The `webhook` SMS provider receives:

```json
{ "phone": "+919876543210", "code": "123456", "message": "Your PinProof verification code is …" }
```

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/tasks/resolve-url` | User | Extract coordinates from a Google Maps link |
| `POST` | `/api/tasks` | User | Create a visit request |
| `GET` | `/api/tasks` | Both | User: own requests. Inspector: nearby open + own accepted (`?filter=available` or `?filter=accepted`). Send `latitude` and `longitude` to see open visits within 7 km. |
| `GET` | `/api/tasks/:id` | Both | Get one visit, subject to access rules |
| `GET` | `/api/tasks/:id/location` | Both | Latest authorized GPS point for the visit |
| `POST` | `/api/tasks/:id/location` | Inspector | Share a GPS point while the visit is `IN_PROGRESS` |
| `POST` | `/api/tasks/:id/accept` | Inspector | Claim an open visit |
| `POST` | `/api/tasks/:id/start` | Inspector | Mark the visit as on the way |
| `POST` | `/api/tasks/:id/submit` | Inspector | Submit photo + GPS (`multipart/form-data`: `image`, `latitude`, `longitude`, optional `accuracy`, optional `capturedAt`) |
| `POST` | `/api/tasks/:id/complete` | User | Approve a submitted visit |
| `GET` | `/api/health` | Public | API + database health check |

**Create visit body**

```json
{
  "title": "2BHK rental check — Indiranagar",
  "description": "Check condition, water supply, and parking. Ask the caretaker for access.",
  "latitude": 12.9719,
  "longitude": 77.6412
}
```

### Live updates

There is no persistent connection. Clients use the regular authenticated REST API
and poll the resources they are viewing:

| Resource | Polling interval | Purpose |
|----------|------------------|---------|
| `GET /api/tasks/:id` | 5 seconds | Visit lifecycle status |
| `GET /api/tasks/:id/location` | 5 seconds while tracking | Latest inspector GPS point |
| `GET /api/tasks` | 15 seconds | Dashboard and visit lists |

Every request uses `Authorization: Bearer <token>` and the same task-level access
rules as the rest of the API. The location endpoint accepts JSON
`{ "latitude": 12.97, "longitude": 77.64 }`. Location writes are throttled to one
database log per inspector per visit every 60 seconds, while the latest point is
served immediately from memory between writes.

---

## The 100 m rule

The inspector's browser captures a GPS fix at the moment of upload. The server
recomputes the distance between that fix and the visit's pinned coordinates using
the Haversine formula. If the result is more than `100` metres, the submission is
rejected.

This limits accidental or fabricated submissions, but GPS accuracy varies in dense
urban areas and indoors. The browser also sends its reported GPS accuracy and the
capture time, and the server records the submission time. Those values are shown to
the requester so they can judge the evidence in context. The server is the source of
truth — client-side checks are only there for early feedback.

---

## Operational notes

- **Uploads are local.** Back up `server/uploads` and serve it from persistent
  storage. On ephemeral hosts (Render, Railway, containers), use S3/Cloudinary or a
  mounted volume instead. `/uploads` is currently public; switch to private objects
  with short-lived signed URLs before handling sensitive property photos.
- **OTP delivery.** `SMS_PROVIDER=console` is development-only and is rejected in
  production. Fast2SMS is the recommended provider for India. Use `FAST2SMS_ROUTE=dlt`
  or `dlt_manual` with a DLT-registered sender and template for production traffic;
  `q` is Quick SMS and depends on Fast2SMS account approval. The generic `webhook`
  provider is intended for MSG91, Gupshup, Interakt, or a WhatsApp adapter. Keep
  `OTP_SECRET` stable across restarts so pending codes remain valid.
- **Rate limits are in-process.** The per-IP OTP limits and the per-number send
  window use the database plus in-memory counters. Use a shared store such as Redis
  when running more than one API instance.
- **JWT storage.** The client keeps the token in `localStorage` for simplicity. For
  a higher-security deployment, move auth to httpOnly cookies with CSRF protection.
- **Image validation** checks MIME type, extension, and a 5 MB limit. Add malware
  scanning and image re-encoding before exposing uploads publicly.
- **Maps** use OpenStreetMap tiles in the app; no Google Maps API key is required.
  Google Maps links are resolved server-side by following redirects and parsing
  coordinates.
- **CORS** is restricted to `CLIENT_URL`. Set it explicitly in production.

---

## Current scope

This repository implements the visit workflow end to end: phone OTP sign-in,
requesting a property, live location sharing, server-side proximity checks, GPS
evidence metadata, and completion. It does **not** process payments, payouts, KYC,
or multi-photo reports. Prices and inspector payouts shown on the marketing pages
are illustrative product copy; no money moves through the app.

`AUTH_MODE=demo` is a local development convenience only. It is refused in
production and does not change the OTP, task, evidence, or location authorization
paths.

Map pins are inline SVG generated by the client; no third-party marker assets are
bundled.

---

## Future work

- In-app payments and receipts
- Inspector ratings and visit reviews
- Push/SMS notifications for status changes
- Multi-photo visits and PDF reports
- Regional language support
- Inspector availability zones and smarter matching

---

## License

MIT
