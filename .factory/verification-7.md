# Independent product verification 7 — FAIL

**Candidate:** `152ed6e25a66eb5ddae98d583c997d535bb736de`  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Result:** **FAIL — do not release**

The deployment is current and the core APK work is functional. All 21 declared
claim commands, the full suite, the build, live APK verification, encrypted
restore-kit validation, accessibility, privacy, offline, payment, rate-limit,
and Android artifact checks passed. Three independent release blockers remain:
the product irreversibly deletes the record and saved APK on one activation,
most registered claim tests bypass the required demo sandbox, and the Terms
page contains a license-revocation/refund claim outside the registry contract.

## Opening gates

### Claims: commands pass, but the required demo-sandbox contract FAILS

`.factory/claims.json` exists with 21 entries. After the clean `npm ci`, every
exact command was run separately. Each selected exactly one Playwright test
and exited 0:

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `hash-check` | `npm test -- --grep @claim:hash-check` | PASS |
| `signature-verification` | `npm test -- --grep @claim:signature-verification` | PASS |
| `v1-verification` | `npm test -- --grep @claim:v1-verification` | PASS |
| `tamper-rejection` | `npm test -- --grep @claim:tamper-rejection` | PASS |
| `lineage-integrity` | `npm test -- --grep @claim:lineage-integrity` | PASS |
| `apk-identity` | `npm test -- --grep @claim:apk-identity` | PASS |
| `downgrade-risk` | `npm test -- --grep @claim:downgrade-risk` | PASS |
| `signer-drift` | `npm test -- --grep @claim:signer-drift` | PASS |
| `apk-structure` | `npm test -- --grep @claim:apk-structure` | PASS |
| `encrypted-export` | `npm test -- --grep @claim:encrypted-export` | PASS |
| `password-not-stored` | `npm test -- --grep @claim:password-not-stored` | PASS |
| `local-storage` | `npm test -- --grep @claim:local-storage` | PASS |
| `saved-copy-erasure` | `npm test -- --grep @claim:saved-copy-erasure` | PASS |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `no-account-network` | `npm test -- --grep @claim:no-account-network` | PASS |
| `apk-never-uploaded` | `npm test -- --grep @claim:apk-never-uploaded` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `offline-verification` | `npm test -- --grep @claim:offline-verification` | PASS |
| `release-assets` | `npm test -- --grep @claim:release-assets` | PASS |
| `paid-unlock` | `npm test -- --grep @claim:paid-unlock` | PASS |
| `hosted-checkout` | `npm test -- --grep @claim:hosted-checkout` | PASS |

The source cross-check passes its uniqueness assertion: one distinct
`@claim:<id>` tag exists for each registry entry. However, only five tagged
tests open `/demo`; the other sixteen explicitly open `/`. That violates the
instruction to test every claim using only the product's demo entry point and
is a separate blocker below. The unlisted live claim is another blocker.

### Cold first read and one-click demo: PASS

A new browser context at 1440 by 900 and 390 by 844 answers all three required
questions without scrolling:

- what: “Verify APKs before restoring”;
- for whom: Android sideloaders who need package, version, signer, lineage, and
  hash evidence before reinstalling;
- first action: “Try it with sample data,” beside “See a ready-to-check
  locker.”

One click opens `/demo`, immediately showing F-Droid and KeePassDX records and
the persistent “Demo — sample data, nothing is saved” banner with Reset demo
and Start for real.

Evidence: `.factory/qa-evidence/live-cold-desktop.png`,
`.factory/qa-evidence/live-cold-mobile.png`, and
`.factory/qa-evidence/live-demo-mobile.png`.

## Release-blocking findings

### F-7-1 — High — One click permanently deletes the core record and APK copy

The Remove control performs irreversible deletion immediately. There is no
confirmation dialog and no Undo action. In a fresh live context I verified the
v1 fixture with the default “Save this APK copy” option. Before removal,
localStorage contained one record and IndexedDB contained one saved file. One
activation of “Remove android.appsecurity.cts.tinyapp” changed both counts to
zero. The only feedback was the after-the-fact toast “Record and saved APK copy
removed from this device.”

This can destroy the user's only rollback copy, which is the asset this product
exists to protect. It violates the supplied design contract that destructive
actions must be reversible or confirmed with specifics. The implementation is
the direct delete handler in `src/main.ts` (`data-remove` binding).

Required remediation: ask for specific confirmation before deleting both
items, or provide a genuine undo window that restores both metadata and bytes.

### F-7-2 — High — Sixteen registered claim tests bypass the demo sandbox

