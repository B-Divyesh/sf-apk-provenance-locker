# Independent product verification 15 — PASS

**Result:** **PASS — accept candidate `b6d8aeb8c9e1728fe9c905ce19253b922ccf2aa3`.**

**Verified URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-29 UTC

**Work order:** `apk-provenance-locker-verify-15`

No product source was changed. This report, the handoff update, and independent
QA evidence are the only intended repository changes.

## Acceptance decision

The candidate performs the brief's real job end to end. A user can verify a
lawful APK's cryptographic signature, package identity, version, signing
history, and SHA-256 file fingerprint; detect signer and downgrade risk; keep
an optional local copy; export a password-encrypted restore kit; validate and
import it later; and download a matching saved copy. The PWA works offline
after first use, and the published Android APK and AAB now bind to this exact
source commit.

The previous verifier's only critical finding is repaired. The old release
served stale v0.5.5 packages from `0809df8…`. The current v0.5.7 tag, release
notes, APK, AAB, checksums, provenance record, web deployment, and packaged
`build.json` all identify `b6d8aeb8c9e1728fe9c905ce19253b922ccf2aa3`.

## Required opening gates

### Claims — PASS

`.factory/claims.json` exists and contains 26 unique claims with 26 unique
commands and exactly one matching browser-test tag each. I first invoked the
commands in the untouched checkout, before dependency installation as the
work order requested; those invocations could not start Playwright because
the declared `@playwright/test` dev dependency was not installed. After the
required clean-checkout `npm ci`, I invoked every exact command independently
against the demo entry point. All 26 passed:

