# Independent product verification 12 — FAIL

**Result:** **FAIL — do not accept candidate
`a1bb113c40a1d4e6d5d88bf54ff58c902f3d830a`.**

**Live URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-29 UTC

**Work order:** `apk-provenance-locker-verify-12`

Product code was not changed. This report, the handoff, and verification
evidence are the only committed changes.

## Release-blocking finding

### High — the advertised Android APK is not the candidate and violates its demo-erasure contract

The live web deployment is current, but the downloadable Android product is
not. Live `/build.json` and the clean local build both identify exact candidate
`a1bb113c40a1d4e6d5d88bf54ff58c902f3d830a`. The v0.5.2 APK linked by the
landing page embeds `/assets/public/build.json` for
`752f078cf2c007e013182e34fedb5240c636427a`.

That difference is functional. Candidate commit `e4d1f4e`, between the tagged
APK and this candidate, fixed demo exit isolation. I served the web assets
directly from the downloaded APK and left `/demo` through both the wordmark and
the **Locker** link after writing demo records, an IndexedDB saved copy, and a
demo license. In both cases the packaged app kept the demo records, saved-copy
database, and license. The wordmark path also kept showing the demo banner on
`/`; the Locker path hid the banner while retaining the demo data. This breaks
the declared `demo-sandbox` claim and the privacy statement that leaving the
demo erases its separate storage.

Exact reproduction output is in
`.factory/verification-evidence-12/stale-apk-demo-exits.json`. Current web JS
SHA-256 is
`5001b604cbccf4682afce2c2216be4f72466402152fd79cb3c3456c1c0c0daaa`;
packaged JS SHA-256 is
`fe8d0e86f80cd06637e55c2a124f1638f9cef3587b0a38672eff71fb12c21a29`.

Required repair: publish a new version/tag from the repaired candidate, let the
Android workflow produce new APK/AAB/SHA256SUMS assets, update the web and
README links, and rerun the packaged demo-erasure claim against those assets.

## Mandatory opening gates

### Claims — PASS locally, but the shipped APK contradicts one claim

`.factory/claims.json` exists with 25 entries. After `npm ci`, every exact
declared command was invoked separately against the demo entry point. Each
selected test reported one passing test and exit status 0. Logs are under
`.factory/verification-evidence-12/claims/`.

| Claim | Result |
| --- | --- |
| `hash-check` | PASS |
| `signature-verification` | PASS |
| `v1-verification` | PASS |
| `tamper-rejection` | PASS |
| `lineage-integrity` | PASS |
| `apk-identity` | PASS |
| `downgrade-risk` | PASS |
| `signer-drift` | PASS |
| `apk-structure` | PASS |
| `encrypted-export` | PASS |
| `password-not-stored` | PASS |
| `local-storage` | PASS |
| `android-backup-disabled` | PASS |
| `saved-copy-erasure` | PASS |
| `demo-sandbox` | PASS locally; FAIL in shipped APK |
| `no-account-network` | PASS |
| `apk-never-uploaded` | PASS |
| `offline-reload` | PASS |
| `offline-verification` | PASS |
| `release-assets` | PASS for link availability; artifact is stale |
| `paid-unlock` | PASS |
| `revoked-license` | PASS |
| `hosted-checkout` | PASS |
| `restore-import` | PASS |
| `saved-apk-download` | PASS |

The local claim suite therefore does not protect the packaged Android product
from drifting behind the candidate.

### Cold first read — PASS

A new 390 px browser context opened the live root. The first screen says
“Verify APKs before restoring,” names Android users keeping APK files, and
shows **Try it with sample data** with “Open two sample APK records.” One click
opens `/?demo=1`, immediately renders two realistic records, and shows the
persistent “Demo — sample data, nothing is saved” banner with **Reset demo**
and **Start for real**. Evidence:
`.factory/verification-evidence-12/first-read-mobile.png` and
`live-demo-mobile.png`.

## Clean candidate gates — PASS