The exact commands are green, but only `password-not-stored`, `demo-sandbox`,
`no-account-network`, `apk-never-uploaded`, and `offline-reload` enter
`/demo`. The other sixteen claim tests call `page.goto('/')`, including all
signature, hash, identity, tamper, downgrade, signer, structure, export,
persistence, release, and paid-unlock checks.

The supplied acceptance contract requires every claim to be exercised from a
fresh state using only the one-click demo entry point and shipped sample data.
Running in the real namespace does not prove that the promised observable
behavior is available in the isolated sandbox; it also lets persistence tests
write the real namespace the demo is meant to protect.

Required remediation: make every registered claim test enter `/demo` and
exercise its declared outcome there, including a safe mocked paid-license path,
or obtain an explicit contract change for claims that cannot exist in demo.

### F-7-3 — High — Terms contains an unlisted, incompletely tagged claim

The live Terms page states: “Sociobot/Dodo is the merchant of record and
handles checkout and refunds. A refunded or revoked license stops paid
features.” Neither registered claim states this revocation/refund behavior:

- `paid-unlock` promises that a **valid** license adds labels and can be
  restored; its tagged test exercises only a mocked valid verdict.
- `hosted-checkout` promises the $12 price and hosted checkout; its tagged test
  exercises the Dodo redirect.

There is an ordinary untagged regression for a mocked revoked verdict, but the
supplied claims contract requires every visitor-facing claim to appear in
`.factory/claims.json` with its own observable `@claim:<id>` test. Refund
behavior is not exercised. The contract explicitly makes an unlisted claim a
failed review.

Required remediation: register the precise revocation/refund claim and add one
tagged observable test that proves it, or narrow/remove the copy.

## Other finding

### F-7-4 — Medium — Android download disclosure is incomplete

The Android section links the APK, AAB, and `SHA256SUMS`, and gives three
install steps. It does not display the APK SHA-256 on the landing page and does
not say that the app is not on Google Play yet. Both items are required by the
supplied mobile-native contract. The PWA itself remains technically
installable through a valid manifest.

Required remediation: show the release APK digest
`05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0`
beside the download and add the required distribution note.

## Clean local gates

| Check | Result |
| --- | --- |
| Candidate identity | PASS: HEAD, `origin/main`, and tag `v0.4.0` resolve to the candidate |
| Install | PASS: `npm ci`, 189 packages installed |
| Dependency audit | PASS: `npm audit --audit-level=high`, 0 vulnerabilities |
| Type/lint | PASS: `npm run lint` (`tsc --noEmit`) |
| Full tests | PASS: 15 Vitest unit/config tests and 31 Playwright tests |
| Production build | PASS: `npm run build`, `dist/` produced |
| Android sync | PASS: `npx cap sync android` |
| Diff hygiene | PASS: `git diff --check` |

The work order requires Android packages to be built on GitHub Actions rather
than this worker. The candidate's Android release workflow completed
successfully for the exact SHA.

## End-to-end product evidence

The published APK was selected in the live web app. The product extracted:

- package `in.sociobot.apk_provenance_locker`;
- version `0.4.0`, code `4`;
- SHA-256
  `05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0`;
- verified v1 and v2 signatures;
- current signer fingerprint
  `ac048775ff6c96d407874010b75571e9433b4548f19cd7acd9399ed75893a972`.

The saved 5.3 MB APK exported to a 9,931,454-byte encrypted restore kit. Its
plaintext did not contain the package name. Re-import produced “1 APKs match”
and specifically reported matching hash, signature, identity, and signer.

A separate live capacity exercise created 20 independently keyed saved copies
from the verified signed fixture. The UI rendered 20 records, exported a
632,658-byte kit with “20 records and 20 saved APK copies,” and validation
returned 20 of 20 matching hash, signature, identity, and signer results. This
exercises the success-measure count without claiming 20 distinct APK fixtures.

Recovery and boundary evidence:

- invalid URL: browser blocks it with “Please enter a URL,” then accepts a
  corrected URL;
- non-ZIP and inconsistent ZIP: declared claim tests reject both;
- 11-character password: blocked at the documented 12-character minimum;
- mismatched confirmation: “The two passwords do not match”;
- wrong kit password: “That password did not open this restore kit,” action
  re-enabled, and the correct password then opened the report;
- tampered signed content and malformed v3 lineage: declared tests reject both;
- downgrade and signer-drift warnings: declared tests pass using verified
  identity and signer evidence.

## Privacy, network, payment, and endpoint allowance

Fresh Playwright request logs for landing, demo, genuine APK verification,
published-APK export/import, recovery, and the 20-record exercise contained
only product-origin GET requests, no request bodies, and no console or page
errors. No APK bytes or record content left the origin. Cold `/`, `/demo`,
`/privacy`, and `/terms` loads made no automatic third-party request.

