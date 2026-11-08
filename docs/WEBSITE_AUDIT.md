# PinProof website audit

Date: 5 November 2026

Implementation follow-up: see [UX_IMPROVEMENTS.md](UX_IMPROVEMENTS.md) for fixes, verification results, and the outstanding database migration. Findings below describe the original audited state.

The landing page now explains the service clearly and the main booking action is easy to find. The most valuable next improvements are making the booking offer consistent, protecting proof, improving recovery from failures, and simplifying mobile booking.

## Scope and evidence

- Read the React routes, authentication, task queries, booking, evidence submission, tracking, and relevant Express/Prisma code.
- Used a local browser at 390 × 844 and 1280 × 800 for `/`, `/verify`, `/captain`, `/login`, `/verify/signup`, and the booking page.
- Tested signed-in rendering with simulated sessions and API responses; explicitly simulated an inspector visit API failure.
- No live OTP delivery, real payment, physical GPS capture, production deployment, or database-backed end-to-end visit was tested. Source findings below are distinguished from browser reproductions.
- This is a product, usability, and implementation audit, not a comprehensive security or accessibility certification.

## Priority findings

### 1. High: “Private proof” images have a public file route

**Evidence:** `server/src/app.ts:36` serves `/uploads` with `express.static` before the authenticated task routes. The controller stores a directly usable `/uploads/<filename>` URL. The homepage describes proof as private.

**Impact:** Someone who obtains an image URL can retrieve the evidence without task authorization. An unpredictable filename does not enforce access control.

**Improve:** Serve evidence through a task-authorized endpoint, or issue short-lived signed image URLs after authorization. Add appropriate caching rules and verify that a logged-out request and an unrelated account cannot retrieve evidence.

**Verification:** Source-confirmed route configuration; production retrieval was not attempted.

### 2. High: Detailed pricing does not survive booking

**Evidence:** `client/src/pages/LandingPage.tsx:143` sends the plan name through `visitType`. `client/src/pages/user/CreateTaskPage.tsx:105` recognizes only property categories, while its summary at line 562 always says Standard visit and ₹999. The task schema has no plan, price, or payment fields (`server/prisma/schema.prisma:76`).

**Reproduction:** Open `/user/create-task?visitType=Detailed%20visit` with a simulated requester session. The notes are empty and the summary shows Standard visit. Reproduced at both browser widths.

**Impact:** A user choosing ₹2,499 cannot tell what they are buying. Priority matching and inspector payout promises also lack corresponding product state in this implementation; external manual operations were not verified.

**Improve:** Separate `propertyType` from `visitPlan`. Persist the selected plan and its quoted price, and show the same choice through signup, booking, and visit details. Implement the commercial workflow or describe clearly what is arranged manually before advertising it as available.

**Acceptance:** Both pricing buttons produce the intended plan and price throughout the complete request flow.

### 3. High: Task cache is not isolated by account

**Evidence:** `client/src/hooks/useTasks.ts:19` keys lists by filter/location and details by task ID, without account identity. The shared QueryClient survives route changes (`client/src/App.tsx`). Ordinary logout clears local storage but not the query cache (`client/src/contexts/AuthContext.tsx:158`). Demo role switching separately clears it, which does not cover ordinary account changes.

**Impact:** A subsequent account in the same tab can receive previously cached task data before refetch completes, particularly inside the 10-second freshness window. This is a client cache isolation issue; it does not establish that the server permits unauthorized task requests.

**Improve:** Cancel and clear private queries on logout/account changes, and include the authenticated user ID in private query keys. Disconnect the previous socket synchronously as part of ending a session.

**Acceptance:** Switching from account A to B never renders A’s visits, even with a slow or failing API.

**Verification:** Source finding; cross-account browser reproduction was not performed.

### 4. Medium: A failed inspector request looks like an empty account

**Evidence:** `client/src/pages/captain/AcceptedTasksPage.tsx:38` reads loading/data but not error state, then substitutes an empty list. The discovery dashboard follows the same pattern at `client/src/pages/captain/CaptainDashboard.tsx:315`.

**Reproduction:** Return HTTP 500 for the accepted-visits API. After the query retry finishes, the page shows “No active visits” and zero counts.

**Impact:** Inspectors may believe assigned work disappeared, with no retry path.

**Improve:** Distinguish loading, successful empty, failed, and stale-data states. Provide Retry and retain previously loaded results with a clear update-failed message.

### 5. Medium: Mobile booking hides its final action far below the form

**Evidence:** At 390 × 844, the request button begins about 2,401 px below the page top. The map, large notes area, quick-add controls, explanation, and summary all precede it. The bottom navigation stays visible while the booking action does not (`client/src/pages/user/CreateTaskPage.tsx:571`).

**Impact:** Users need several screens of scrolling to discover what remains before they can request the visit.

