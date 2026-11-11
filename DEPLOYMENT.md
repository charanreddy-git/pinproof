# PinProof Deployment Guide

Last updated: 7 November 2026

## Workflow update — 10 November 2026

The current checkout adds edit/cancel/release/revision workflows, private supporting
photos, inspector findings, visit events, account updates, and print/PDF reports.
Before deploying this version, run the checks in `docs/END_TO_END.md`, generate the
Prisma client, and apply `202611100001_complete_visit_workflow` to the target
database. Then deploy API and client together. `npm run db:migrate` at the root
honours `server/.env.development.local`; set `NODE_ENV=production` and an explicit
`DATABASE_URL` for the deployment database.

The 4 MB limit now applies to the primary photo plus up to five supporting photos
combined. Every accepted GPS update is persisted on all hosting environments.
This checkout was tested locally; the deployment record below describes the
previously published Vercel build.

## Current live deployment — Vercel demo

- App: **https://track-proof.vercel.app** (Vercel project `track-proof`, root `client`).
- API: **https://pinproof-api.vercel.app** (Vercel project `pinproof-api`, root `server`).
- Database: existing Neon PostgreSQL. Proof bytes are stored in the separate `Evidence` table and served only to visit participants.
- `client/vercel.json` proxies `/api/*` to the API and handles React Router deep links. `server/vercel.json` deploys the Express handler at `server/api/index.ts`.
- Public demo requires **both** `AUTH_MODE=demo` and `PUBLIC_DEMO=true`, with `NODE_ENV=production`. It exposes only the two prepared demo accounts; phone OTP endpoints are disabled and their forms are hidden.
- Demo accounts and visits are shared. Do not use this deployment for real customer data.
- Upload limit is 4 MB (JPG/PNG), below the Vercel request-body limit. Existing proof files have been migrated into Neon.
- Live GPS is persisted on each Vercel update so separate function instances see the same location.
- Production secrets are stored as encrypted Vercel environment variables, not in git. `CLIENT_URL=https://track-proof.vercel.app`; no client-side secret or API URL is needed.

Deploy from the repository root after checks and `cd server && npx prisma migrate deploy`:

```bash
VERCEL_ORG_ID=team_HBidWMLIDZeQNd7P4TPZLG80 VERCEL_PROJECT_ID=prj_87YSNBA9kHVNJ3Q4mTIhf0ZKthxc vercel deploy --prod --yes
VERCEL_ORG_ID=team_HBidWMLIDZeQNd7P4TPZLG80 VERCEL_PROJECT_ID=prj_93ZOiQ6H4AAn5rXfj8Ve6skWQfJb vercel deploy --prod --yes
```

Verified over the public URL: health, both demo logins, private existing evidence, create/accept/start, location polling, multipart photo persistence, completion, and blocked OTP. The first deployment was uploaded from the local working tree; it does not require a git push.

The Render/Cloudflare guide below is the earlier alternative architecture. Its development-only demo and local-disk notes are superseded by this section for the Vercel deployment. For real OTP accounts, use a separate database/deployment, disable `PUBLIC_DEMO`, set `AUTH_MODE=otp`, and configure the SMS provider.

> Free-tier demo and early-access setup. Not a final production architecture.

---

## 1. Recommended stack

| Layer | Service | Plan |
|---|---|---|
| Frontend | Cloudflare Pages | Free |
| HTTP API | Render Web Service | Free |
| PostgreSQL | Neon | Free |
| SMS | Fast2SMS | Pay-as-you-go |
| Evidence images | Render local disk | Free, ephemeral |

---

## 2. Architecture

```text
Browser
  ├── Cloudflare Pages   React + Vite static build
  ├── Render             Express API + Prisma
  └── Neon               PostgreSQL
```

- Client and API deploy separately.
- API needs a long-running process for the REST API and local uploads.
- Evidence files live on Render's ephemeral disk.

### Repository layout

```text
pinproof/
├── client/          React + Vite frontend
├── server/          Express + Prisma API
├── DEPLOYMENT.md    This guide
└── README.md        Product and local setup
```

---

## 3. Before you start