An explicit invalid license restoration made the expected request only to
`api.sociobot.in`; the query token was stripped from the browser URL, removed
from localStorage after the invalid verdict, and absent from Cache Storage.
The checkout endpoint returned 303 to a Dodo hosted session whose order summary
showed “APK Provenance Locker Plus” and `$12.00` subtotal/total.

The product-unlock allowance is enforced. A fresh single-client sequence of 40
verification calls returned 30 HTTP 200 responses, followed by ten HTTP 429
responses. The first 429 was request 31 and included `Retry-After: 4`.

This is otherwise a static/local-first product. Backend concurrency/health and
server persistence are not applicable. There is no sign-in, so the Entra
authority check is not applicable. It is not a library or CLI. No runtime AI
feature is present or useful for the cryptographic job.

## Accessibility, mobile, routing, and PWA

- Axe 4.13 found zero violations, including zero serious/critical findings, on
  `/`, `/demo`, `/privacy`, and `/terms` at desktop and 390 px. The add dialog
  also had zero violations.
- Every route has `lang=en`, one descriptive `h1`, one `main`, complete image
  alt text, and a route-specific title.
- First Tab reaches Skip to content with a visible 3 px orange focus ring.
  Activating it moves focus to the content heading. SPA navigation and browser
  back focus the new heading. The APK dialog focuses its file input, traps no
  keys, closes with Escape, and restores trigger focus.
- Visible home-page controls and the recurring navigation, demo-banner, and
  legal targets measured at least 44 by 44 CSS pixels at 1440 px and 390 px.
  At 390 px with 200% root text, all four routes had no horizontal overflow.
- Reduced-motion emulation left zero active animations or transitions.
- The factory URL verifier passed in 872 ms with no errors. Evidence is in
  `.factory/qa-evidence/verify-url/verify.json`.
- `/`, `/demo`, `/privacy`, `/terms`, release links, robots, sitemap, manifest,
  icons, and social image resolve. An unknown route returns the designed HTTP
  404 page.
- The service worker controls the page, updates cleanly, and leaves only
  `apk-locker-v7`. With HTTP cache disabled, an offline reload retained the
  shell and both demo records. A genuine v1 APK also verified while offline.

## Deployment identity, release artifacts, headers, caching, and performance

The live web deployment matches this candidate. Every publicly served `dist/`
file byte-matched the fresh build; `staticwebapp.config.json` correctly returns
404 because the host consumes rather than serves it. Live `/build.json` and the
copy embedded in the release APK both contain the candidate SHA.

Release assets:

| Asset | Bytes | SHA-256 | Result |
| --- | ---: | --- | --- |
| `app-release.apk` | 5,585,535 | `05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0` | PASS |
| `app-release.aab` | 5,406,182 | `c7bc0408d79a894c9c47ddd3abe5a354fa09d56b8b251c557ad7a5299d513ca3` | PASS |
| `SHA256SUMS` | 164 | published values match both downloads | PASS |

The APK contains `AndroidManifest.xml`, signature metadata, and the full web
payload. Every embedded `assets/public/` file byte-matched local `dist/`. The
successful candidate-specific CI job independently ran `aapt` package/version
assertions and `apksigner` verification. The AAB contains its binary manifest
and matching web payload.

Playwright response headers confirmed HSTS, `nosniff`, strict-origin referrer
policy, restrictive permissions policy, and a CSP with `frame-ancestors
'none'`. HTML uses `max-age=30, must-revalidate`; hashed JS/CSS and verifier
assets use one-year immutable caching; the manifest has the correct
`application/manifest+json` MIME type. A matching ETag request returned 304.

Build budgets pass:

- initial JS: 38,097 bytes raw / 13.69 kB gzip;
- CSS: 10,101 bytes raw / 3.04 kB gzip;
- hero WebP: 75,842 bytes;
- no web fonts or third-party runtime assets;
- signature-verifier WASM is 5,828,623 bytes and is loaded for APK checks and
  precached for offline use, not part of initial page execution.

Three fresh live Lighthouse mobile reports scored Performance 87, 95, and 97
(median 95); Accessibility, Best Practices, and SEO were 100 in every report.
Median LCP was 1.459 s, FCP 1.009 s, CLS 0, transfer about 95 kB, and seven
requests with no third-party bytes. TBT varied from 199 to 519 ms. The bundled
Chromium printed a post-report tab-crash warning on each run, so the median is
the reliable score; Lighthouse lab data does not expose field INP.

## Disposition

Do not release candidate `152ed6e25a66eb5ddae98d583c997d535bb736de`.
Add confirmation/undo for record deletion, move every claim test into the demo
sandbox, bring the revocation/refund copy under the required claims registry,
and complete the Android download disclosure. Then rerun all 21 claim commands
and the full live matrix.
