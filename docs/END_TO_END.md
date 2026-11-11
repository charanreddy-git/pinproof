# End-to-end PinProof workflow

## Start the application

From the repository root, install with `npm run install:all`, configure
`server/.env` from `.env.example`, apply `npm run db:migrate`, and run
`npm run dev`. The UI runs on http://localhost:5173 and the API on port 3001.
`GET /api/health` verifies database connectivity.

For a local database alongside a deployed `.env`, put your local values in
`server/.env.development.local`. Both the development server and root database
command load this first. Explicit environment variables take priority. Production
ignores this optional file. Direct `npx prisma` commands read `.env`, so use the
root migration command for local overrides.

Set `AUTH_MODE=demo` to enable one-click access, or `AUTH_MODE=otp` and
`SMS_PROVIDER=console` to exercise phone signup. The login screen displays a local
test code. A new phone number is verified before the name and role are collected.
For SMS delivery, configure Fast2SMS, Twilio, or the webhook provider as documented
in README.md.

## Requester journey

1. Sign in, choose **Book a visit**, and select Standard or Detailed.
2. Paste a Google Maps property link, use current location, or place the map pin.
3. Add instructions and request the visit. The selected plan and server-priced
   quote remain attached to the visit.
4. Use **Edit request** to correct the title, instructions, or coordinates while
   the request is open. **Cancel visit** is available until the inspector starts.
5. After acceptance, the assigned inspector's contact number is available.
6. During the visit, open **Track live visit**. Old location points are labelled
   stale instead of being shown as live.
7. Review the primary photo, device GPS, supporting photos, and written findings.
   Use **Request revised proof** if a check is missing. The previous proof remains
   visible with a revision-pending message until the inspector replaces it.
8. Open **View / print report**, then **Print / save as PDF**. Photo loading must
   finish before printing. The report includes the visit history and provenance.
9. **Mark complete** approves the submission. Completed and cancelled visits remain
   in history. Account name and email can be updated from the account menu.

## Inspector journey

1. Sign in as an inspector and allow location to discover requests within 7 km.
   Demo discovery uses a labelled Bengaluru search location.
2. Read the instructions and accept the visit. Two simultaneous accept attempts
   cannot assign the same visit twice.
3. Before starting, **Release visit** makes it available to another inspector.
4. Start the visit. The dashboard shows whether GPS was successfully shared,
   whether permission is missing, or whether sharing is paused. Sharing continues
   across dashboard routes while PinProof is open.
5. At the pin, take a camera photo or use the upload fallback. Submission uses the
   latest fix from the shared live GPS watch. Distance and accuracy must both be
   within 100 m.
6. Add up to five supporting JPG/PNG photos and written findings. All photos
   combined must fit within 4 MB. Camera captures must be under 15 minutes old;
   uploaded images do not claim a verified capture time.
7. Submit. Status, photo bytes, notes, and history commit together in PostgreSQL.
   If revised proof is requested, the feedback appears on the visit and upload
   pages. Submit the complete replacement report, including supporting photos.

## Automated verification

```bash
npm run check
npm run test:e2e
# First browser-test run only:
cd client && npx playwright install chromium
# From the root:
npm run test:browser
```

API integration tests use actual HTTP requests and PostgreSQL, covering phone
signup, OTP replay protection, account changes, nearby discovery, authorization,
competing accept/start/cancel/complete requests, persistent GPS, image validation,
private downloads, revision and replacement, cancellation, and release.

Browser tests use two independent Chromium accounts, a mobile requester viewport,
and a desktop inspector viewport. They exercise real API/database state through
the UI, including edits, upload fallback, supporting photos, revision, photo
download, PDF rendering, approval, and profile persistence. GPS is supplied by
Chromium's test geolocation. Real device camera hardware and SMS delivery require
the corresponding device/provider.

Both suites create a unique temporary database schema and remove it afterward.
The default database is local `postgres` with the current OS role; override with
`TEST_DATABASE_URL`. Browser test servers use ports 3002 and 5174. Screenshots,
PDFs, and failure traces are saved under the git-ignored `client/test-results`.

## Deploy this version

Generate the Prisma client, apply the additive
`202611100001_complete_visit_workflow` migration, then deploy both API and client.
The migration adds cancellation, findings/revision fields, supporting photos,
and visit events. Existing evidence and visits are preserved; historical metadata
that was not recorded is labelled accordingly. See DEPLOYMENT.md for the existing
Vercel project configuration.
