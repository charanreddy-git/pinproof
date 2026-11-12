# Production audit — 12 November 2026

> Follow-up local work: the root Vercel entry/rewrite, API type-check gate,
> schema-aware `/api/ready`, read-only deployment smoke script, and explicit
> fresh-GPS permission/proof flow have been implemented in the working tree.
> This report records the **original live deployment**. It will remain broken
> until the production migration and deployment are completed and smoke-tested.

## Conclusion

Two independent, confirmed deployment defects currently break the visit workflow:

1. **The production database does not match the deployed Prisma schema.** An authenticated task-list request returns HTTP 500, and the production log identifies the missing `Task.inspectorNotes` column.
2. **Several API paths never reach Express.** Visit details, edits, Maps-link resolution, supporting photos, and nested OTP endpoints return Vercel's plain-text `NOT_FOUND` response.

Repeated frontend polling amplifies these failures. The health endpoint and local checks do not validate the deployed schema and routing, allowing a broken deployment to look healthy.

This report records an audit; application fixes, production migrations, and redeployment have not been performed.

## Environment and evidence

- Checkout: `main`, commit `5a3e172`.
- Production deployment: `dpl_CKprNe2QKHpuv5wBf5vnAVqquJVr`, built from the same commit on 11 November 2026.
- Canonical live origin: <https://pinproof.vercel.app>.
- <https://track-proof.vercel.app> redirects to that origin with HTTP 307.
- Vercel reports the deployment as `Ready`.
- Evidence: public HTTP probes, demo-account authentication followed by read-only API requests, Vercel runtime/request/build logs, source review, compilation, unit tests, and isolated PostgreSQL integration tests.
- No production visits were created, edited, reset, or deleted. Demo login itself updates the prepared account metadata through the existing login implementation.
- Historical runtime-log requests for one hour and 24 hours were unavailable under the current retention policy. The default recent window captured the reproduced database failure. These findings do not quantify all historical incidents.

## 1. Critical — production schema mismatch causes task-list 500s

**Confirmed in production.** Demo login and `/api/auth/me` succeed. Authenticated `GET /api/tasks` returns:

```json
{"success":false,"message":"Internal server error"}
```

Runtime log at `2026-11-12T13:45:42.102Z`, request `npx6p-1794491141832-cccb68e0e8e0`:

```text
PrismaClientKnownRequestError:
Invalid `prisma.task.findMany()` invocation:
The column `Task.inspectorNotes` does not exist in the current database.
```

The deployed task-list query selects Task scalar fields, including the newly declared fields. The checked-in workflow migration adds `inspectorNotes`, `revisionNote`, `cancellationReason`, `completedAt`, `ProofPhoto`, `TaskEvent`, and the cancelled status. At least part of that migration is absent from the database the production function actually uses.

The Vercel build runs `prisma generate` during installation. **Generating Prisma Client does not apply database migrations.** The root deployment configuration has no migration step, and the inspected build log contains no migration deployment.

**Impact:** dashboards cannot load visits. Other operations querying Task fields and the new workflow tables are also at risk until the schema is aligned. The missing status/tables were not independently inspected in production; the missing column is directly confirmed.

**Repair:** inspect migration status against the exact production `DATABASE_URL`, apply the pending checked-in migration through `prisma migrate deploy`, and verify the authenticated task list afterward. If migration history claims it was applied, investigate schema drift or a wrong database target rather than marking it applied again. Make migration success a release requirement.

Sources: [task query](/Users/charan/projects/pinproof/server/src/services/task.service.ts:67), [schema](/Users/charan/projects/pinproof/server/prisma/schema.prisma:96), [workflow migration](/Users/charan/projects/pinproof/server/prisma/migrations/202611100001_complete_visit_workflow/migration.sql:1), [Vercel build](/Users/charan/projects/pinproof/vercel.json:3), [postinstall](/Users/charan/projects/pinproof/server/package.json:7).

## 2. Critical — deployment routing omits required API paths

**Confirmed in production.** The following requests return plain-text platform 404s, rather than application JSON:

```text
GET   /api/tasks/audit-nonexistent
PATCH /api/tasks/audit-nonexistent
POST  /api/tasks/resolve-url
GET   /api/tasks/audit-nonexistent/photos/audit-photo
POST  /api/auth/otp/request
```

The probes used no token and no valid task mutation. All task routes authenticate before examining the task ID; a working route would therefore return an application JSON 401. The OTP route in this public demo should return the application's JSON 403. Instead these requests fail at the hosting layer.

By contrast, `/api/tasks`, `/api/auth/me`, and `/api/tasks/audit-nonexistent/location` reach Express and return JSON 401 without credentials. Vercel request logs explicitly classify the bare task-detail path as `pathType: not_found`, while the location path is `streaming_func` routed to `/api/tasks/[id]/[[...path]]`.

The deployed functions are:

```text
api/[...path]
api/auth/[...path]
api/tasks/index
api/tasks/[id]/[[...path]]
```

