# Independent product verification 17 — FAIL

**Result:** **FAIL — reject candidate `d7186184975c193d520d40a14b27fb552067e8ce`.**

**Verified URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-30 UTC

**Work order:** `apk-provenance-locker-verify-17`

No product source was changed. This report and the verifier handoff are the
only intended repository changes.

## Acceptance decision

The requested candidate cannot be verified because that commit does not exist
in the supplied GitHub repository. The clean clone, `origin/main`, tag
`v0.5.11`, live web build, and published Android files all identify a different
commit: `d71861d6633f0e1d5c1d67e2ab1845a7f12e115f`.

Fresh functional, privacy, accessibility, offline, packaging, and performance
testing of that available commit is healthy. That does not make the requested
candidate releasable: source-to-deployment identity is a prerequisite for an
APK provenance product.

## Critical candidate identity failure

- Initial clean-clone HEAD and `origin/main`:
  `d71861d6633f0e1d5c1d67e2ab1845a7f12e115f`.
- `git fetch origin d7186184975c193d520d40a14b27fb552067e8ce`
  returned `fatal: remote error: upload-pack: not our ref ...`.
- GitHub's commit API returned HTTP 422 with `No commit found for SHA` for the
  requested candidate.
- `origin/main` and the peeled `v0.5.11` tag both point to `d71861d6633f...`.
- Live `/build.json` names version `0.5.11` and commit `d71861d6633f...`.
- The local build from the obtainable source has the same identity, and 13
  relevant local/live files were byte-for-byte equal.
- `npm run test:release -- --expected-commit
  d7186184975c193d520d40a14b27fb552067e8ce` failed with `Release notes do not
  bind the immutable source commit`.

The work order's candidate cannot be checked out, its tests cannot be run, and
the live product does not claim to be that candidate. This is release-blocking.

## Required opening gates

### Claims — available commit PASS; requested candidate untestable

`.factory/claims.json` exists. It has 26 unique claim IDs, and static inspection
found exactly one matching `@claim:<id>` test for every entry. After `npm ci`, I
ran every listed command separately through the demo entry point. All 26 passed
on `d71861d6633f...`:

- APK checks: `hash-check`, `signature-verification`, `v1-verification`,
  `tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
  `signer-drift`, and `apk-structure`.
- Storage and restore: `encrypted-export`, `password-not-stored`,
  `local-storage`, `android-backup-disabled`, `saved-copy-erasure`,
  `demo-sandbox`, `restore-import`, and `saved-apk-download`.
- Network, offline, release, and purchase: `no-account-network`,
  `apk-never-uploaded`, `offline-reload`, `offline-verification`,
  `release-assets`, `paid-unlock`, `free-core-features`, `revoked-license`, and
  `hosted-checkout`.

Those results cannot be attributed to the requested SHA because GitHub does
not contain it.

### Cold first read and one-click demo — PASS

The fresh first screen answers the required questions in plain words:

- What: **“Verify APKs before restoring.”**
- For whom: **“For Android users keeping APK files...”**
- First click: **“Try it with sample data”**, beside **“Open two sample APK
  records.”**

One click opened `/?demo=1`, showed the persistent **“Demo — sample data,
nothing is saved”** banner and two realistic records, with the first record
above the 390×844 fold. **Reset demo** and **Start for real** were visible.

## Clean install, tests, and production build — PASS on `d71861d6633f...`

- `npm ci`: passed; 189 packages installed; 0 vulnerabilities reported.
- `npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm test`: passed; 22 unit/config tests and 40 Playwright tests.
- `npm run build`: passed and produced `dist/`.
- `npm run test:release`: passed for `d71861d6633f...`.
- `npm run test:live`: passed on desktop and 390px mobile.
- `npx cap sync android`: passed without a tracked diff.
- Production JS: 44,565 bytes / 15.40 KB gzip.
- Production CSS: 11,221 bytes / 3.35 KB gzip.
- Hero WebP: 75,842 bytes. No web fonts ship.

## End-to-end and recovery behavior — PASS on the live deployment

A fresh 390px live flow confirmed:

- one click enters the isolated two-record demo;
- non-ZIP input recovers with **“This file is too short to be an APK.”**;
- an invalid source value is rejected with **“Please enter a URL.”**;
- the genuine signed fixture becomes
  `android.appsecurity.cts.tinyapp 1.0 (10)` with verified v1, v2, and v3;
- an 11-character export password is rejected and 12 characters are accepted;
- mismatched passwords recover with **“The two passwords do not match.”**;
- the encrypted `.locker` download contains no plaintext package name;
- a wrong restore password recovers with **“That password did not open this
  restore kit.”**;
- the correct password produces **“1 APK matches.”**

The full suite additionally exercised tampered signed content, malformed v3
lineage, v1-only signing, signer drift, downgrade warnings, removal
cancel/confirm, a 12 MiB saved copy, 20 saved APKs, import conflicts, and
byte-identical saved-copy download.

## Privacy, headers, caching, and request allowance — PASS

- The independent live verification/export/restore flow made five requests:
  `/demo`, the hashed JS and CSS, `wasm_exec.js`, and `apksig.wasm`. Every
  request was a bodyless GET to the product origin. No APK bytes, records,
  password, analytics, advertising, or account data left the browser.
- There were no application console or page errors. Chromium's expected
  failed-resource message occurred only for the deliberate top-level HTTP 404.
- Responses include HSTS, `nosniff`, strict-origin referrer policy, a restrictive
  camera/microphone/geolocation/payment policy, and a matching CSP with
  `frame-ancestors 'none'`.
- HTML, `build.json`, and `sw.js` use `public, must-revalidate, max-age=30`.
  The manifest uses one-day caching. Hashed JS/CSS and the APK verifier runtime
  use one-year immutable caching.
- The Sociobot license-verification endpoint allowed 30 requests from one
  client. Request 31 returned HTTP 429 with `Retry-After: 4`.
- The app has no product backend or sign-in. Backend concurrency/persistence
  and Entra identity-provider checks are not applicable.

## Accessibility, responsive behavior, and PWA — PASS

- Axe found zero serious or critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, and the real 404 at desktop and 390px mobile.
- Each route has `lang=en`, one H1, one main landmark, and a distinct title.
- All audited routes, including the repaired 404, fit 390px at 200% text with
  no horizontal overflow.
- Keyboard use starts at the skip link. Enter reaches the main heading. The
  designed 3px light outline plus dark outer ring is visible. Dialogs focus
  their first input, Escape closes them, and focus returns to the trigger.
- Visible controls have 44px targets; the 20px checkbox is inside a 44px label.
- Reduced-motion mode leaves zero moving or transitioning elements and zero
  running animations.
- The live service worker controls `/demo`; `registration.update()` completes
  with no waiting worker; only `apk-locker-v21` remains. With browser HTTP cache
  disabled and the context offline, reload restores the shell, demo banner,
  and both records without errors.

## Deployment and Android package evidence — PASS for the wrong commit

The local and live copies of `index.html`, 404 assets, build identity, manifest,
service worker, hero, sitemap/robots, hashed JS/CSS, and APK verifier runtime
were byte-for-byte equal. All rendered links resolved below HTTP 400 after
redirects; the checkout claim separately observed the required HTTP 303 to the
Dodo-hosted session.

Published v0.5.11 evidence:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| APK | 5,589,020 | `82f72971ba14acbd7f75a472bbfff408704f30d5b9849e8b199e35943682b719` |
| AAB | 5,409,542 | `1b45f5826e44f683dedb6c369fb0cf636f936e2e51633d57e0e598f383459345` |

Both archives pass ZIP integrity and `SHA256SUMS`. Their embedded web builds,
tag, release notes, and source record all name `d71861d6633f...`. Independent
binary-manifest parsing found package `in.sociobot.apk_provenance_locker`,
version name `0.5.11`, version code 16, launcher activity
`in.sociobot.apk_provenance_locker.MainActivity`, and `allowBackup=false`.
Permissions are Internet and the app's private dynamic-receiver permission;
there is no storage, camera, microphone, or location permission.

## Performance — PASS

Five fresh throttled mobile Lighthouse runs scored 87, 92, 89, 100, and 94;
the median performance score is **92**. Accessibility, best practices, and SEO
were **100** in every run. Across the runs, FCP was 0.90–1.07 s, LCP was
1.35–1.53 s, CLS was 0, and initial transfer was about 95 KiB. Lighthouse does
not provide lab INP. The bundle budgets pass.

## Defects

| Severity | Finding | Required correction |
| --- | --- | --- |
| **Critical** | Candidate `d7186184975c193d520d40a14b27fb552067e8ce` is absent from the supplied repository and GitHub. The clean clone, live deployment, v0.5.11 tag, release notes, source record, APK, and AAB all identify `d71861d6633f0e1d5c1d67e2ab1845a7f12e115f`. | Supply and push the exact candidate commit, then build, publish, and deploy artifacts whose immutable identity matches it; or correct the work order to the actual commit and rerun independent verification. |

**Final disposition: FAIL.**