You need:

- GitHub repository
- Render account
- Neon account
- Cloudflare account
- Fast2SMS account
- Node.js 22 and npm
- `openssl`

Generate two secrets:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

Use them as `JWT_SECRET` and `OTP_SECRET`.

### Production guardrails

- `AUTH_MODE=demo` is rejected when `NODE_ENV=production`.
- `SMS_PROVIDER=console` is rejected in production.
- Seed data refuses to run in production.
- OTP codes are never returned to the browser in production.

Do not bypass these guards with `NODE_ENV=development`.

---

## 4. Free-tier limits

| Service | Free allowance | Main limit |
|---|---|---|
| Cloudflare Pages | Unlimited requests and bandwidth | Build limits |
| Render Free Web Service | 512 MB RAM, 750 hours/month | Sleeps after 15 min idle; ephemeral disk |
| Neon Free | 1 GB storage, 100 CU-hours/month | Suspends after 5 min idle |
| Fast2SMS | Signup credit when offered | DLT registration for DLT routes; Quick SMS may need approval |

**Do not use Render's free Postgres.** It expires after 30 days. Use Neon.

### Evidence images

- Files are lost on redeploy, restart, or spin-down.
- Acceptable for a demo.
- Use R2, S3, Supabase Storage, or Cloudinary for real use.

---

## 5. SMS setup

PinProof uses the Fast2SMS Bulk V2 API.

