# Independent verification 5 — PASS

Verified 2026-08-29 UTC against commit
`5112962793b27e1362e107493a237ceca0219069` and
`https://apk-provenance-locker.sociobot.in`.

## Verdict

**PASS.** No critical, high, medium, or low defects were found. The deployed
HTML, JavaScript, CSS, and service worker are byte-for-byte identical to a
fresh production build of the tested commit. `origin/main` resolves to the
same commit.

## Cold first read and demo

Fresh desktop load returned HTTP 200 and plainly said:

- What it does: “Verify APKs before restoring.”
- Who it is for: Android sideloaders who need package, version, signer,
  lineage, and hash evidence before reinstalling.
- What to do first: the first screen has **Try it with sample data**, linked
  directly to `/demo`, with the adjacent explanation “See a ready-to-check
  locker.”

The one-click demo opened with two realistic sample records (F-Droid and
KeePassDX), the persistent “Demo — sample data, nothing is saved” banner,
Reset demo, and Start for real. A live test added a signed APK in demo mode:
only `demo:apk-locker:records` and `demo:apk-locker-files` were populated;
Start for real removed both, left the real namespace empty, and showed the
empty locker. This meets the demo-sandbox separation requirement.

## Required claim tests

`.factory/claims.json` exists and has 19 claims. Each has exactly one matching
`@claim:<id>` browser test. From the clean checkout, every listed command
`npm test -- --grep @claim:<id>` was run independently and passed. A further
combined claim run and the full suite also passed; Playwright's final result
was `status: passed`, with no failed tests.

Passed claim IDs: `hash-check`, `signature-verification`, `v1-verification`,
`tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
`signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`,
`local-storage`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`,
`apk-never-uploaded`, `offline-reload`, `offline-verification`, and
`release-assets`.

## Local gates

- `npm ci`: passed; 189 packages installed, `npm audit` reported 0
  vulnerabilities.
- `npm test`: passed: 12 unit/config tests and 24 Chromium browser tests.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/`.
- Production initial JavaScript is 32,749 bytes raw / 12,220 bytes gzip; CSS
  is 9,645 bytes raw / 2,980 bytes gzip. The 5,828,623-byte apksig WASM is
  fetched only when the user chooses an APK, not on first load. The hero image
  is 75,842 bytes.

## End-to-end and error recovery

On the deployed `/demo`, the genuine Android apksig v1/v2/v3 lineage fixture
verified on both desktop (1280 × 900) and mobile (390 × 844). It reported the
verified signature schemes and recorded the APK. Each run made seven
same-origin GET requests with no request bodies and no console or page errors.

An invalid short `.apk` produced “This file is too short to be an APK.”, the
Verify button was re-enabled, and selecting a genuine v1 fixture immediately
afterwards succeeded. An encryption-password mismatch reported “The two
passwords do not match.” The local suite additionally exercised tampering,
malformed ZIP structure, malformed lineage, downgrade and signer-drift
warnings, encrypted export/import, storage persistence, saved-copy deletion,
and a 12 MiB saved-copy export.

## Privacy, PWA, accessibility, and deployment

- A fresh live `/demo` page load requested only the product origin (HTML, JS,
  CSS, and self-hosted hero image), all as GETs with no bodies. The full live
  APK-selection flow likewise made only same-origin GETs; no APK upload,
  GitHub API request, account request, analytics, or third-party request was
  observed.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 and had no console/page
  errors. The designed unknown route returned HTTP 404 and a usable 404 page.
- Live axe scans at desktop and 390px had zero violations (therefore zero
  serious/critical findings). Pages have `lang=en`, one `h1`, and one `main`.
  Keyboard testing reached the skip link with Tab, showed a 3px visible focus
  outline, moved to the main heading, opened the file dialog with Enter,
  focused its file field, and recovered with Escape. Reduced-motion live test
  found zero active transitions/animations.
- Service worker control was active. After first visit, `/demo` reloaded
  offline with its sample records present. `registration.update()` completed
  with an active worker and no waiting worker or error.
- Response headers include HSTS, `nosniff`, strict referrer policy,
  restrictive permissions policy, and CSP with `connect-src 'self'` and
  `frame-ancestors 'none'`. HTML revalidates after 30 seconds; hashed JS/CSS
  assets are `max-age=31536000, immutable`.
- Live SHA-256 comparisons matched local `dist/index.html`,
  `assets/index-CTSmEZV-.js`, `assets/style-kkPqLax9.css`, and `sw.js`.
  This is direct evidence that the live deployment is this candidate.

## Android release artifacts

The landing-page APK, AAB, and SHA256SUMS links were downloaded from v0.3.0.
The APK is 5,583,235 bytes and the AAB is 5,403,880 bytes; both pass the
published SHA256SUMS check. The APK is a valid ZIP containing
`AndroidManifest.xml` and the packaged PWA. Its manifest string pool confirms
application id `in.sociobot.apk_provenance_locker` and version name `0.3.0`.

## Applicability notes

This is a local-first static PWA/Android wrapper: it has no product server
endpoint or paid-unlock endpoint, so a 429/`Retry-After` allowance test is not
applicable. It has no sign-in and no AI feature. No library/CLI consumer test
is applicable.

## Defects by severity

None.