| Claim group | Result |
| --- | --- |
| `hash-check`, `signature-verification`, `v1-verification`, `tamper-rejection`, `lineage-integrity`, `apk-identity` | PASS |
| `downgrade-risk`, `signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`, `local-storage` | PASS |
| `android-backup-disabled`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`, `apk-never-uploaded` | PASS |
| `offline-reload`, `offline-verification`, `release-assets`, `paid-unlock`, `free-core-features`, `revoked-license` | PASS |
| `hosted-checkout`, `restore-import`, `saved-apk-download` | PASS |

The pre-install bootstrap error is not a failed product claim: no test or demo
ran until its lockfile dependencies were installed. The installed clean-clone
claim run is the release gate, and it is fully green. The landing page and
README claim cross-check found no unlisted behavioral promise; release
fallback is exercised by the offline claim, and the daily license cache is
asserted by the paid-unlock claim.

Evidence: `evidence/verification-15/claims-installed-summary.tsv` and
`claims-installed-run.log`.

### Cold first read and one-click demo — PASS

In fresh service-worker-blocked contexts at 1440×900 and 390×844, the first
screen says:

- what it does: **“Verify APKs before restoring”**, including signature,
  signing-history, version, and file-fingerprint checks;
- who it is for: **“Android users keeping APK files”**;
- what to click: **“Try it with sample data”**, next to **“Open two sample APK
  records.”**

That one click opened the used product above the fold with two realistic
records and a persistent **“Demo — sample data, nothing is saved”** banner,
**Reset demo**, and **Start for real**. This gate passes on both widths.

Evidence: `evidence/verification-15/first-read-desktop.png`,
`first-read-mobile.png`, and the matching text captures.

## Clean checkout and build gates — PASS

- Candidate HEAD: `b6d8aeb8c9e1728fe9c905ce19253b922ccf2aa3`.
- `npm ci`: passed; 189 packages installed, 0 vulnerabilities.
- `npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `npm run test:unit`: passed, 21/21.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm test`: passed, 21 unit/config plus 40/40 browser tests.
- `npm run build`: passed and produced `dist/`.
- `npx cap sync android`: passed without changing tracked files.
- Production JS: 45,624 bytes / 15,532 bytes gzip.
- Production CSS: 11,085 bytes / 3,296 bytes gzip.
- Hero WebP: 75,842 bytes. All are below their budgets.

## End-to-end behavior and boundaries — PASS

Independent live exercise covered:

- a genuine Android apksig v1/v2/v3 fixture with a three-certificate lineage;
- exact package `android.appsecurity.cts.tinyapp`, version `1.0`, code `10`,
  complete SHA-256, verified signer, and signing-history evidence;
- non-ZIP input rejection with **“This file is too short to be an APK”**, then
  successful recovery in the same dialog;
- malformed ZIP, tampered signed content, malformed lineage, v1-only signing,
  signer drift, and downgrade warnings in the claim/full suites;
- the 11-character password boundary, mismatched-password recovery, encrypted
  download, and a non-destructive removal cancellation;
- a 12 MiB saved-copy export without stack overflow in the full suite;
- removal confirmation and deletion of metadata plus IndexedDB bytes;
- clean import conflict choice, verified restore import, and byte-identical
  saved-copy download;
- **20 verified saved copies** exported in one kit and reopened with the live
  report **“20 APKs match”**, satisfying the brief's restoration-set boundary.

No console or page errors occurred in the independent flows.

## Live deployment and Android packages — PASS

Local `dist/` and live files are byte-for-byte identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `1afcaee0c9288af308e92cfc8f2ad56711482122d129b9eb2f3138b111bae7b3` |
| `assets/index-oWeLGtDW.js` | `9b4398e848b9b14f802daa5cdbf4b9470b1af25cdc8e48af89c77d29c4e7e31e` |
| `assets/style-Dxosa8K4.css` | `87c6dc48cf874d0d3809bec330e39cc76c70c74381633c62690d0862913f3534` |
| `sw.js` | `79645a44957503f193ea4e37d27d5e0bec04e9232778d2232ee9b5dd5592a281` |
| `manifest.webmanifest` | `ac611c9b82e581510964fbff203823d26c2acb3252608527524b0babe70fce78` |
| `build.json` | `14fec0023c0710d96ea5f37a49298ef1af25cbcaf2f78f31c7c4fe240e6f1fb3` |

`npm run test:release` downloaded and audited the public release:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `app-release.apk` | 5,589,279 | `e478785cbf3826b6886a4b63dfa382bb0ad4d68839d5bea59ccf45642ecbce72` |
| `app-release.aab` | 5,409,820 | `cf109f63c0594b771646ddd81ccaf2e104dcf5aeb9d7ebde91292964d154bce1` |

The v0.5.7 tag resolves to the candidate. Both packages embed the candidate
identity, checksums match `SHA256SUMS`, and `RELEASE_PROVENANCE.json` matches
their sizes and hashes. Independent binary-XML parsing of the downloaded APK
confirmed package `in.sociobot.apk_provenance_locker`, version code `12`, and
version name `0.5.7`. Both archives passed ZIP integrity checks. All four live
download links resolve to HTTP 200.

## Privacy, security, and server allowance — PASS

- Direct live demo, APK verification, 20-record export/validation, and reset
  recorded only bodyless GETs to the product origin plus one bodyless public
  GitHub release-metadata GET per page load. No APK bytes, record content,
  passwords, analytics, advertising, or account request left the browser.
- The optional paid-license flow sends only its token to
  `api.sociobot.in` after explicit use. The daily verdict cache was verified.
- The live response sends HSTS, `nosniff`, strict-origin referrer policy,
  restrictive camera/microphone/geolocation/payment permissions, and a CSP
  with `frame-ancestors 'none'`. No CSP console errors occurred.
- Documents and `sw.js` revalidate after 30 seconds; the manifest caches for
  one day; hashed JS/CSS and verifier assets cache for one year as immutable.
- The license-verify endpoint returned 200 for requests 1–30 from one client.
  Request **31** returned **429** with **`Retry-After: 4`**. Observed allowance:
  **30 requests per burst window**.
- There is no product backend or sign-in. Backend health/concurrency and Entra
  authority checks are therefore not applicable.

## Accessibility, responsive behavior, and PWA — PASS

- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: titles, `lang=en`,
  one h1, one main, image alt text, labeled buttons, and zero console errors.
- Independent axe scans on desktop and 390px found **zero violations**, hence
  zero serious or critical findings.
- The full suite passed keyboard-only skip link, Enter/Space activation,
  dialog focus/return, Escape close, designed 3:1 focus indicators, 44×44
  targets, semantic forms, and 200% text reflow.
- All routes have distinct titles, one h1, one main, descriptions, canonicals,
  shared navigation/footer, and no horizontal overflow. The real unknown URL
  returns a styled HTTP 404.
- Reduced-motion mode left zero moving elements across all routes.
- The live service worker controlled `/demo`, removed old cache versions,
  retained only `apk-locker-v17`, had no waiting worker after update, and
  reloaded two demo records offline with the HTTP cache disabled.

## Performance — PASS

Fresh live mobile Lighthouse on `/demo`:

| Metric | Result |
| --- | ---: |
| Performance | 95 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.99 s |
| LCP | 2.09 s |
| CLS | 0 |
| TBT | 238 ms |

An independent Event Timing smoke test measured the exercised mobile
interaction at 16 ms. Lighthouse did not expose a lab INP value.

## Defects and disposition

| Severity | Finding |
| --- | --- |
| Critical | None |
| High | None |
| Medium | None |
| Low | None |

**Final disposition: PASS.**
