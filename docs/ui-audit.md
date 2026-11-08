# UI audit and polish

2026-11-07. Hallmark and frontend-design, applied to the existing UI.

## Direction

Keep the property photo and booking action prominent. Retain the yellow action colour and current type system. Quiet repeated icon containers, remove decorative heading underlines, improve mobile reading, and use sentence-case labels throughout the application.

## Changes

- Simplified landing-page service icons and proof receipt.
- Increased small-screen descriptive text and booking helper text.
- Added contrasting two-tone keyboard focus and instant focus transitions.
- Removed broad transitions and width/height animations.
- Converted tracked uppercase labels to sentence case.
- Decorative shared SVG icons are hidden from assistive technology unless explicitly labelled.
- Moved the camera-button shadow into the theme.
- Removed redundant eyebrows, decorative arrows and middle-dot separators.

## Copy adjustments

- “Earn per visit.” → “Inspect properties. Earn per visit.” where the inspector eyebrow was removed.
- “Three simple steps.” → “How it works in three steps.”
- “We can’t find this page.” → “Page not found.”
- Removed “Start here” and “Ready when you are” eyebrows.
- Converted dash-separated instructions into sentences and fee ranges into “to”; retained amounts and meaning.
- Converted metadata separators into spacing or punctuation.

## Verification and limitations

Client production build and ESLint passed. Hallmark's preservation check retained all 56 recorded links and 95 handlers. The initial recorded audit had 90 failures and 32 reflex findings. This is a static audit: browser rendering could not run because puppeteer-core is unavailable. Authenticated flows and responsive screenshots require runtime verification.

Remaining review notes: existing translucent surfaces, status stripes and long control labels need visual evaluation. Map attribution strings are source markup, not prose quotation errors. The live camera has no poster deliberately: a prerecorded still would misrepresent its state. Shared icons support explicit aria-label and aria-hidden; callers using aria-labelledby must currently set aria-hidden={false}.

The most useful next material is a real, permission-cleared property inspection photo to replace the existing example photo (square source, at least 960 px).