These catch-all filenames are not producing the expected arbitrary-depth and optional-suffix routing in this deployment. The only configured rewrite is the frontend fallback; it explicitly excludes `/api/` and does not fill these gaps.

**Impact:** visit details, tracking/report/upload screens that first fetch a visit, request editing, Maps-link resolution, and supporting-photo delivery are blocked independently of the database issue. Nested OTP endpoints would also remain broken if phone authentication were enabled.

**Repair:** use a supported single Express function entry with an explicit API wildcard route/rewrite, or explicit function routes covering every endpoint. Verify the generated Vercel routing and preserve Express's `/api/...` URL expectations. Validate zero-, one-, and multi-segment suffixes through a deployed preview; do not rely only on a local Express server.

Sources: [deployment routing](/Users/charan/projects/pinproof/vercel.json:6), [function entry](/Users/charan/projects/pinproof/api/tasks/[id]/[[...path]].ts:1), [Express task routes](/Users/charan/projects/pinproof/server/src/routes/task.routes.ts:8), [OTP guard](/Users/charan/projects/pinproof/server/src/routes/auth.routes.ts:30).

## 3. High — deployment checks miss failures and emit TypeScript errors

**Confirmed in the production build log and reproduced locally.**

The normal server build includes the Express request-type augmentation. The API-specific TypeScript configuration only includes `./*.ts` and does not include the standalone augmentation declaration. Compiling that configuration reports **23 TS2339 errors**, all concerning `Request.user`.

```sh
server/node_modules/.bin/tsc --project api/tsconfig.json --noEmit
```

The deployed build log shows these same errors, followed by `Build Completed` and `Deployment completed`. This explains a substantial set of build errors, but these type errors are not the cause of the observed missing database column or platform 404s.

The root `check` script tests and builds the client and normal server; it never type-checks the API entry configuration. The Vercel build command runs only the client build. There is no checked-in GitHub Actions workflow enforcing integration tests or deployed route smoke tests.

**Repair:** include all nested API entry files and the Express declaration in the deployment type-check configuration, make that check fail the release, run the normal checks in CI, and add deployed endpoint smoke tests and migration readiness checks.

Sources: [API tsconfig](/Users/charan/projects/pinproof/api/tsconfig.json:10), [Express augmentation](/Users/charan/projects/pinproof/server/src/types/express.d.ts:1), [server tsconfig](/Users/charan/projects/pinproof/server/tsconfig.json:18), [root check](/Users/charan/projects/pinproof/package.json:17), [Vercel build command](/Users/charan/projects/pinproof/vercel.json:4).

## 4. High — health reports OK while the core application is broken

**Confirmed in production and source.** `/api/health` returns HTTP 200 with `status: "ok"` while the authenticated task list returns 500.

The endpoint only executes `SELECT 1`. That confirms connectivity but cannot detect missing application columns/tables or missing deployed routes.

**Repair:** retain a simple liveness probe if needed, but add schema-aware readiness and a deployed authenticated smoke test. A release should not be considered healthy solely because `SELECT 1` succeeds.

Source: [health check](/Users/charan/projects/pinproof/server/src/app.ts:44).

## 5. Medium — fixed polling repeatedly generates errors during outages

**Confirmed by source review; production traffic volume was not measured.**

Task lists poll every 15 seconds. Details poll every five seconds unless loaded data says the visit is completed or cancelled. A failed initial detail load has no terminal status, so its polling continues. Query defaults also retry a failed request once without classifying the status.

**Impact:** one broken route or missing database column produces recurring errors in each open dashboard/detail view. Permanent 404/403 responses are treated like retryable transient problems. This is an error-volume amplifier, not the original cause.

**Repair:** stop automatic retries/polling for permanent authorization/not-found failures, use bounded backoff for server outages, and expose a recoverable error state. Resume normal polling after a successful recovery.

Sources: [polling](/Users/charan/projects/pinproof/client/src/hooks/useTasks.ts:16), [detail polling condition](/Users/charan/projects/pinproof/client/src/hooks/useTasks.ts:47), [query retry default](/Users/charan/projects/pinproof/client/src/App.tsx:27).

## 6. Medium — live GPS sharing is neither reliably throttled nor freshness-aware

**Code-level defects; not exercised on a physical device in this audit.**

- The sharing effect depends on the entire GPS `fix` object. Each GPS callback restarts the effect and immediately sends a request. Its five-second interval therefore does not impose a five-second minimum between updates. The `sending` flag is local to each effect instance, so a new fix can also start a request while the previous instance's request is in flight.
- If GPS stops delivering fresh fixes or reports an error, the previous `fix` remains stored. The sharing effect does not gate on the location error or the fix age and keeps posting old coordinates. The server timestamps each POST as new. The requester can consequently see stale coordinates labelled live.
- The proof submission page also uses the retained fix without checking its age; retry clears the location error without first invalidating the old fix.

