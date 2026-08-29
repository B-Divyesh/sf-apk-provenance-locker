# Independent product verification 13 — PASS

**Result:** **PASS — accept candidate `728decf811fe84104d57a778ad2edd85fd1eece8`.**

**Live URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-29 UTC

**Work order:** `apk-provenance-locker-verify-13`

Product code was not changed. This report, the handoff update, and the small
`verification-evidence-13/` output from the factory URL checker are the only
repository changes made by this verification.

## Opening acceptance gates

### Claims — PASS

`.factory/claims.json` exists and contains 25 claims. From the clean
checkout, after `npm ci`, I invoked every declared `npm test -- --grep
@claim:<id>` command separately against the product's demo entry point. Each
selected its one tagged Playwright test and completed without a reported
failure. A fresh aggregate `npm test -- --grep @claim:` selected all **25**
claim tests; the subsequent complete browser run recorded
`test-results/.last-run.json` as `{"status":"passed","failedTests":[]}`.

The claims include real v1/v2/v3 signature and lineage checks, tamper and
malformed-lineage rejection, encrypted export/import, password non-storage,
demo isolation/erasure, offline reload and verification, request logging,
license behavior, and direct release links. There is no missing or failed
claim gate.

### Cold first read and one-click demo — PASS

A new 390×844 browser context opened the live root with no retained storage.
The first screen says **“Verify APKs before restoring”**, says it is **for
Android users keeping APK files**, says that it checks each app/version/signing
history/SHA-256 before reinstall, and presents **“Try it with sample data —
Open two sample APK records.”** This answers what it does, for whom, and what
to click first in plain words.

One click reached `/?demo=1`, displayed the persistent **“Demo — sample data,
nothing is saved”** banner and its Reset/Start-for-real controls, and showed
two sample records. That flow had zero page/console errors and only the
product origin in its request log.

## Clean candidate and end-to-end checks — PASS

- `npm ci`: passed (189 packages; npm audit reported 0 vulnerabilities).
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed: 17/17 unit/config tests and 38/38 browser tests.
- `npm run test:live`: passed at both 1280 px desktop and 390 px mobile. It
  used the genuine signed APK fixture, verified it, exercised the removal
  confirmation, observed five same-origin GETs per run, and saw zero errors.

Independent live product exercises additionally found:

- An invalid 3-byte `broken.apk` was rejected with **“This file is too short
  to be an APK.”** In the same dialog, selecting the genuine v1 fixture then
  completed verification with no error.
- I recorded 20 distinct filename instances of the genuine v1 signed fixture,
  exported a password-encrypted restore kit (183,282 bytes), opened it in a
  fresh demo context, and received **“20 APKs match.”** No console or page
  error occurred. This directly exercises the brief's 20-item restoration
  outcome (the two bundled demo metadata entries have no saved APK bytes and
  are not counted as matches).
- The full suite covers v1/v2/v3 + lineage, changed signed bytes, malformed
  ZIP structure, downgrade and signer-drift warnings, conflict import choice,
  wrong-password recovery, saved-copy deletion, 12 MiB copy export, direct
  saved-APK download, and service-worker update cleanup.

## Deployment and Android provenance — PASS

Live `/build.json` and the fresh local `dist/build.json` both identify product
`apk-provenance-locker`, version `0.5.3`, and exact commit
`728decf811fe84104d57a778ad2edd85fd1eece8`. Fresh live-vs-local byte checks
matched the build JSON, service worker, manifest, 42,820-byte JS bundle,
11,085-byte CSS bundle, hero image, and 5,828,623-byte verifier WASM.

`npm run test:release` downloaded the published v0.5.3 release and passed all
checksum, identity, and packaged runtime assertions:

- APK: 5,588,353 bytes, SHA-256
  `ae030e700c55c434464acb8c82eb250763201b9d98ae18d18a71c2ae6a7f724e`.
- AAB: 5,408,859 bytes, SHA-256
  `e67d2a3711d025435bd12ae8979b8991ee9d3589674f7a1389269de2f5d78968`.
- Both embed v0.5.3 and exact commit `728decf…`; APK and AAB contain their
  Android manifests and `assets/public/build.json`.
- Against web assets extracted from the actual APK, **Start for real**,
  **Locker**, and the wordmark each erased demo records, demo saved-copy DB,
  and demo license/verdict; all preserved real sentinels, reseeded two records
  on the next `/demo`, and emitted no browser errors.

This is fresh evidence that the deployment-only failure reported in
verification 12 (the stale v0.5.2 Android artifact retaining demo state) is
resolved. The published package now has the candidate's identity and behavior.

The checked-in Android configuration sets application id
`in.sociobot.apk_provenance_locker`, version code 8/version name 0.5.3, and
disables Android backup/transfer. The downloaded APK contains the binary
`AndroidManifest.xml`; the release workflow's artifact gate verifies the same
package identity, backup flags, and signature before release. This container
does not include Android `aapt`/`apksigner`, so their binary-manifest display
could not be redundantly rerun here; the package checksum, embedded identity,
unzip inspection, and packaged-runtime test were independently rerun.

## Privacy, PWA, accessibility, headers, and performance — PASS

- The live landing/demo/real APK verification flow made only same-origin GET
  requests, carried no request bodies, uploaded no fixture bytes, made no
  account/analytics/GitHub API request, and produced zero errors. The only
  optional external endpoint is an explicit license verification request to
  `api.sociobot.in`.
- Response headers on `/` include HSTS, `X-Content-Type-Options: nosniff`,
  strict-origin referrer policy, camera/microphone/geolocation/payment denial,
  and a restrictive CSP with `frame-ancestors 'none'`. HTML/build/SW revalidate
  after 30 seconds; hashed JS/CSS and WASM use one-year immutable caching.
- Fresh live axe scans at desktop and 390 px found **zero serious or critical
  violations** on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404.
  Each normal route has its own title, `lang=en`, exactly one h1 and main, and
  no horizontal overflow at 390 px. The intentional 404 navigation produces a
  browser resource-404 console line, but normal routes have no errors.
- Keyboard starts at the visible skip link. Its focus treatment is a 3 px
  light outline plus dark 7 px ring; reduced-motion mode reported no nonzero
  transitions. The complete suite also verifies dialog focus/trap/return,
  Escape, target size, and 200% reflow.
- `/opt/fleet/lib/verify-url.sh` passed against the live root: 630 ms load,
  title/lang/main/h1/alt/button-label checks all pass, zero errors. Its exact
  JSON and screenshots are in `.factory/verification-evidence-13/`.
- Service worker offline reload and offline signature verification claims pass
  in the fresh browser suite. The initial JS (14.77 KiB gzip), CSS (3.29 KiB
  gzip), and 75,842-byte hero are within budgets. A fresh valid mobile
  Lighthouse performance run scored 93, LCP 1.50 s, CLS 0, TBT 331 ms, and
  95,617 bytes transfer.

## Server allowance and authentication — PASS

There is no product sign-in or product backend. A fresh same-client burst to
the optional Sociobot license-verify endpoint returned 200 for attempts 1–30;
attempt 31 (and 32–35) returned **429** with **`Retry-After: 4`**. Observed
allowance: 30 checks per burst window. The checkout path remains a hosted
Sociobot redirect; no other identity provider is used, so Entra sign-in is not
applicable.

## Defects and disposition

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

**Disposition: PASS.**