**Improve:** Put a persistent booking action above the bottom navigation, show the missing requirement next to it, and provide a compact collapsible summary. Keep the map adjustable without making it dominate the initial task.

**Acceptance:** The primary action and next required step remain discoverable throughout mobile booking; errors move focus to the relevant field.

### 6. Medium: Small, low-contrast account text undermines readability

**Evidence:** The booking and dashboard markup contains numerous 9–12 px labels and helper strings. `text-surface-400` resolves to `#929da8`, which has approximately 2.76:1 contrast against white. For example, it appears on the small account-role label at `client/src/layouts/DashboardLayout.tsx:297` and booking-summary labels. This is below the normal-text contrast target of 4.5:1.

**Impact:** Users must work harder to read instructions, especially on phones outdoors. The global Poppins change also increases the need to review older tightly packed components.

**Improve:** Use roughly 16 px for instructions and 13–14 px for secondary labels, with darker semantic text tokens. Review the public secondary pages, authentication, booking, and inspector tools together for consistent spacing and type hierarchy.

**Verification:** Source inspection, computed token contrast, and browser text-size inventory; a complete automated accessibility audit was not run.

### 7. Medium: “Live” tracking does not expire when updates stop

**Evidence:** `client/src/components/LiveTracker.tsx:91` shows Live whenever any location exists. There is no age threshold or socket-connection condition. `useLiveLocation` retains the last received position (`client/src/hooks/useSocket.ts`). The outer tracking page’s “Last update” uses task status time, not the location timestamp.

**Impact:** A disconnected inspector can appear to be actively tracked at an old position.

**Improve:** Show location-update age, a stale-location state, and a reconnecting indicator. Rejoin task rooms after socket reconnect and reload the latest authorized location when opening tracking.

**Acceptance:** Pausing location delivery visibly changes the state; reconnecting restores fresh updates without a page reload.

**Verification:** Source finding; a live two-device/socket journey was not tested.

### 8. Medium: Capture time is presented more strongly than the evidence supports

**Evidence:** The file-upload fallback stamps an existing selected image with the current time (`client/src/pages/captain/UploadEvidencePage.tsx:203`). The server accepts client-provided capture time and coordinates, checks their distance, and stores them (`server/src/services/task.service.ts:262`).

**Impact:** An older uploaded picture can appear newly captured. A distance check on supplied coordinates does not independently establish photo provenance.

**Improve:** Record and display camera capture versus uploaded image, distinguish upload/submission time from capture time, and describe GPS as device-reported. Add freshness/accuracy checks appropriate to the service; avoid promising stronger authenticity than the implementation establishes.

### 9. Lower: Sharing copies a route the recipient may not be allowed to open

**Evidence:** Share copies `/user/track/:id` or `/user/tasks/:id` (`client/src/pages/user/TrackCaptainPage.tsx:80`, `client/src/pages/user/UserTaskDetail.tsx:93`). Those routes require requester login and the server checks task ownership.

**Impact:** A family member receiving a tracking link cannot necessarily view the visit, although the share text suggests they can follow it.

**Improve:** Explain that the link requires the owner’s account, or implement an explicitly authorized, revocable, expiring read-only share link with a defined privacy scope.

### 10. Lower: Homepage image and initial bundle can be lighter

**Evidence:** `client/public/verified_property.png` is 1,059,559 bytes. The latest production build emits one application JavaScript chunk of about 761 kB before gzip (about 208 kB gzipped); page imports are eager in `client/src/App.tsx`.

**Impact:** Users on slower mobile connections download substantial code and imagery before interacting.

**Improve:** Supply responsive AVIF/WebP property imagery, explicit intrinsic image dimensions, and lazy-loaded page routes. Keep the hero image prioritized; load map/camera functionality with the routes that need it.

**Verification:** File/build sizes, not measured field Core Web Vitals.

## What is working

- No horizontal overflow on the five public routes checked at 390 px and 1280 px.
- The homepage booking action is visible without scrolling at those dimensions.
- Property-category choices preserve their destination through the signup URL.
- The mobile menu opens correctly.
- The recent build and lint checks pass.
- Server task-detail access checks and submission status/assignee checks exist; image delivery needs the same authorization discipline.

## Suggested implementation order

1. Protect evidence delivery and isolate private caches.
2. Repair plan/price continuity and clarify service/payout promises.
3. Add inspector error recovery and simplify the mobile booking action.
4. Improve text contrast and carry consistent typography through secondary and signed-in pages.
5. Add tracking freshness, clarify image provenance and sharing, then optimize downloads.

## Verification limits and next checks

Before release, run a real two-account journey: request, accept, travel, capture, review and complete. Include an offline/reconnect cycle, denied location/camera permission, image retrieval after logout, a failed upload, and a different owner attempting to access the visit. Confirm which regions actually have inspector coverage and how payments, cancellations, and support operate before making those promises more prominent.
