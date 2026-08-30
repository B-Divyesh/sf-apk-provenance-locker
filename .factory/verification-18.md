# Independent product verification 18 — FAIL

**Candidate:** `058fe2ce981fead74ea63fd612da05baaadaecfe`  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-30 UTC  
**Work order:** `apk-provenance-locker-verify-18`

## Decision

**FAIL — do not accept this candidate.** The first required clean-run claim suite produced a release-blocking failure for `hosted-checkout`.

`npm test -- --grep @claim:hosted-checkout` reached the documented Sociobot URL, but the checkout endpoint returned **HTTP 503** instead of the claimed **HTTP 303** redirect to a Dodo checkout session. This occurred during the mandatory first pass through every entry in `.factory/claims.json`, after `npm ci`, from the product's demo test entry point. Per the claims contract, any failing claim test blocks release.

The dependency recovered during this verification: a later complete `npm test` run passed all 40 Playwright tests, and a direct later checkout request returned 303 to a Dodo session. That proves the failure is intermittent external checkout availability, not a candidate/live identity mismatch. It does not erase the observed required-claim failure or make the checkout reliably verifiable at release time.

## Cold first read — PASS

Fresh mobile load says what it does, for whom, and what to click:

- **What:** “Verify APKs before restoring”.
- **For whom:** “For Android users keeping APK files...”.
- **First action:** visible **“Try it with sample data”**.

One click enters `/?demo=1`, shows the persistent **“Demo — sample data, nothing is saved”** banner, two realistic records (the first at y=638 on a 390×844 viewport), and visible **Reset demo** and **Start for real** controls. No account or setup is needed.

## Required claims — FAIL (25/26 passed in first clean run)

`.factory/claims.json` is present with 26 unique entries. I ran every listed command individually, in manifest order, after the clean install. The following 25 passed:

`hash-check`, `signature-verification`, `v1-verification`, `tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`, `signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`, `local-storage`, `android-backup-disabled`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`, `apk-never-uploaded`, `offline-reload`, `offline-verification`, `release-assets`, `paid-unlock`, `free-core-features`, `revoked-license`, `restore-import`, and `saved-apk-download`.

| Claim | Required observable result | Actual result |
| --- | --- | --- |
| `hosted-checkout` | HTTP 303 and a `checkout.dodopayments.com/session/…` Location | HTTP **503** at `https://api.sociobot.in/api/v1/products/apk-provenance-locker/checkout` |

Evidence: [`claims-first-run.log`](verification-evidence-18/claims-first-run.log). The later 303 is recorded in [`checkout-after-retry.json`](verification-evidence-18/checkout-after-retry.json), and the complete subsequent suite in [`full-test.log`](verification-evidence-18/full-test.log).

## Candidate, deployment, and Android artifact identity — PASS

- Local HEAD, GitHub `main`, and live `/build.json` all identify `058fe2ce981fead74ea63fd612da05baaadaecfe`, version `0.5.12`.
- `npm run test:candidate` passed.
- `npm run test:release -- --expected-commit 058fe…` passed. Published `v0.5.12` APK (5,589,035 bytes, `ed96782a…d2ae272b`) and AAB (5,409,557 bytes, `a217c32f…37d8601`) match SHA256SUMS, release provenance, embedded `build.json`, tag, and source commit.
- The release test also unpacked the APK and proved the packaged PWA's demo erases demo state through Start for real, Locker, and the wordmark while preserving real sentinels.
- `npx cap sync android` completed with no tracked source diff.

## Local quality gates — PASS after clean install

- `npm ci`: passed; 189 packages installed; audit reported zero vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/`.
- `npm run test:unit`: 23/23 passed.
- A complete later `npm test`: 23 Vitest tests and 40 Playwright tests passed.
- Initial production JS is 44,565 bytes / 15.40 KB gzip; CSS is 11,221 bytes / 3.35 KB gzip, both well below static budgets. The APK verifier WebAssembly is lazy-loaded only when a file is checked.

## Live functional and privacy checks — PASS

Fresh desktop and 390px `/demo` flows selected the genuine signed APK fixture, entered a source URL, verified v1/v2/v3, opened evidence, and exercised the specific removal confirmation. Both flows had zero page/console errors and only same-origin bodyless GET requests.

An independent 390px recovery flow confirmed:

- non-APK input says “This file is too short to be an APK.”;
- `not a url` is rejected by browser validation with “Please enter a URL.”;
- the known signed fixture yields package `android.appsecurity.cts.tinyapp`, version `1.0 · code 10`, a SHA-256 fingerprint, and verified signing history;
- that verification sends no request body and no third-party request.

The cold/demo request capture similarly contained only product-origin GETs (HTML, hashed JS/CSS, hero image); no APK, record, password, analytics, or account data was uploaded. Evidence: [`live-audit.json`](verification-evidence-18/live-audit.json) and [`live-invalid-normal.json`](verification-evidence-18/live-invalid-normal.json).

Response headers send HSTS, `nosniff`, strict-origin referrer policy, a restrictive Permissions-Policy, and CSP with `frame-ancestors 'none'`. HTML and service worker have short revalidation caching; manifest has one-day caching; hashed JS/CSS and verifier assets are one-year immutable. See [`headers.txt`](verification-evidence-18/headers.txt).

The only server-side product call is the Sociobot license/checkout service; there is no product sign-in, so Entra ID is not applicable. One client made 31 invalid-license verification calls: requests 1–30 returned 200 and request 31 returned **429** with `Retry-After: 4`. See [`rate-limit.json`](verification-evidence-18/rate-limit.json).

## Accessibility, responsive, PWA, and links — PASS

- Axe found **zero serious or critical** findings on `/`, `/demo`, `/privacy`, `/terms`, and a genuine 404, at desktop and 390px; the same held at 200% text.
- Every tested route has `lang=en`, exactly one H1 and one main landmark, route-specific title/description/canonical, no horizontal overflow, and no undersized visible links/buttons.
- Keyboard starts at Skip to content with a 3px light outline plus 7px dark outer ring. The APK dialog opens focused, Escape closes it, and focus returns to the trigger.
- Reduced-motion reports zero running animations. The PWA is controlled by `sw.js`, `registration.update()` found no waiting worker, and offline reload restored the demo banner and two sample records from `apk-locker-v22`.
- All rendered product/release links resolved below 400 after redirects.

The deliberate top-level 404 produces Chromium's expected failed-resource console message; no successful product route has a console/page error.

## Defects

| Severity | Finding | Required correction |
| --- | --- | --- |
| **Critical / release-blocking** | The required `hosted-checkout` claim test received HTTP 503 from the documented Sociobot checkout endpoint during the fresh clean verification. The product promises hosted checkout for the paid tier, but it was unavailable at test time. | Restore checkout availability/configuration and demonstrate stable 303-to-Dodo behavior across a fresh all-claims run. Re-run independent verification after the service is reliable. |

No product source was modified. This report, the evidence directory, and the handoff are the only intended changes.
