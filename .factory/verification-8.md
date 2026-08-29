# Independent product verification 8 — FAIL

**Result:** **FAIL — do not release candidate `7390b1f5f1ffe20053e37005b5c9f254df212d2c` as the Android product.**  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Work order:** `apk-provenance-locker-verify-8`

The web deployment is the requested candidate and its core workflow works.
The downloadable Android artifacts are not that candidate, however. The APK
contains an older web build that still deletes records immediately. The
candidate also leaves private app data eligible for Android backup and misses
two explicit accessibility baselines. These are release blockers for an
`android-apk` product.

## Release-blocking findings

### Critical — the downloadable APK/AAB are stale and omit the candidate's safety repair

The published `v0.4.0` release is built from
`152ed6e25a66eb5ddae98d583c997d535bb736de`, not the requested candidate
`7390b1f5f1ffe20053e37005b5c9f254df212d2c`:

- GitHub's release body says `Built from 152ed6e…`, and annotated tag `v0.4.0`
  resolves to that commit.
- `assets/public/build.json` inside both release packages identifies commit
  `152ed6e…`; the live and local candidate `build.json` identify `7390b1f…`.
- The APK embeds `assets/index-DMh9mDqA.js`, while the candidate builds
  `assets/index-CQGhKtuq.js`; the embedded `index.html` does not match the
  candidate.
- The packaged JavaScript binds the Remove control directly to deletion. It
  has no **Keep record** / **Remove record** confirmation. The candidate added
  that confirmation specifically to repair verification 7. The package also
  has service-worker cache `apk-locker-v7`, versus candidate `apk-locker-v8`.

This means the main downloadable artifact does not deliver the reviewed
candidate and retains the destructive behavior the candidate was meant to
repair. Publish a new version/tag whose embedded `build.json` is the exact
accepted source commit, then update the deterministic landing links and hash.

The existing downloads are otherwise real and internally consistent. The APK
is 5,585,535 bytes; the AAB is 5,406,182 bytes; both match `SHA256SUMS`. The
live verifier reads the APK as package
`in.sociobot.apk_provenance_locker`, version `0.4.0` / code `4`, SHA-256
`05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0`,
with verified v1 and v2 signatures.

### High — installed-app data is eligible for Android backup

`android/app/src/main/AndroidManifest.xml` sets
`android:allowBackup="true"` and defines neither `dataExtractionRules` nor
`fullBackupContent` exclusions. The same setting exists at the release's
`152ed6e…` source. Android may therefore copy the WebView's localStorage and
IndexedDB app data through Auto Backup or device transfer.

That data can include APK records, optional APK bytes, and a saved Plus token.
This conflicts with “Records and saved APK copies stay on this device” and the
brief's device/user-controlled backup constraint. The browser claim test
cannot detect this native configuration. Disable Android backup or provide
explicit rules that exclude all locker and license storage, then add an
Android-manifest claim check.

### Medium — focus indicators fail the required 3:1 contrast on light surfaces

The global focus outline is `#ff9a6f`. It is clear against the dark page
(`7.81:1`), but its contrast is only `1.62:1` against moss paper
`#dce8c6`, `1.83:1` against warm pulp `#f7f0df`, and `2.08:1` against white.
Inputs and many controls use those light adjacent surfaces. This misses the
attached accessibility requirement of a focus ring with at least 3:1
contrast, despite the ring being present and axe reporting no automated
violation.

### Medium — the saved-copy checkbox has a 22 px touch target

At 390 px, the checkbox itself measures 13×13 px and its clickable wrapping
label measures 397×22 px. The required minimum is 44×44 CSS px. All other
sampled visible controls met the baseline.

## Mandatory opening gates

### Claim tests — PASS

`.factory/claims.json` exists. After a clean `npm ci`, every exact listed test
was run separately. Each selected one Playwright test and passed from `/demo`:

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
| `revoked-license` | `npm test -- --grep @claim:revoked-license` | PASS |
| `hosted-checkout` | `npm test -- --grep @claim:hosted-checkout` | PASS |

The web claims are substantively exercised: exact hashes and package identity,
v1/v2/v3 cryptographic checks, malformed lineage/tamper rejection, signer and
downgrade warnings, encrypted round-trip, storage erasure, demo separation,
offline use, network privacy, release links, and paid-license behavior. The
native backup eligibility above is an uncovered platform-level contradiction.

### Cold first read — PASS

A fresh 1440×900 context opened `/` with no saved state. The first viewport
answers all three required questions in plain words:

- What: **“Verify APKs before restoring.”**
- For whom: **“For Android sideloaders…”**
- First action: **“Try it with sample data”**, followed by “See a
  ready-to-check locker.”

One click opened `/demo`, immediately displayed realistic F-Droid and KeePassDX
records, and showed the persistent “Demo — sample data, nothing is saved”
banner with **Reset demo** and **Start for real**. Independent screenshots are
in `.factory/verification-evidence-8/`.

## Build and test evidence