Docs: [Quick SMS](https://docs.fast2sms.com/reference/quick-sms-post),
[DLT](https://docs.fast2sms.com/reference/dlt-sms-single),
[DLT Manual](https://docs.fast2sms.com/reference/dlt-manual-single)

- API key goes in the `Authorization` header.
- Fast2SMS expects Indian 10-digit numbers; the app strips `+91`.
- OTPs are generated and verified by PinProof.
- Fast2SMS only delivers the message.
- DLT routes require DLT registration and an approved template.
- Quick SMS (`q`) may require account approval.

| Route | Use | Required env |
|---|---|---|
| `q` | Quick SMS with the OTP text | `FAST2SMS_API_KEY` |
| `dlt` | Approved DLT template by Message ID | `FAST2SMS_API_KEY`, `FAST2SMS_SENDER_ID`, `FAST2SMS_MESSAGE_ID` |
| `dlt_manual` | Full approved DLT message | `FAST2SMS_API_KEY`, `FAST2SMS_SENDER_ID`, `FAST2SMS_MESSAGE_TEMPLATE` |

There is no unlimited free A2P SMS route to Indian numbers.

For a free public demo:

1. Add a production-safe demo login (code change).
2. Or use email OTP (code change).
3. Or use Fast2SMS with a funded wallet.

---

## 6. Deployment steps

### Step 1 — Create the Neon database

1. Create a Neon project.
2. Pick Singapore (`ap-southeast-1`) or Mumbai (`ap-south-1`).
3. Copy the **direct** connection string.
4. The direct host does **not** contain `-pooler`.
5. Append:

```text
?sslmode=require&connect_timeout=15
```

Example:

```env
DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
```

Use the direct host because `schema.prisma` has no `directUrl`.

### Step 2 — Deploy the API on Render

1. **New → Web Service**.
2. Connect the GitHub repository.
3. Configure:

| Setting | Value |
|---|---|
| Name | `pinproof-api` |
| Root Directory | `server` |
| Runtime | Node |
| Region | Singapore |
| Instance Type | Free |
| Build Command | `npm ci --include=dev && npx prisma generate && npm run build` |
| Pre-Deploy Command | `npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Auto-Deploy | Yes |

`--include=dev` is required for `prisma` and `typescript`.

4. Add environment variables:

```env
NODE_ENV=production
NODE_VERSION=22
DATABASE_URL=postgresql://...direct-neon-host.../neondb?sslmode=require&connect_timeout=15
JWT_SECRET=<first generated secret>
OTP_SECRET=<second generated secret>
CLIENT_URL=https://your-frontend.pages.dev
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your-fast2sms-api-key
FAST2SMS_ROUTE=q
AUTH_MODE=otp
```

Notes:

- Do not set `PORT`; Render injects it.
- `CLIENT_URL` must be an origin only.
- No path, no trailing slash.
- `FAST2SMS_ROUTE=q` is Quick SMS. Use `dlt` or `dlt_manual` for DLT.

5. Deploy.
6. Test:

```bash
curl https://your-api.onrender.com/api/health
```

Expected:

```json
{"status":"ok","timestamp":"..."}
```

If migration fails, run it locally:

```bash
cd server
DATABASE_URL="postgresql://...direct-neon-host.../neondb?sslmode=require&connect_timeout=15" \
  npx prisma migrate deploy
```

Never use `migrate dev` or `db push` against production.

### Step 3 — Deploy the frontend on Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the repository.
3. Configure:

| Setting | Value |
|---|---|
| Project name | `pinproof` |
| Production branch | `main` |
| Root directory | `client` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |

4. Add environment variables:

```env
NODE_VERSION=22
VITE_API_URL=https://your-api.onrender.com/api
```

5. Deploy.

The repo includes `client/public/_redirects`:

```text
/*    /index.html   200
```

This keeps React Router deep links working on refresh.

6. Copy the production URL, for example:

```text
https://pinproof.pages.dev
```

7. Update Render's `CLIENT_URL` and redeploy the API.

### Vercel alternative

- Root directory: `client`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env vars: `NODE_VERSION`, `VITE_API_URL`

Add `client/vercel.json`:

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

Vercel Hobby is for personal, non-commercial projects. Cloudflare Pages is safer for commercial use.

### Step 4 — Configure Fast2SMS

1. Sign in to [Fast2SMS](https://www.fast2sms.com).
2. Open **Dev API** and copy the API key.
3. Choose a route:
   - `q` — Quick SMS.
   - `dlt` — approved template by Message ID.
   - `dlt_manual` — full approved DLT message.
4. Set these on Render:

```env
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your-api-key
FAST2SMS_ROUTE=q
```

5. For DLT, add the sender and template settings:

```env
FAST2SMS_ROUTE=dlt
FAST2SMS_SENDER_ID=PINPRF
FAST2SMS_MESSAGE_ID=123456
FAST2SMS_VARIABLES_VALUES={code}
```

6. For DLT Manual, add:

```env
FAST2SMS_ROUTE=dlt_manual
FAST2SMS_SENDER_ID=PINPRF
FAST2SMS_MESSAGE_TEMPLATE=Your PinProof verification code is {code}. It expires in 5 minutes. Never share this code with anyone.
FAST2SMS_TEMPLATE_ID=1234567890
FAST2SMS_ENTITY_ID=1234567890
```

7. Redeploy the API.
8. Request an OTP from the deployed frontend.

If delivery fails:

- Check the API key.
- Check the wallet balance.
- Confirm the route is enabled for your account.
- Confirm the sender ID and template are DLT-approved.
- Check Render logs for the Fast2SMS response.

### Step 5 — Verify the full flow

- [ ] `GET /api/health` returns `status: "ok"`.
- [ ] Frontend loads over HTTPS.
- [ ] Deep links work on refresh.
- [ ] OTP request succeeds.
- [ ] OTP arrives and verifies.
- [ ] Requester can create a visit.
- [ ] Inspector can log in and see nearby visits.
- [ ] Inspector can accept and start a visit.
- [ ] Evidence upload works and the image renders.
- [ ] Requester can approve the visit.
- [ ] Live updates appear through HTTP polling without a manual refresh.
- [ ] No CORS errors.
- [ ] No proxy rate-limit errors in Render logs.

---

## 7. Environment variables

### API on Render

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `NODE_VERSION` | Recommended | `22` |
| `DATABASE_URL` | Yes | Neon direct connection string |
| `JWT_SECRET` | Yes | 32+ random characters |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `OTP_SECRET` | Recommended | Defaults to `JWT_SECRET` |
| `OTP_TTL_SECONDS` | No | Default `300` |
| `OTP_RESEND_SECONDS` | No | Default `30` |
| `OTP_MAX_SENDS_PER_HOUR` | No | Default `5` |
| `AUTH_MODE` | Yes | `otp` in production |
| `SMS_PROVIDER` | Yes | `fast2sms`, `twilio`, or `webhook` |
| `FAST2SMS_API_KEY` | For Fast2SMS | Fast2SMS Dev API key |
| `FAST2SMS_ROUTE` | No | `q` (default), `dlt`, or `dlt_manual` |
| `FAST2SMS_SENDER_ID` | For DLT routes | DLT-approved sender ID |
| `FAST2SMS_MESSAGE_ID` | For `dlt` | Numeric DLT Message ID |
| `FAST2SMS_VARIABLES_VALUES` | No | Values for `{#var#}`; `{code}` is the OTP |
| `FAST2SMS_MESSAGE_TEMPLATE` | For `dlt_manual` | Full approved message with `{code}` |
| `FAST2SMS_TEMPLATE_ID` | No | DLT content template ID |
| `FAST2SMS_ENTITY_ID` | No | DLT principal entity ID |
| `SMS_WEBHOOK_URL` | For webhook | Receives `{ phone, code, message }` |
| `SMS_WEBHOOK_TOKEN` | No | Bearer token |
| `CLIENT_URL` | Yes | Exact frontend origin |
| `PORT` | No | Render injects it |

### Client on Cloudflare Pages

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Must include `/api` |

`VITE_*` values are baked in at build time. Rebuild after changing them.

---

## 8. Database operations

### Apply migrations

```bash
cd server
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Generate Prisma Client

```bash
cd server
npx prisma generate
```

### Inspect the database

```bash
cd server
DATABASE_URL="postgresql://..." npx prisma studio
```

Do not expose Prisma Studio publicly.

### Back up

```bash
pg_dump "$DATABASE_URL" --no-owner --no-acl -f backup.sql
```

### Seed

```bash
cd server
npm run prisma:seed
```

Seeding is refused when `NODE_ENV=production`.

---

## 9. Operational limits

### Render

- Sleeps after 15 minutes idle.
- Cold start takes about a minute.
- Local files are lost on redeploy, restart, or spin-down.
- Single instance only.
- In-process rate limits are per instance.
- Clients resume HTTP polling after a cold start.

Optional: ping `/api/health` every 10 minutes with UptimeRobot. This consumes free hours.

### Neon

- Compute suspends after about 5 minutes idle.
- First query after suspension may be slow.
- Keep `connect_timeout=15`.
- Free storage is 1 GB.
- Do not rely on free Neon as your only backup.

### Uploads

- `server/uploads` is ephemeral.
- `.gitkeep` only keeps the directory present.
- Move to object storage before real use.

### Rate limits

- Uses express-rate-limit with client IP.
- `trust proxy` is set to `1` in production.
- Adjust if your proxy chain differs.
- Move to Redis for multiple instances.

### Live updates

- Updates use authenticated HTTP polling, so no persistent connections or
  sticky sessions are required.
- No WebSocket adapter is required.
- The latest GPS point is cached in memory per instance; the database is the
  fallback after a restart or when a request lands on another instance.

### CORS

- API allows exactly one `CLIENT_URL`.
- Cloudflare preview URLs use different subdomains and will be blocked.
- Use the stable production URL.

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `/api/health` returns 503 | Database unreachable | Check `DATABASE_URL`, SSL mode, Neon status |
| `P1001` database error | Wrong host or suspended compute | Use direct host; wake Neon |
| `prisma: not found` | Dev dependencies skipped | Use `npm ci --include=dev` |
| Migration fails | Pooled Neon connection | Use direct connection |
| CORS error | `CLIENT_URL` mismatch | Set exact origin; redeploy API |
| Live updates fail | Wrong `VITE_API_URL` | Include `/api`; rebuild client |
| OTP not received | Route not enabled, low balance, or DLT mismatch | Check Fast2SMS dashboard, API key, route, sender, and template |
| Fast2SMS 412 | Invalid API key | Copy the key again; remove spaces |
| Fast2SMS 416 | Low wallet balance | Recharge the Fast2SMS wallet |
| Fast2SMS 424 / 425 | Invalid Message ID or template | Confirm DLT approval and IDs |
| OTP 429 | Rate limit hit | Wait 10 minutes |
| Evidence image 404 | Ephemeral disk | Move uploads to object storage |
| Image URL points to frontend | Wrong `VITE_API_URL` | Include `/api`; rebuild |
| Deep link 404 | Missing SPA fallback | Confirm `_redirects` or `vercel.json` |
| Frontend calls localhost | Env var missing at build time | Set vars and redeploy |
| App crashes after build | Missing env var | Check Render logs |
| `SMS_PROVIDER=console` error | Production guard | Use `fast2sms` or `webhook` |
| Demo login 403 | Demo disabled in production | Use OTP |

---

## 11. Production hardening

Before real users:

- [ ] Move evidence to object storage.
- [ ] Use a paid Render instance or persistent host.
- [ ] Use managed Postgres with backups.
- [ ] Complete DLT registration for Fast2SMS DLT routes.
- [ ] Move rate limits to Redis.
- [ ] Move JWT storage to httpOnly cookies with CSRF protection.
- [ ] Add malware scanning and image re-encoding.
- [ ] Add security headers and a CSP.
- [ ] Add structured logging and error monitoring.
- [ ] Add privacy policy, terms, and SMS consent.
- [ ] Confirm DLT/template compliance.
- [ ] Add automated backups and test restores.
- [ ] Add a separate staging environment.
- [ ] Monitor health, OTP failures, and SMS delivery.

---

## 12. Rollback

### Render

Use **Rollbacks** in the Render dashboard.

### Cloudflare Pages

Roll back to a previous production deployment.

### Database

Prisma migrations are forward-only.

1. Restore a Neon branch or snapshot.
2. Or restore from `pg_dump`.
3. Fix the migration forward.
4. Redeploy.

Back up before any migration that changes or drops data.

---

## 13. Command cheat sheet

```bash
# Secrets
openssl rand -base64 48

# Install dependencies
(cd server && npm ci)
(cd client && npm ci)

# Build locally
(cd server && npm run build)
(cd client && npm run build)

# Production migrations
cd server
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Prisma Client
cd server
npx prisma generate

# Health check
curl https://your-api.onrender.com/api/health

# Database backup
pg_dump "$DATABASE_URL" --no-owner --no-acl -f backup.sql

# Fast2SMS test message (Quick SMS)
curl -X POST "https://www.fast2sms.com/dev/bulkV2" \
  -H "Authorization: $FAST2SMS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"route":"q","numbers":"9876543210","message":"PinProof test message"}'
```

---

## 14. Deployment-related code changes

Included in the repository:

1. **`client/public/_redirects`**
   - SPA fallback for Cloudflare Pages and Netlify.
   - Prevents deep-link 404s.

2. **`server/src/app.ts`**
   - Sets `trust proxy` to `1` in production.
   - Rate limiting sees the real client IP.

3. **`client/src/utils/api.ts`**
   - Provides `getApiOrigin()` for evidence URLs.
   - Replaces fragile string replacement logic.

4. **`server/src/services/sms.service.ts`**
   - Adds Fast2SMS via the Bulk V2 API.
   - Supports `q`, `dlt`, and `dlt_manual` routes.
   - Keeps Twilio and webhook support.

No changes were made to OTP generation/verification, Prisma schema, or the visit workflow.

### Recommended before production

- Object storage for evidence.
- Production-safe demo mode.
- Pooled Neon connections plus `directUrl`.
- Redis for rate limits.
- httpOnly cookie auth.
- DLT registration for Fast2SMS.

---

## 15. Quick decisions

| Goal | Recommendation |
|---|---|
| Deploy today, private demo | Cloudflare Pages + Render Free + Neon Free + Fast2SMS |
| Public demo, no SMS | Add a production-safe demo login |
| Public OTP | Fast2SMS Quick SMS or DLT |
| Long-term India SMS | Fast2SMS DLT after DLT registration |

**Do not use** Render free Postgres, `SMS_PROVIDER=console`, or `AUTH_MODE=demo` in production.