- `npm ci`: passed; 189 packages installed; npm audit reported 0
  vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm test`: passed: 17/17 unit/config tests and 38/38 browser tests.
- Exact `npm run build`: passed and produced `dist/`.
- `npm run test:live`: passed on desktop and 390 px mobile with a genuine
  signed APK, five same-origin GETs per run, and zero browser errors.

## Independent end-to-end behavior — PASS on web

- Verified a genuine v1-only APK, first rejecting `broken.apk` with “This file
  is too short to be an APK,” then recovering in the same dialog and recording
  the valid APK.
- Exercised the full 20-record success path: exported a password-encrypted kit
  containing 20 saved signed APK copies, reopened it, and obtained “20 APKs
  match” with 20 matching entries. No third-party request, upload, console
  error, or page error occurred. Evidence:
  `.factory/verification-evidence-12/live-20-records.json` and
  `live-20-record-validation.png`.
- The full browser suite separately covers v1/v2/v3 and lineage, tampering,
  invalid lineage, signer drift, downgrade risk, malformed ZIP structure,
  password mismatch/wrong password, restore import, deletion confirmation,
  and a 12 MiB saved copy.
- Every discovered navigation/download link returned 200; hosted checkout was
  separately verified as a 303 redirect to Dodo.

## Privacy, accessibility, and PWA — PASS on web

- The live landing-to-demo verification/reset flow made only same-origin GET
  requests. There were no request bodies, analytics, account requests, GitHub
  API calls, console errors, or page errors. APK bytes were not uploaded.
- `/`, `/demo`, `/privacy`, and `/terms` each returned 200, used a route title,
  `lang="en"`, one h1, and one main landmark. An unknown route returned the
  designed HTTP 404.
- Axe reported zero serious/critical findings on all routes and no violations
  in the independent route sweep. Keyboard focus starts at the visible skip
  link; its 3 px light outline and 7 px dark outer ring are visible. The skip
  action moves focus into main content. Modal focus enters the file input,
  stays trapped natively, closes with Escape, and returns to its trigger.
- At 390 px and at 200% text, document width remained 390 px. Reduced motion
  produced `0s` transitions and automatic scrolling.
- The service worker controlled the page, `registration.update()` completed,
  only cache `apk-locker-v12` remained, and `/demo` reloaded offline with both
  samples after the first visit.
- Security headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and CSP with `frame-ancestors 'none'`.
  Hashed JS/CSS and verifier assets are one-year immutable; HTML, build
  identity, and the service worker revalidate after 30 seconds.

## Performance and web deployment — PASS

- Initial JS: 42,820 B raw / 14,620 B gzip.
- CSS: 11,085 B raw / 3,296 B gzip.
- Hero WebP: 75,842 B; no downloaded fonts; Lighthouse first load: 94 KiB.
- Three valid fresh live Lighthouse runs scored 86, 96, and 100 performance
  (median 96), with accessibility 100. LCP was 1.4–1.5 s and CLS was 0.
  Best Practices and SEO were 100 on the full-category run. One earlier run
  ended with a browser-tab crash and was excluded.
- Live `index.html`, `build.json`, JS, CSS, service worker, hero image,
  manifest, verifier loader, and 5.83 MB verifier WASM are byte-identical to
  the local candidate build. The web deployment is not the failure.

## Android artifact evidence

The landing links returned 200 for:

- APK: 5,588,120 B; SHA-256
  `67adb0d6c6bf80ceb17ed0db8c8896fc74337c31eba779e24c83e44cfe76ce4c`.
- AAB: 5,408,642 B; SHA-256
  `4c60c62d932390f5051ada05409759920a09e0aa08793f95edaa6267dd0c8d3c`.
- `SHA256SUMS`: both published hashes match the downloaded files.

The APK contains `AndroidManifest.xml`, `classes.dex`, and Capacitor web
assets. Feeding the release APK through the product verified its v1 and v2
signatures and extracted package `in.sociobot.apk_provenance_locker`, version
name `0.5.2`, version code `7`, and the published SHA-256. The AAB contains
`base/manifest/AndroidManifest.xml`. These checks establish that the packages
are real and internally consistent, but not that they contain the candidate;
their embedded build identity proves they do not.

## Billing allowance — PASS

The only server endpoint used by the product is optional Sociobot license
verification. A fresh same-client burst accepted 30 invalid-license checks
with HTTP 200; attempt 31 returned HTTP 429 with `Retry-After: 4`. The observed
allowance is therefore 30 requests in that burst window. The checkout endpoint
returned HTTP 303 to `checkout.dodopayments.com`. There is no product sign-in
or product backend, so Entra, backend health, concurrency, and server
persistence checks do not apply.

## Defects and disposition

- Critical: none.
- High: 1 — the linked Android APK/AAB are stale relative to the candidate;
  the APK retains demo records, saved APK bytes, and the demo license on exit
  paths that the candidate and privacy copy say erase them.
- Medium: none.
- Low: none.

**Disposition: FAIL.** The previous deployment-only concern is resolved for
the web deployment. Acceptance remains blocked by the stale Android release.