- Clean `npm ci`: 189 packages; 0 audit vulnerabilities.
- `npm audit --audit-level=high`: PASS.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run test:unit`: PASS, 17 tests.
- `npm run test:browser`: PASS, 31 tests.
- `npm test`: PASS, the same 17 unit and 31 browser tests.
- Exact `npm run build`: PASS; `dist/` produced.
- `npx cap sync android`: PASS.
- `npm run test:live`: PASS at desktop and 390 px; each verified a genuine APK
  and safely cancelled removal with seven same-origin GETs and no errors.
- Factory `verify-url.sh`: PASS (HTTP 200, title, `lang=en`, one h1, main,
  image alt text, labeled buttons, no console errors).

## Live candidate identity and deployment

The web deployment does match the requested candidate:

| File | Local/live SHA-256 |
| --- | --- |
| `index.html` | `b4e1a64db2093c331d77ccec2f1ce2301b0b9fedc5193297c49a893b58918c5a` |
| `assets/index-CQGhKtuq.js` | `23a80dceab6102a950b00e205c02fc7b654be2995d511a5f8b140757bf93b32b` |
| `assets/style-DInr33HP.css` | `b0e5ce7c8c06fad398c62f1dd14a5d77079234d7eb250db86d7b9563573b2ac0` |

Live `/build.json` names commit `7390b1f5f1ffe20053e37005b5c9f254df212d2c`.
`/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns the
designed 404 with HTTP 404. Internal links return 200; checkout returns 303 to
`checkout.dodopayments.com`; direct GitHub asset links return download
redirects and completed successfully.

## End-to-end behavior

On the live `/demo` in fresh contexts:

- Empty required input was blocked. A non-ZIP `.apk` reported “This file is too
  short to be an APK”; replacing it with the signed lineage fixture recovered.
- The verifier returned package `android.appsecurity.cts.tinyapp`, version
  `1.0` / code `10`, the exact expected SHA-256, v1/v2/v3 verification, and a
  three-certificate lineage.
- Mismatched export passwords produced a specific error. The corrected export
  contained no plaintext package name. A wrong restore password failed, and
  the correct password then produced **1 APKs match**.
- Cancelling removal retained the record. Confirming removal erased metadata
  and reduced the separate demo IndexedDB file count to zero.
- A 20-record saved-copy set exported to a 633,802-byte encrypted kit and
  revalidated with **20 APKs match** and 20 matching provenance results.
- The local suite separately covers tampered bytes, malformed lineage, signer
  drift, downgrade risk, v1-only APKs, and a 12 MiB saved-copy export.

## Privacy, network, rate limiting, and headers

The complete live verification/export/removal flow made six requests, all
bodyless same-origin GETs for the document, hashed JS/CSS, hero image, and
self-hosted verifier JS/WASM. There were no analytics, fonts, third-party
scripts, APK uploads, console errors, or page errors.

The optional license endpoint was tested independently. In a fresh 100-request
burst from one client, 30 responses were HTTP 200 and the next 70 were HTTP
429. Every 429 carried `Retry-After: 4`. CORS allowed only the supplied product
origin in this test. The hosted checkout returned HTTP 303 to a Dodo checkout
session. There is no product backend or sign-in flow, so persistence/concurrency
and Microsoft Entra authority checks are not applicable.

Live documents send HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, strict
origin referrer policy, and a restrictive permissions policy. The manifest is
served as `application/manifest+json`; verifier code as `application/wasm`.
Hashed JS/CSS and verifier assets use one-year immutable caching; HTML and the
service worker revalidate after 30 seconds.

## Accessibility, mobile, PWA, and performance

- Axe 4.13 found zero violations (zero serious/critical) on `/`, `/demo`,
  `/privacy`, and `/terms` at 1440 px and 390 px.
- Every route has `lang=en`, its own descriptive title, exactly one h1, and one
  main landmark. There was no horizontal overflow, including at 200% text.
- Keyboard order begins with the skip link; activating it moves focus into
  main content. Client navigation focuses the new h1. Dialog Escape/focus
  return tests pass. The focus contrast defect is listed above.
- Reduced-motion emulation found no nonzero animation or transition duration.
- Offline reload worked with the browser HTTP cache disabled, sample records
  remained available, and a v1 APK verified offline. The active worker used
  only `apk-locker-v8` after an update check.
- Initial JS is 38,973 B raw / 13,875 B gzip; CSS is 10,256 B raw / 3,069 B
  gzip; no web fonts; hero WebP is 75,842 B. All static asset budgets pass.
- Three mobile Lighthouse 12.8.2 runs scored Performance 86/91/100 (median
  91), Accessibility 100, Best Practices 100, and SEO 100. Median FCP was
  0.91 s, LCP 1.45 s, CLS 0, and TBT 366 ms. Lighthouse did not produce an INP
  field measurement.

## Evidence and disposition

Machine-readable browser evidence, full Lighthouse reports, screenshots, and
the factory URL-verifier output are under
`.factory/verification-evidence-8/`.

Do not release this candidate as complete. Publish Android artifacts built
from the accepted commit, prevent Android backup of private locker data, use a
focus treatment with at least 3:1 adjacent contrast on every surface, and make
the checkbox label at least 44 px high. Then repeat verification from a clean
checkout and confirm the new APK's embedded build identity before acceptance.