**Repair:** keep throttling/in-flight state across effect executions, send only fresh validated GPS fixes, stop publishing on geolocation failure, and record/check capture time separately from server receipt time. Reject stale fixes before proof submission.

Sources: [sharing effect](/Users/charan/projects/pinproof/client/src/components/InspectorLocationSharing.tsx:17), [retained fix/error handling](/Users/charan/projects/pinproof/client/src/contexts/LiveLocationContext.tsx:59), [server timestamp](/Users/charan/projects/pinproof/server/src/services/location.service.ts:65), [live label](/Users/charan/projects/pinproof/client/src/components/LiveTracker.tsx:66), [submission location](/Users/charan/projects/pinproof/client/src/pages/captain/UploadEvidencePage.tsx:278).

## 7. Medium — auth discovery fails into an unusable login mode

**Confirmed in source; failure branch not induced in production.** The live auth-mode endpoint reports `mode: "demo"` and `phoneSignInEnabled: false`. Phone sign-in is intentionally disabled on this deployment.

However, if the initial auth-mode request fails, the client selects OTP, marks the mode ready, and leaves phone sign-in enabled by default. There is no retry. A transient startup/network failure can therefore replace demo access with a phone flow that this deployment does not support.

**Repair:** represent auth-mode discovery failure explicitly and offer retry; do not infer OTP availability from an unavailable configuration endpoint. If actual customer signup is intended, configure and verify OTP separately after fixing routing.

Sources: [auth defaults and fallback](/Users/charan/projects/pinproof/client/src/contexts/AuthContext.tsx:91), [mode fetch](/Users/charan/projects/pinproof/client/src/contexts/AuthContext.tsx:118), [public-demo OTP guard](/Users/charan/projects/pinproof/server/src/routes/auth.routes.ts:30).

## 8. Medium — deployment documentation describes a retired topology

**Confirmed by live probes and configuration.** The deployment guide describes separate `client` and `server` projects and says the client proxies to `pinproof-api.vercel.app`. That host now returns `DEPLOYMENT_NOT_FOUND`. The current deployment is the repository-root combined project; its canonical domain is `pinproof.vercel.app`.

`track-proof.vercel.app` redirects across origins. An authenticated API request made directly to that old origin lost its Authorization header when following the redirect and returned `No token provided`; the same canonical-origin profile request succeeded. The deployed frontend uses relative `/api`, so this is an old-client/integration/documentation problem rather than the cause of its current dashboard 500.

**Repair:** document the current root deployment and canonical origin, correct the migration/release commands, and mark obsolete split-host instructions clearly. Any external API caller must target the canonical origin directly.

Sources: [outdated deployment record](/Users/charan/projects/pinproof/DEPLOYMENT.md:20), [client routing](/Users/charan/projects/pinproof/client/vercel.json:1), [current root deployment](/Users/charan/projects/pinproof/vercel.json:1), [relative API default](/Users/charan/projects/pinproof/client/src/services/api.ts:3).

## Verification results

- `npm run check`: **passed** — 17 server tests, four client tests, client lint, server build, and client build.
- `npm run test:e2e` with default settings: initially blocked because no database was listening on local port 5432.
- Re-ran `npm run test:e2e` against a temporary, isolated PostgreSQL 18 cluster with all checked-in migrations: **passed**, 11 reported tests. The temporary server was stopped afterward. This exercised signup, OTP replay/concurrency, booking, discovery, assignment races, persistent location, evidence validation, supporting photos, revisions, completion, cancellation, release, and account changes.
- API-entry type-check: **failed**, 23 missing `Request.user` declaration errors.
- Production dependency audits (`npm audit --omit=dev`) for server and client: **zero reported vulnerabilities** at audit time. The deployment build's moderate dependency warnings are not evidence that those packages caused the observed runtime failures.
- Production health/auth/list/routing probes: failures documented above.
- Browser UI automation, physical-device GPS/camera behavior, and real SMS delivery were not tested in this audit.

## Repair order and acceptance criteria

1. **Align the production database schema** with the deployed code. Confirm migration history and database target, then run the checked-in pending migration. Authenticated task listing must return JSON 200.
2. **Repair Vercel API routing.** Every declared Express route must reach Express. Unauthenticated protected paths should return JSON 401, including task details and supporting-photo paths; public-demo OTP should return JSON 403 rather than platform 404.
3. **Fix the deployment type-check and release gates.** Require API-entry compilation, unit checks, isolated database workflow tests, migration readiness, and deployed preview smoke tests.
4. **Verify the complete workflow on a non-production database through the deployed routing:** book, edit, resolve Maps URL, accept, start, share location, upload primary/supporting photos, retrieve photos, request revision, resubmit, print report, and complete. Also verify cancel/release.
5. **Address polling, GPS freshness/throttling, auth-mode recovery, and deployment documentation.**

Applying the migration alone will leave the platform 404s. Fixing routing alone will leave the database 500s. Both are required to restore the visit workflow.
