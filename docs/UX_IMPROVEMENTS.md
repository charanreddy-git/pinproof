# PinProof UI and product improvements

Implemented following the website audit, 5 November 2026. The original findings remain in [WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) as a record of the starting state.

## Product and audience

PinProof connects remote property owners and buyers with local inspectors. Requesters need to specify the right property, understand the quoted visit, follow progress, and judge submitted evidence. Inspectors need nearby work, clear instructions, navigation, and a reliable way to submit photos from the property.

The design retains the yellow, dark ink, and white identity. Yellow identifies primary actions; neutral surfaces support content; status colors have explicit text labels. Poppins is self-hosted. Shared controls use consistent sizing, readable secondary text, restrained borders, and visible keyboard focus. Decorative gradients, background patterns, and scroll reveals were reduced where they did not communicate anything.

## Changes

| Area | Result |
| --- | --- |
| Public pages | Consistent navigation and typography, simpler secondary landing pages, clear example imagery, dark buttons on yellow sections, and more accurate explanations of timing, evidence, and payments. |
| Signup and login | Role-specific supporting content, quieter form layout, unique input IDs, preserved booking return paths, and consistent control heights. |
| Dashboard | Fixed clipped mobile content and an unreadable statistic tile; simplified tiles; moved the sidebar to desktop widths so tablets have usable content space. |
| Navigation | Keyboard focus, arrow navigation, and Escape handling for account/activity menus; mobile activity panel stays inside the viewport; skip links on public pages. |
| Visit lists | More readable mobile rows, status below the title on small screens, larger search/filter targets, keyboard-operable tabs, and explicit error/retry states. |
| Booking | Property type and plan survive authentication; useful editable instruction defaults; selected plan and price persist; a fixed mobile request action shows the missing requirement. |
| Proof review | Evidence precedes the map when available; capture method appears next to the photo; submission GPS is distinguished from photo provenance; dialogs isolate background content and restore focus. |
| Inspector submission | Camera and uploaded files are labeled separately; uploads do not acquire an invented capture time; GPS permission errors have a retry action; inaccurate GPS explains why submission is blocked. |
| Tracking | Connection state and location age control the Live label; old positions show a warning; the latest authorized location is fetched on opening/reconnecting. |
| Privacy | Evidence is fetched through an authenticated participant-only route; direct public upload access is disabled; private queries are scoped to the account and cleared on session changes. |
| Performance | Routes and Leaflet are split into separate chunks. The former 1.06 MB property PNG now has 55 KB and 198 KB responsive WebP derivatives. |

## Audit finding status

1. Public evidence route: replaced with authenticated delivery; request-level tests cover missing credentials, unrelated users, authorized participants, caching, and stored path validation.
2. Lost visit plan: fixed in URL handoff, booking form, API validation, server quote assignment, persistence, and detail displays. Database migration still needs to be applied.
3. Cross-account cache: account-specific keys and session cache/socket cleanup implemented; browser account-switch check passed.
4. Failed requests shown as empty: explicit failure and stale-data notices with retry implemented; browser retry recovery passed.
5. Buried mobile request action: fixed action and missing-step message implemented; checked within the mobile viewport.
6. Small and low-contrast text: shared labels, controls, tiles, and page typography improved; dashboard clipping corrected. This is not a full WCAG certification.
7. Stale tracking shown as live: explicit freshness/connection states implemented and stale fixture verified. A real two-device reconnect journey remains unverified.
8. Unreliable capture-time claims: source is stored and shown; uploaded photos have no claimed capture time. Camera freshness and GPS accuracy checks added. GPS and camera time remain device-reported.
9. Misleading sharing: actions now say “Copy owner link” and explain the owner account requirement. Public sharing was not introduced.
10. Large initial assets: responsive WebP and lazy route/map loading implemented. Main production JS is about 445 KB (132 KB gzip), down from about 761 KB (208 KB gzip) in the audit baseline. These are build sizes, not measured loading times.

## Verification

- Client TypeScript/Vite production build and ESLint.
- Server TypeScript build; security/quote/evidence regression suite passed all 9 reported tests using fixture database methods and real local HTTP requests.
- Browser rendered 17 public, auth, requester, and inspector route states at 390, 768, and 1280 px (51 checks). No document overflow, clipped main content, or JavaScript exceptions were detected.
- Visually reviewed public pages, auth, requester dashboard, booking, visit/proof details, inspector discovery, and upload layouts on phone and desktop.
- Browser interaction checks passed for plan/category submission, account cache isolation, inspector API failure/retry, stale location, mobile navigation, FAQ, phone validation, OTP input and booking handoff, list tabs/search, account/activity menu keyboard controls, and modal focus trapping/restoration.
- Additional homepage and missing-page checks passed at 320 and 768 px (4 checks; 55 responsive checks total).
- Simulated camera/GPS tests passed for camera submission, upload submission without a capture timestamp, and blocking an inaccurate 500 m GPS reading.
- Browser API responses and sign-in were simulated. No real OTP SMS or payment was sent.

## Database and deployment dependency

The additive migration `server/prisma/migrations/202611050001_visit_quotes_and_evidence_source/migration.sql` adds nullable plan, quote, property type, and evidence source columns. Existing visits retain null values and the UI labels missing data rather than inventing it. Prisma client generation succeeded.

Applying the migration was attempted, but PostgreSQL at `127.0.0.1:5432` was unreachable (Prisma P1001). Once the configured database is available, run from `server`:

```sh
npx prisma migrate deploy
```

Apply the migration before running the updated API against an existing database. Keep the uploads directory outside any separate public/static hosting rule: evidence must be served by the authenticated API.

No production deployment, live database visit lifecycle, real device camera/GPS accuracy, real SMS delivery, or real inspector payment workflow was verified. Payment processing is not part of this implementation; the UI now states that clearly.
